import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import {
  checkGlobalMapsQuota,
  incrementGlobalMapsUsage,
  archiveOldRecordsIfNeeded,
  type GroundingSource,
} from "@/lib/google-ai/usage";
import type { BusinessType } from "@/lib/constants/business-types";
import {
  analyzeLocationBusinessPotential,
  type BusinessAnalysisMetrics,
} from "@/lib/google-ai/location-analysis";

const prisma = new PrismaClient();

interface AnalysisRequest {
  location: string;
  businessType: BusinessType;
  operatingHours: number;
  timeframe: "day" | "week" | "month" | "year";
  fingerprint?: string;
}

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

    console.log("Processing analysis request:", data);

    // Run archive check opportunistically
    await archiveOldRecordsIfNeeded(prisma);

    // Determine if we can use Maps grounding
    const canUseMaps = session && coordinates;
    let quotaStatus = null;

    if (canUseMaps) {
      quotaStatus = await checkGlobalMapsQuota(prisma);
    }

    const useMapsGrounding = Boolean(
      canUseMaps && quotaStatus && quotaStatus.allowed && coordinates
    );

    // Run hybrid analysis (Flash grounding + Pro reasoning)
    const hybridResult = await analyzeLocationBusinessPotential({
      location: data.location,
      businessType: data.businessType,
      operatingHours: data.operatingHours,
      timeframe: data.timeframe,
      coordinates: coordinates || undefined,
      useMapsGrounding,
    });

    const text = hybridResult.analysisText;
    const metrics: BusinessAnalysisMetrics = hybridResult.metrics;

    const usedMapsGrounding = hybridResult.usedMapsGrounding;
    const groundingSources: GroundingSource[] = hybridResult.sources || [];

    // If Maps grounding was actually used, increment quota usage
    if (usedMapsGrounding) {
      try {
        await incrementGlobalMapsUsage(prisma);
      } catch (quotaError) {
        console.error("Failed to increment Maps usage:", quotaError);
      }
    }

    // Get location name from geocoding data
    const locationName =
      geocodeData && geocodeData.length > 0
        ? geocodeData[0].display_name
        : data.location;

    // Transform BusinessAnalysisMetrics into InputJsonObject
    const metricsJsonObject = {
      localityScore: metrics.localityScore,
      footfallScore: metrics.footfallScore,
      recommendedHours: metrics.recommendedHours,
    };

    // Save analysis to database
    try {
      await prisma.analysis.create({
        data: {
          userId: session?.user?.id || null,
          locationName,
          location: data.location,
          coordinates: coordinates || undefined,
          metrics: metricsJsonObject, // Use transformed object here
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
      groundedLocationData: hybridResult.groundedLocation,
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
