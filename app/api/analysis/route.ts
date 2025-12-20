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
  getGroundedLocationDataWithFlash,
  generateProAnalysisWithGroundingStream,
  type BusinessAnalysisMetrics,
  type GroundedLocationData,
} from "@/lib/google-ai/location-analysis";
import type { ProgressStep } from "@/components/analysis-progress";

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

    // Run archive check opportunistically (non-blocking)
    archiveOldRecordsIfNeeded(prisma).catch((err) =>
      console.error("Archive check failed:", err)
    );

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        const sendProgress = (step: ProgressStep) => {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "progress", step })}\n\n`
            )
          );
        };

        const sendChunk = (text: string) => {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "chunk", text })}\n\n`
            )
          );
        };

        try {
          // Step 1: Geocoding (parallel with quota check)
          sendProgress("geocoding");

          const [geocodeResult, quotaResult] = await Promise.allSettled([
            fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                data.location
              )}&limit=1`,
              {
                headers: {
                  "User-Agent": "Spotonaut-App/1.0",
                },
              }
            ).then((res) => res.json()),
            session ? checkGlobalMapsQuota(prisma) : Promise.resolve(null),
          ]);

          let coordinates = null;
          let geocodeData:
            | { lat: string; lon: string; display_name: string }[]
            | null = null;

          if (geocodeResult.status === "fulfilled") {
            geocodeData = geocodeResult.value;
            if (geocodeData && geocodeData.length > 0) {
              coordinates = {
                lat: parseFloat(geocodeData[0].lat),
                lng: parseFloat(geocodeData[0].lon),
              };
              console.log("Geocoded coordinates:", coordinates);
            }
          } else {
            console.error("Geocoding error:", geocodeResult.reason);
          }

          const quotaStatus =
            quotaResult.status === "fulfilled" ? quotaResult.value : null;

          console.log("Quota check result:", {
            hasSession: !!session,
            hasCoordinates: !!coordinates,
            quotaStatus,
            quotaAllowed: quotaStatus?.allowed,
          });

          // Step 2: Maps Grounding (if applicable)
          let groundedLocation: GroundedLocationData;
          let usedMapsGrounding = false;
          let sources: GroundingSource[] = [];

          // Use Maps grounding if: we have coordinates AND session AND quota allows it
          // If quota check failed (null), we'll still try but log a warning
          const canUseMaps = session && coordinates;
          const quotaExceeded = quotaStatus && quotaStatus.quotaExceeded;
          const useMapsGrounding = canUseMaps && !quotaExceeded;

          console.log("Maps grounding decision:", {
            canUseMaps,
            useMapsGrounding,
            hasCoordinates: !!coordinates,
            hasSession: !!session,
            hasQuota: !!quotaStatus,
            quotaAllowed: quotaStatus?.allowed,
            quotaExceeded,
          });

          if (useMapsGrounding && coordinates) {
            sendProgress("maps_grounding");
            try {
              console.log("Calling Flash grounding with:", {
                location: data.location,
                businessType: data.businessType.type,
                coordinates,
              });

              const flashResult = await getGroundedLocationDataWithFlash({
                location: data.location,
                businessType: data.businessType,
                coordinates,
              });

              console.log("Flash grounding result:", {
                usedMapsGrounding: flashResult.usedMapsGrounding,
                groundingStatus: flashResult.groundedLocation.groundingStatus,
                sourcesCount: flashResult.sources.length,
              });

              groundedLocation = flashResult.groundedLocation;
              usedMapsGrounding = flashResult.usedMapsGrounding;
              sources = flashResult.sources;

              // Increment quota usage if Maps was used
              if (usedMapsGrounding) {
                incrementGlobalMapsUsage(prisma).catch((err) =>
                  console.error("Failed to increment Maps usage:", err)
                );
              }
            } catch (error) {
              console.error("Flash grounding error:", error);
              // On error, still create a grounded location object but mark it as failed
              groundedLocation = {
                locationQuery: data.location,
                resolvedAddress: null,
                coordinates: coordinates || undefined,
                primaryPlaceId: null,
                primaryMapsUrl: null,
                categories: null,
                competitors: [],
                footfallProxies: [],
                averageRating: null,
                reviewSentiment: "unknown",
                notes: null,
                groundingStatus: "failed",
              };
              usedMapsGrounding = false;
              sources = [];
            }
          } else {
            console.log("Skipping Maps grounding:", {
              useMapsGrounding,
              hasCoordinates: !!coordinates,
              hasSession: !!session,
              quotaStatus: quotaStatus
                ? {
                    allowed: quotaStatus.allowed,
                    remaining: quotaStatus.remaining,
                  }
                : null,
            });
            groundedLocation = {
              locationQuery: data.location,
              resolvedAddress: null,
              coordinates: coordinates || undefined,
              primaryPlaceId: null,
              primaryMapsUrl: null,
              categories: null,
              competitors: [],
              footfallProxies: [],
              averageRating: null,
              reviewSentiment: "unknown",
              notes: null,
              groundingStatus: "not_used",
            };
          }

          // Step 3: Pro Analysis with Streaming
          sendProgress("pro_analysis");

          let fullText = "";
          let metrics: BusinessAnalysisMetrics = {
            localityScore: 50,
            footfallScore: 50,
            recommendedHours: "8-20",
          };

          const analysisStream = generateProAnalysisWithGroundingStream({
            location: data.location,
            businessType: data.businessType,
            operatingHours: data.operatingHours,
            timeframe: data.timeframe,
            groundedLocation,
          });

          for await (const item of analysisStream) {
            if (item.type === "chunk") {
              fullText += item.text;
              sendChunk(item.text);
            } else if (item.type === "done") {
              fullText = item.text;
              metrics = item.metrics;
            }
          }

          // Step 4: Finalizing
          sendProgress("finalizing");

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

          // Save analysis to database (non-blocking)
          prisma.analysis
            .create({
              data: {
                userId: session?.user?.id || null,
                locationName,
                location: data.location,
                coordinates: coordinates || undefined,
                metrics: metricsJsonObject,
                usedMapsGrounding,
                groundingSources:
                  sources.length > 0
                    ? JSON.parse(JSON.stringify(sources))
                    : undefined,
              },
            })
            .catch((dbError) => {
              console.error("Failed to save analysis:", dbError);
            });

          // Update anonymous usage tracking (non-blocking)
          if (!session && data.fingerprint && ip !== "unknown") {
            prisma.anonymousUsage
              .upsert({
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
              })
              .catch((usageError) => {
                console.error("Failed to update usage tracking:", usageError);
              });
          }

          // Send final result
          sendProgress("complete");
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "done",
                analysis:
                  fullText ||
                  "Omlouváme se, nepodařilo se vygenerovat analýzu.",
                data: {
                  location: data.location,
                  locationName,
                  coordinates,
                  metrics,
                },
                sources,
                usedMapsGrounding,
                groundedLocationData: groundedLocation,
              })}\n\n`
            )
          );

          controller.close();
        } catch (error) {
          console.error("Analysis stream error:", error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to process analysis";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: "Nepodařilo se zpracovat analýzu",
                details: errorMessage,
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
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
