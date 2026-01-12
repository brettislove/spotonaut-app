import { NextRequest, NextResponse } from "next/server";
import { getRelevantPropertyFilters } from "@/lib/constants/property-type-mapping";

// ==================== TYPES ====================

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface BoundingBox {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
}

export interface RealEstateListing {
  id: string;
  source: "sreality" | "bezrealitky";
  title: string;
  price: number;
  pricePerSqm?: number;
  currency: string;
  transactionType: "rent" | "sale";
  coordinates?: Coordinates;
  address: string;
  locality?: string;
  category: string;
  size?: number;
  url: string;
  images?: string[];
  labels?: string[];
  distanceMeters?: number;
}

// ==================== RATE LIMITING ====================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 1000; // 1 second
const MAX_REQUESTS_PER_WINDOW = 1;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (entry.count < MAX_REQUESTS_PER_WINDOW) {
    entry.count++;
    return true;
  }

  return false;
}

async function waitForRateLimit(key: string): Promise<void> {
  while (!checkRateLimit(key)) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

// ==================== CACHING ====================

interface CacheEntry {
  data: RealEstateListing[];
  timestamp: number;
}

const listingsCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

function getCacheKey(
  lat: number,
  lng: number,
  radius: number,
  businessType: string
): string {
  // Round coordinates to 3 decimals (~100m precision) for cache key
  const roundedLat = Math.round(lat * 1000) / 1000;
  const roundedLng = Math.round(lng * 1000) / 1000;
  return `${roundedLat},${roundedLng},${radius},${businessType}`;
}

function getCachedListings(key: string): RealEstateListing[] | null {
  const entry = listingsCache.get(key);
  if (!entry) return null;

  const age = Date.now() - entry.timestamp;
  if (age > CACHE_TTL_MS) {
    listingsCache.delete(key);
    return null;
  }

  console.log(`Cache hit for ${key}, age: ${Math.round(age / 1000 / 60)}min`);
  return entry.data;
}

function setCachedListings(key: string, data: RealEstateListing[]): void {
  listingsCache.set(key, {
    data,
    timestamp: Date.now(),
  });

  // Clean old entries
  if (listingsCache.size > 100) {
    const now = Date.now();
    for (const [k, v] of listingsCache.entries()) {
      if (now - v.timestamp > CACHE_TTL_MS) {
        listingsCache.delete(k);
      }
    }
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Calculate bounding box from center coordinates and radius
 * @param lat Center latitude
 * @param lng Center longitude
 * @param radiusMeters Radius in meters
 */
function calculateBounds(
  lat: number,
  lng: number,
  radiusMeters: number
): BoundingBox {
  // Approximate conversion: 1 degree latitude = 111km
  // 1 degree longitude = 111km * cos(latitude)
  const latDelta = radiusMeters / 111000;
  const lngDelta = radiusMeters / (111000 * Math.cos((lat * Math.PI) / 180));

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

/**
 * Calculate distance between two coordinates in meters
 */
function calculateDistance(
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
 * Fetch with retry logic and exponential backoff
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Handle rate limiting (429)
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
        console.warn(`Rate limited by server, retrying after ${delay}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Handle server errors (5xx) with exponential backoff
      if (response.status >= 500) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(
          `Server error ${response.status}, retrying after ${delay}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      return response;
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;

      const delay = Math.pow(2, attempt) * 1000;
      console.warn(
        `Request failed (attempt ${attempt + 1}), retrying after ${delay}ms:`,
        error
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("Max retries exceeded");
}

// ==================== SREALITY.CZ API ====================

async function fetchSrealityListings(
  bounds: BoundingBox,
  businessType: string,
  centerLat: number,
  centerLng: number
): Promise<RealEstateListing[]> {
  await waitForRateLimit("sreality");

  const filters = getRelevantPropertyFilters(businessType);
  const { main, sub } = filters.sreality;

  // Build Sreality API URL
  const boundsParam = `${bounds.minLat},${bounds.minLng}|${bounds.maxLat},${bounds.maxLng}`;
  const url = new URL("https://www.sreality.cz/api/cs/v2/estates");
  url.searchParams.set("category_main_cb", main.toString()); // e.g., 4 = Commercial properties
  // Only set subcategory if it's meaningful (not all commercial - we'll search all types)
  // Sub-categories are unreliable, so we search all commercial spaces (category 4)
  // and filter by keywords instead
  // if (sub && sub !== 40) {
  //   url.searchParams.set("category_sub_cb", sub.toString());
  // }
  url.searchParams.set("category_type_cb", "2"); // 1 = Sale, 2 = Rent
  url.searchParams.set("per_page", "60");
  url.searchParams.set("bounds", boundsParam);

  console.log("Fetching from Sreality:", url.toString());

  try {
    const response = await fetchWithRetry(url.toString(), {
      headers: {
        "User-Agent": "Spotonaut-App/1.0 (Location Analysis Service)",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Sreality API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data._embedded?.estates) {
      console.warn("No estates found in Sreality response");
      return [];
    }

    const listings: RealEstateListing[] = data._embedded.estates.map(
      (estate: {
        hash_id: number;
        name: string;
        price: number;
        price_czk?: { value_raw: number; alt?: { value_raw: number } };
        type: number;
        category: number;
        m2?: number;
        locality?: string;
        gps?: { lat: number; lon: number };
        _links?: { self?: { href: string }; images?: Array<{ href: string }> };
        labels?: string[];
      }) => {
        const listing: RealEstateListing = {
          id: `sreality-${estate.hash_id}`,
          source: "sreality",
          title: estate.name || "Bez názvu",
          price: estate.price_czk?.value_raw || estate.price || 0,
          pricePerSqm: estate.price_czk?.alt?.value_raw,
          currency: "CZK",
          transactionType: estate.type === 2 ? "rent" : "sale",
          address: estate.locality || "",
          locality: estate.locality,
          category: getCategoryName(estate.category),
          size: estate.m2,
          url: `https://www.sreality.cz${estate._links?.self?.href || ""}`,
          images: estate._links?.images?.map((img) => img.href) || [],
          labels: estate.labels || [],
        };

        // Add coordinates if available
        if (estate.gps?.lat && estate.gps?.lon) {
          listing.coordinates = {
            lat: estate.gps.lat,
            lng: estate.gps.lon,
          };
          listing.distanceMeters = Math.round(
            calculateDistance(
              centerLat,
              centerLng,
              estate.gps.lat,
              estate.gps.lon
            )
          );
        }

        return listing;
      }
    );

    console.log(`Fetched ${listings.length} listings from Sreality`);
    return listings;
  } catch (error) {
    console.error("Sreality API error:", error);
    throw error;
  }
}

function getCategoryName(category: number): string {
  switch (category) {
    case 1:
      return "Byt";
    case 2:
      return "Dům";
    case 3:
      return "Pozemek";
    case 4:
      return "Komerční prostor";
    case 5:
      return "Ostatní";
    default:
      return "Neznámé";
  }
}

// ==================== BEZREALITKY.CZ API ====================

async function fetchBezrealitkyListings(): Promise<RealEstateListing[]> {
  // TODO: Implement Bezrealitky scraper/API
  // For now, return empty array as fallback
  console.log("Bezrealitky integration not yet implemented");
  return [];
}

// ==================== API ROUTE HANDLER ====================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse and validate parameters
    const lat = parseFloat(searchParams.get("lat") || "");
    const lng = parseFloat(searchParams.get("lng") || "");
    const radius = parseInt(searchParams.get("radius") || "1000");
    const businessType = searchParams.get("businessType") || "";
    const source = searchParams.get("source") || "all"; // "sreality" | "bezrealitky" | "all"

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: "Valid latitude and longitude required" },
        { status: 400 }
      );
    }

    if (!businessType) {
      return NextResponse.json(
        { error: "Business type required" },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = getCacheKey(lat, lng, radius, businessType);
    const cachedListings = getCachedListings(cacheKey);
    if (cachedListings) {
      return NextResponse.json({
        listings: cachedListings,
        count: cachedListings.length,
        source: "cache",
        cached: true,
      });
    }

    // Calculate bounding box
    const bounds = calculateBounds(lat, lng, radius);

    const results = {
      sreality: {
        data: [] as RealEstateListing[],
        error: null as string | null,
      },
      bezrealitky: {
        data: [] as RealEstateListing[],
        error: null as string | null,
      },
    };

    // Fetch from Sreality if requested
    if (source === "sreality" || source === "all") {
      try {
        results.sreality.data = await fetchSrealityListings(
          bounds,
          businessType,
          lat,
          lng
        );
      } catch (error: unknown) {
        console.error("Sreality fetch failed:", error);
        results.sreality.error =
          error instanceof Error ? error.message : "Unknown error";
      }
    }

    // Fetch from Bezrealitky if requested
    if (source === "bezrealitky" || source === "all") {
      try {
        results.bezrealitky.data = await fetchBezrealitkyListings();
      } catch (error: unknown) {
        console.error("Bezrealitky fetch failed:", error);
        results.bezrealitky.error =
          error instanceof Error ? error.message : "Unknown error";
      }
    }

    // Combine and filter results
    const allListings = [...results.sreality.data, ...results.bezrealitky.data];

    // Apply relevance filtering
    const filteredListings = allListings.filter((property) => {
      const filters = getRelevantPropertyFilters(businessType);

      // Size filter (if size is available)
      if (property.size && filters.minSize && filters.maxSize) {
        if (
          property.size < filters.minSize ||
          property.size > filters.maxSize
        ) {
          return false;
        }
      }

      // Ground floor requirement
      if (filters.requiresGroundFloor && property.title) {
        const text = property.title.toLowerCase();
        const hasGroundFloorMention =
          text.includes("přízemí") ||
          text.includes("ground") ||
          text.includes("parter") ||
          text.includes("1. np") ||
          text.includes("street level");

        if (!hasGroundFloorMention && property.size && property.size > 20) {
          return false;
        }
      }

      // Keyword matching in title and category
      const searchText = `${property.title || ""} ${
        property.category || ""
      }`.toLowerCase();
      const hasRelevantKeyword = filters.keywords.some((keyword) =>
        searchText.includes(keyword.toLowerCase())
      );

      // Be more lenient - if no keywords match but size is good, still include it
      if (
        !hasRelevantKeyword &&
        property.size &&
        filters.minSize &&
        filters.maxSize
      ) {
        return (
          property.size >= filters.minSize && property.size <= filters.maxSize
        );
      }

      return hasRelevantKeyword;
    });

    // Sort by distance (closest first)
    filteredListings.sort((a, b) => {
      const distA = a.distanceMeters || Infinity;
      const distB = b.distanceMeters || Infinity;
      return distA - distB;
    });

    // Limit to top 20 results
    const limitedListings = filteredListings.slice(0, 20);

    // Cache the results
    setCachedListings(cacheKey, limitedListings);

    return NextResponse.json({
      listings: limitedListings,
      count: limitedListings.length,
      source: source,
      cached: false,
      errors: {
        sreality: results.sreality.error,
        bezrealitky: results.bezrealitky.error,
      },
    });
  } catch (error: unknown) {
    console.error("Real estate listings API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch real estate listings",
        details: error instanceof Error ? error.message : "Unknown error",
        listings: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}
