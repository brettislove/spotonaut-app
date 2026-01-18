import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const PLACES_API_BASE_URL = "https://places.googleapis.com/v1";
const PLACES_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const SEARCH_RADIUS = 500; // meters
const CACHE_TTL_HOURS = 24;
const MONTHLY_LIMIT = 5000;

// Pro tier fields - optimized for cost
const PLACE_FIELDS = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.types",
].join(",");

export interface PlaceResult {
  id: string;
  displayName: string;
  formattedAddress?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  types: string[];
}

export interface PlacesSearchResult {
  competitors: PlaceResult[];
  footfallProxies: PlaceResult[];
  totalPlaces: number;
  usedCache: boolean;
}

/**
 * Generate a unique hash for location + businessType + radius combination
 */
function generateLocationHash(
  lat: number,
  lng: number,
  businessType: string,
  radius: number = SEARCH_RADIUS
): string {
  const data = `${lat.toFixed(6)}_${lng.toFixed(6)}_${businessType}_${radius}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Check if we have valid cached data for this location
 */
export async function getCachedPlaces(
  prisma: PrismaClient,
  lat: number,
  lng: number,
  businessType: string,
  radius: number = SEARCH_RADIUS
): Promise<PlacesSearchResult | null> {
  const locationHash = generateLocationHash(lat, lng, businessType, radius);
  const now = new Date();

  try {
    const cached = await prisma.placesApiCache.findUnique({
      where: { locationHash },
    });

    if (!cached) {
      return null;
    }

    // Check if expired
    if (cached.expiresAt < now) {
      // Delete expired cache entry
      await prisma.placesApiCache
        .delete({
          where: { locationHash },
        })
        .catch(() => {
          /* ignore deletion errors */
        });
      return null;
    }

    // Return cached data
    const placesData = cached.placesData as unknown as PlacesSearchResult;
    return {
      ...placesData,
      usedCache: true,
    };
  } catch (error) {
    console.error("Error reading from Places API cache:", error);
    return null;
  }
}

/**
 * Cache Places API results for 24 hours
 */
export async function cachePlaces(
  prisma: PrismaClient,
  lat: number,
  lng: number,
  businessType: string,
  radius: number = SEARCH_RADIUS,
  data: PlacesSearchResult
): Promise<void> {
  const locationHash = generateLocationHash(lat, lng, businessType, radius);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + CACHE_TTL_HOURS);

  try {
    await prisma.placesApiCache.upsert({
      where: { locationHash },
      update: {
        placesData: JSON.parse(JSON.stringify(data)),
        expiresAt,
      },
      create: {
        locationHash,
        lat,
        lng,
        businessType,
        radius,
        placesData: JSON.parse(JSON.stringify(data)),
        expiresAt,
      },
    });
  } catch (error) {
    console.error("Error caching Places API data:", error);
    // Non-critical - continue without caching
  }
}

/**
 * Check if we're within the monthly Places API quota
 */
export async function checkPlacesApiQuota(prisma: PrismaClient): Promise<{
  allowed: boolean;
  remaining: number;
  quotaExceeded: boolean;
}> {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;

  try {
    const usage = await prisma.placesApiUsage.findUnique({
      where: { month: currentMonth },
    });

    const count = usage?.count || 0;
    const remaining = MONTHLY_LIMIT - count;
    const quotaExceeded = count >= MONTHLY_LIMIT;

    return {
      allowed: !quotaExceeded,
      remaining,
      quotaExceeded,
    };
  } catch (error) {
    console.error("Error checking Places API quota:", error);
    // On error, allow the request but log it
    return {
      allowed: true,
      remaining: MONTHLY_LIMIT,
      quotaExceeded: false,
    };
  }
}

/**
 * Increment the monthly Places API usage counter
 */
export async function incrementPlacesApiUsage(
  prisma: PrismaClient
): Promise<void> {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;

  try {
    await prisma.placesApiUsage.upsert({
      where: { month: currentMonth },
      update: {
        count: { increment: 1 },
      },
      create: {
        month: currentMonth,
        count: 1,
        monthlyLimit: MONTHLY_LIMIT,
      },
    });
  } catch (error) {
    console.error("Error incrementing Places API usage:", error);
    // Non-critical - continue
  }
}

/**
 * Log Places API errors for monitoring fallback behavior
 */
export async function logPlacesApiError(
  prisma: PrismaClient,
  lat: number,
  lng: number,
  businessType: string,
  errorMessage: string,
  errorCode?: string
): Promise<void> {
  try {
    await prisma.placesApiError.create({
      data: {
        lat,
        lng,
        businessType,
        errorMessage,
        errorCode,
      },
    });
  } catch (error) {
    console.error("Error logging Places API error:", error);
    // Non-critical - continue
  }
}

/**
 * Search for nearby places using Google Places API (New)
 */
export async function searchNearbyPlaces(
  lat: number,
  lng: number,
  includedTypes: string[],
  maxResults: number = 20
): Promise<PlaceResult[]> {
  if (!PLACES_API_KEY) {
    throw new Error("GOOGLE_MAPS_API_KEY is not configured");
  }

  const requestBody = {
    includedTypes,
    maxResultCount: maxResults,
    locationRestriction: {
      circle: {
        center: {
          latitude: lat,
          longitude: lng,
        },
        radius: SEARCH_RADIUS,
      },
    },
    languageCode: "cs", // Czech language for results in Czech Republic
  };

  try {
    const response = await fetch(`${PLACES_API_BASE_URL}/places:searchNearby`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": PLACES_API_KEY,
        "X-Goog-FieldMask": PLACE_FIELDS,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Places API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return (data.places || []) as PlaceResult[];
  } catch (error) {
    console.error("Error calling Places API:", error);
    throw error;
  }
}

/**
 * Calculate distance between two coordinates in meters (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Search for competitors and footfall proxies with caching
 */
export async function searchPlacesWithCache(
  prisma: PrismaClient,
  lat: number,
  lng: number,
  businessType: string,
  competitorTypes: string[],
  footfallProxyTypes: string[]
): Promise<PlacesSearchResult> {
  // Check cache first
  const cached = await getCachedPlaces(prisma, lat, lng, businessType);
  if (cached) {
    console.log("Using cached Places API data for:", businessType);
    return cached;
  }

  // Check quota
  const quotaCheck = await checkPlacesApiQuota(prisma);
  if (!quotaCheck.allowed) {
    throw new Error(
      `Places API monthly quota exceeded (${MONTHLY_LIMIT} requests)`
    );
  }

  console.log("Fetching fresh Places API data for:", businessType);

  // Fetch competitors
  let competitors: PlaceResult[] = [];
  if (competitorTypes.length > 0) {
    try {
      competitors = await searchNearbyPlaces(lat, lng, competitorTypes, 20);
      await incrementPlacesApiUsage(prisma);
    } catch (error) {
      console.error("Error fetching competitors:", error);
      throw error;
    }
  }

  // Fetch footfall proxies
  let footfallProxies: PlaceResult[] = [];
  if (footfallProxyTypes.length > 0) {
    try {
      footfallProxies = await searchNearbyPlaces(
        lat,
        lng,
        footfallProxyTypes,
        15
      );
      await incrementPlacesApiUsage(prisma);
    } catch (error) {
      console.error("Error fetching footfall proxies:", error);
      throw error;
    }
  }

  const result: PlacesSearchResult = {
    competitors,
    footfallProxies,
    totalPlaces: competitors.length + footfallProxies.length,
    usedCache: false,
  };

  // Cache the result
  await cachePlaces(prisma, lat, lng, businessType, SEARCH_RADIUS, result);

  return result;
}
