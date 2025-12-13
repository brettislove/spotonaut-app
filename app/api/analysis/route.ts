import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import {
  generateWithMaps,
  BASIC_SYSTEM_PROMPT,
  MAPS_ENHANCED_SYSTEM_PROMPT,
} from "@/lib/google-ai/client";
import {
  checkGlobalMapsQuota,
  incrementGlobalMapsUsage,
  archiveOldRecordsIfNeeded,
  hasGroundingMetadata,
  extractGroundingSources,
  type GroundingSource,
} from "@/lib/google-ai/usage";
import type { BusinessType } from "@/lib/constants/business-types";

// Debug: Log DATABASE_URL to check what Vercel is using
console.log("DATABASE_URL in analysis route:", process.env.DATABASE_URL);
console.log(
  "DATABASE_URL starts with postgres:",
  process.env.DATABASE_URL?.startsWith("postgres")
);
console.log(
  "All env vars:",
  Object.keys(process.env).filter((k) => k.includes("DATABASE"))
);

const prisma = new PrismaClient();

interface AnalysisRequest {
  location: string;
  businessType: BusinessType;
  operatingHours: number;
  timeframe: "day" | "week" | "month" | "year";
  fingerprint?: string;
}

const timeframeLabels = {
  day: "den",
  week: "týden",
  month: "měsíc",
  year: "rok",
};

export async function POST(request: NextRequest) {
  try {
    const data: AnalysisRequest = await request.json();

    // Get session to check if user is authenticated
    const session = await auth();

    // Get IP address from headers
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(",")[0].trim()
      : request.headers.get("x-real-ip") || "unknown";

    // Check usage limits for anonymous users
    if (!session && data.fingerprint && ip !== "unknown") {
      const existingUsage = await prisma.anonymousUsage.findUnique({
        where: {
          ipAddress_fingerprint: {
            ipAddress: ip,
            fingerprint: data.fingerprint,
          },
        },
      });

      if (existingUsage && existingUsage.analysisCount >= 1) {
        return NextResponse.json(
          {
            error:
              "Dosáhli jste limitu pro anonymní analýzy. Zaregistrujte se pro neomezený přístup.",
            requiresAuth: true,
          },
          { status: 403 }
        );
      }
    }

    // Validate required fields
    if (
      !data.location ||
      !data.businessType ||
      !data.operatingHours ||
      !data.timeframe
    ) {
      return NextResponse.json(
        { error: "Všechna pole jsou povinná" },
        { status: 400 }
      );
    }

    // Validate ranges
    if (data.operatingHours < 1 || data.operatingHours > 168) {
      return NextResponse.json(
        { error: "Provozní hodiny musí být mezi 1-168" },
        { status: 400 }
      );
    }

    console.log("Processing analysis request:", data);

    // Geocode the location
    let coordinates = null;
    let geocodeData:
      | { lat: string; lon: string; display_name: string }[]
      | null = null;
    try {
      const geocodeResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          data.location
        )}&limit=1`,
        {
          headers: {
            "User-Agent": "Spotonaut-App/1.0",
          },
        }
      );
      geocodeData = await geocodeResponse.json();
      if (geocodeData && geocodeData.length > 0) {
        coordinates = {
          lat: parseFloat(geocodeData[0].lat),
          lng: parseFloat(geocodeData[0].lon),
        };
        console.log("Geocoded coordinates:", coordinates);
      }
    } catch (geocodeError) {
      console.error("Geocoding error:", geocodeError);
      // Continue without coordinates
    }

    // Create structured prompt with all data and request for structured metrics
    const structuredPrompt = `
  Proveď STRUČNOU analýzu obchodní lokality s následujícími daty:

  **VSTUPNÍ DATA:**
  - Lokalita: ${data.location}
  - Typ podnikání: ${data.businessType.type}
  - Kategorie: ${data.businessType.category}
  - Provozní hodiny za týden: ${data.operatingHours} hodin
  - Průměrná útrata zákazníka: ${data.businessType.avgSpend} Kč
  - Konverzní poměr: ${(data.businessType.conversionRate * 100).toFixed(1)}%
  - Časový rámec analýzy: ${timeframeLabels[data.timeframe]}

  **POŽADOVANÁ ANALÝZA:**
  Napiš pouze 2-3 věty shrnující klíčové poznatky o této lokalitě - její typ, potenciál a hlavní doporučení.

  📊 METRIKY (POVINNÉ - na samém konci odpovědi)
    Na konec své odpovědi přidej JSON objekt s přesnými metrikami.
    Formát JSON:
    
    - Začni s: \`\`\`json
    - Poté objekt s těmito PŘESNÝMI klíči:
      * localityScore: číslo 1-100 (celkové hodnocení lokality)
      * footfallScore: číslo 1-100 (hodnocení návštěvnosti)
      * recommendedHours: string ve formátu "7-22" (doporučené provozní hodiny)
    - Ukonči s: \`\`\`
    
    Příklad struktury (použij své vypočtené hodnoty):
    \`\`\`json
    { "localityScore": 78, "footfallScore": 82, "recommendedHours": "6-22" }
    \`\`\`
    
    KRITICKY DŮLEŽITÉ: Tento JSON blok MUSÍ být na konci odpovědi.
`;

    // Track whether Maps grounding was used and extracted sources
    let usedMapsGrounding = false;
    let groundingSources: GroundingSource[] = [];
    let text = "";

    // Run archive check opportunistically
    await archiveOldRecordsIfNeeded(prisma);

    // Determine if we can use Maps grounding
    const canUseMaps = session && coordinates;
    let quotaStatus = null;

    if (canUseMaps) {
      quotaStatus = await checkGlobalMapsQuota(prisma);
    }

    // Try Maps-grounded analysis for authenticated users with coordinates and quota
    if (canUseMaps && quotaStatus?.allowed && coordinates) {
      try {
        console.log("Attempting Maps-grounded analysis...");
        const mapsResponse = await generateWithMaps(structuredPrompt, {
          enableMaps: true,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          systemPrompt: MAPS_ENHANCED_SYSTEM_PROMPT,
        });

        text = mapsResponse.text || "";

        // Check if Maps grounding was actually used
        if (hasGroundingMetadata(mapsResponse)) {
          usedMapsGrounding = true;
          groundingSources = extractGroundingSources(mapsResponse);
          await incrementGlobalMapsUsage(prisma);
          console.log(
            "Maps grounding successful, sources:",
            groundingSources.length
          );
        } else {
          console.log(
            "Maps grounding returned no metadata, using response anyway"
          );
        }
      } catch (mapsError) {
        console.error(
          "Maps grounding failed, falling back to basic:",
          mapsError
        );
        // Silent fallback - will try basic analysis below
        text = "";
      }
    }

    // Fallback to basic analysis if Maps failed or not available
    if (!text) {
      console.log("Using basic analysis (no Maps grounding)");
      try {
        const basicResponse = await generateWithMaps(structuredPrompt, {
          enableMaps: false,
          systemPrompt: BASIC_SYSTEM_PROMPT,
        });
        text = basicResponse.text || "";
      } catch (basicError) {
        console.error("Basic analysis also failed:", basicError);
        text = "";
      }
    }

    console.log("Analysis complete");

    // Extract metrics from JSON at the end of the response
    let metrics = {
      localityScore: 50,
      footfallScore: 50,
      recommendedHours: "8-20",
    };

    // Try to extract JSON metrics from the response
    const jsonMatch = text.match(/```json\s*({[\s\S]*?})\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsedMetrics = JSON.parse(jsonMatch[1]);
        metrics = {
          localityScore: parsedMetrics.localityScore || metrics.localityScore,
          footfallScore: parsedMetrics.footfallScore || metrics.footfallScore,
          recommendedHours:
            parsedMetrics.recommendedHours || metrics.recommendedHours,
        };
        console.log("Successfully extracted metrics from JSON:", metrics);
      } catch (error) {
        console.error("Failed to parse JSON metrics:", error);
        // Keep fallback metrics
      }
    } else {
      console.warn("No JSON metrics found in response, using fallback values");
    }

    // Get location name from geocoding data
    const locationName =
      geocodeData && geocodeData.length > 0
        ? geocodeData[0].display_name
        : data.location;

    // Save analysis to database
    try {
      await prisma.analysis.create({
        data: {
          userId: session?.user?.id || null,
          locationName,
          location: data.location,
          coordinates: coordinates || undefined,
          metrics: metrics,
          usedMapsGrounding,
          groundingSources:
            groundingSources.length > 0
              ? JSON.parse(JSON.stringify(groundingSources))
              : undefined,
        },
      });
    } catch (dbError) {
      console.error("Failed to save analysis:", dbError);
      // Continue even if save fails
    }

    // Update anonymous usage tracking
    if (!session && data.fingerprint && ip !== "unknown") {
      try {
        await prisma.anonymousUsage.upsert({
          where: {
            ipAddress_fingerprint: {
              ipAddress: ip,
              fingerprint: data.fingerprint,
            },
          },
          update: {
            analysisCount: { increment: 1 },
            lastAnalysisAt: new Date(),
          },
          create: {
            ipAddress: ip,
            fingerprint: data.fingerprint,
            analysisCount: 1,
            lastAnalysisAt: new Date(),
          },
        });
      } catch (usageError) {
        console.error("Failed to update usage tracking:", usageError);
        // Continue even if tracking fails
      }
    }

    return NextResponse.json({
      analysis: text || "Omlouváme se, nepodařilo se vygenerovat analýzu.",
      data: {
        location: data.location,
        locationName,
        coordinates,
        metrics,
      },
      sources: groundingSources,
      usedMapsGrounding,
    });
  } catch (error) {
    console.error("Analysis API Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to process analysis";
    return NextResponse.json(
      {
        error: "Nepodařilo se zpracovat analýzu",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
