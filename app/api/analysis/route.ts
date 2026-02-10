import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import {
  checkGlobalMapsQuota,
  incrementGlobalMapsUsage,
  archiveOldRecordsIfNeeded,
  type GroundingSource,
} from "@/lib/google-ai/usage";
import {
  getGroundedLocationDataWithFlash,
  generateProAnalysisWithGroundingStream,
  type BusinessAnalysisMetrics,
  type GroundedLocationData,
} from "@/lib/google-ai/location-analysis";
import type { ProgressStep } from "@/lib/types/analysis";
import {
  anonymizeIP,
  extractIPFromHeaders,
} from "@/lib/security/ip-anonymization";
import { runAggregationsIfNeeded } from "@/lib/analytics/aggregation";
import { runCleanupIfNeeded } from "@/lib/analytics/retention";
import type { AnalysisRequest } from "@/lib/types/analysis";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const data: AnalysisRequest = await request.json();

    // Get session to check if user is authenticated
    const session = await auth();

    // Get IP address from headers and anonymize it
    const ip = extractIPFromHeaders(request.headers);
    const anonymizedIP = anonymizeIP(ip);

    // Check usage limits for anonymous users
    if (!session && data.fingerprint && ip !== "unknown") {
      const existingUsage = await prisma.anonymousUsage.findUnique({
        where: {
          ipAddress_fingerprint: {
            ipAddress: anonymizedIP,
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
          { status: 403 },
        );
      }
    }

    // Validate required fields
    if (!data.location || !data.businessType) {
      return NextResponse.json(
        { error: "Všechna pole jsou povinná" },
        { status: 400 },
      );
    }

    console.log("Processing analysis request:", data);

    // Run archive check opportunistically (non-blocking)
    archiveOldRecordsIfNeeded(prisma).catch((err) =>
      console.error("Archive check failed:", err),
    );

    // Run aggregation and cleanup opportunistically (non-blocking)
    runAggregationsIfNeeded(prisma);
    runCleanupIfNeeded(prisma);

    // Track performance metrics
    const startTime = Date.now();
    let apiStartTime = 0;
    let apiEndTime = 0;

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Track whether the stream controller has been closed to avoid
        // attempting to enqueue after close which throws ERR_INVALID_STATE.
        let streamClosed = false;

        /**
         * Safely enqueue a payload to the stream controller.
         * @param payload The data to enqueue.
         * @returns void
         */
        const safeEnqueue = (payload: Uint8Array) => {
          if (streamClosed) return;
          try {
            controller.enqueue(payload);
          } catch (err) {
            // If enqueue fails because the controller is closed, mark closed
            // and swallow the error to avoid crashing the whole handler.
            console.warn("Stream enqueue failed (likely closed):", err);
            streamClosed = true;
          }
        };

        /**
         * Send progress update to the client.
         * @param step The current progress step.
         */
        const sendProgress = (step: ProgressStep) => {
          safeEnqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "progress", step })}\n\n`,
            ),
          );
        };

        /**
         * Send a chunk of text to the client.
         * @param text The text to send.
         */
        const sendChunk = (text: string) => {
          safeEnqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "chunk", text })}\n\n`,
            ),
          );
        };

        try {
          // Step 1: Use provided coordinates or geocode if needed
          let coordinates = null;

          if (data.coordinates) {
            // Use coordinates provided from frontend (already geocoded)
            coordinates = {
              lat: data.coordinates.lat,
              lng: data.coordinates.lon,
            };
            console.log("Using provided coordinates:", coordinates);
          }

          sendProgress("geocoding");

          // Always check global maps quota regardless of authentication state
          const quotaStatus = await checkGlobalMapsQuota(prisma);

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

          // Use Maps grounding if we have coordinates (allow for anonymous users too)
          // Quota check still controls whether Maps grounding is allowed.
          const canUseMaps = !!coordinates;
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
                prisma, // Pass Prisma client for Places API and caching
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
                  console.error("Failed to increment Maps usage:", err),
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

          // Step 2.5: Fetch Real Estate Listings
          if (coordinates) {
            try {
              console.log("Fetching real estate listings for:", {
                coordinates,
                businessType: data.businessType.type,
              });

              const realEstateResponse = await fetch(
                `${request.nextUrl.origin}/api/real-estate-listings?` +
                  `lat=${coordinates.lat}&lng=${coordinates.lng}&` +
                  `radius=1000&businessType=${encodeURIComponent(
                    data.businessType.type,
                  )}`,
                {
                  headers: {
                    "User-Agent": "Spotonaut-Internal/1.0",
                  },
                },
              );

              if (realEstateResponse.ok) {
                const realEstateData = await realEstateResponse.json();
                if (
                  realEstateData.listings &&
                  Array.isArray(realEstateData.listings)
                ) {
                  groundedLocation.availableProperties =
                    realEstateData.listings;
                  console.log(
                    `Found ${realEstateData.listings.length} real estate listings`,
                  );
                }
              } else {
                console.warn(
                  "Real estate API returned error:",
                  realEstateResponse.status,
                );
              }
            } catch (error) {
              console.error("Failed to fetch real estate listings:", error);
              // Non-critical - continue without listings
            }
          }

          // Step 3: Pro Analysis with Streaming
          sendProgress("pro_analysis");

          let fullText = "";
          let metrics: BusinessAnalysisMetrics = {
            localityScore: 50,
            footfallScore: 50,
            recommendedHours: "8-20",
          };

          // Track API timing
          apiStartTime = Date.now();

          const analysisStream = generateProAnalysisWithGroundingStream({
            location: data.location,
            businessType: data.businessType,
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

          // Track API end time
          apiEndTime = Date.now();

          // Step 4: Finalizing
          sendProgress("finalizing");

          const locationName = data.location;

          // Transform BusinessAnalysisMetrics into InputJsonObject
          const metricsJsonObject = {
            localityScore: metrics.localityScore,
            footfallScore: metrics.footfallScore,
            recommendedHours: metrics.recommendedHours,
          };

          // Calculate performance metrics
          const processingTimeMs = Date.now() - startTime;
          const apiResponseTimeMs =
            apiEndTime > 0 ? apiEndTime - apiStartTime : null;

          // Save analysis to database
          let analysisId: string | null = null;
          try {
            // Build initial chat message from the analysis text
            const initialChatMessages = fullText
              ? [
                  {
                    id: Date.now().toString(),
                    role: "assistant" as const,
                    content: fullText,
                    timestamp: new Date().toISOString(),
                    sources: sources.map((s) => ({
                      title: s.title,
                      uri: s.uri,
                    })),
                  },
                ]
              : undefined;

            const savedAnalysis = await prisma.analysis.create({
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
                groundedLocationData: groundedLocation
                  ? JSON.parse(JSON.stringify(groundedLocation))
                  : undefined,
                chatMessages: initialChatMessages
                  ? JSON.parse(JSON.stringify(initialChatMessages))
                  : undefined,
                businessType: data.businessType.type,
                completedSuccessfully: true,
                processingTimeMs,
                apiResponseTimeMs,
              },
            });
            analysisId = savedAnalysis.id;
          } catch (dbError) {
            console.error("Failed to save analysis:", dbError);
          }

          // Update anonymous usage tracking (non-blocking)
          if (!session && data.fingerprint && ip !== "unknown") {
            prisma.anonymousUsage
              .upsert({
                where: {
                  ipAddress_fingerprint: {
                    ipAddress: anonymizedIP,
                    fingerprint: data.fingerprint,
                  },
                },
                update: {
                  analysisCount: { increment: 1 },
                  lastAnalysisAt: new Date(),
                },
                create: {
                  ipAddress: anonymizedIP,
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
          try {
            // Attempt to send the final "done" payload. Use safeEnqueue to
            // avoid throwing if the controller is already closed.
            safeEnqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "done",
                  analysisId,
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
                })}\n\n`,
              ),
            );
          } finally {
            // Close the controller if not already considered closed.
            try {
              if (!streamClosed) controller.close();
            } catch (err) {
              console.warn(
                "Failed to close controller (already closed?):",
                err,
              );
            }
            streamClosed = true;
          }
        } catch (error) {
          console.error("Analysis stream error:", error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to process analysis";

          // Save failed analysis to database for tracking
          const processingTimeMs = Date.now() - startTime;
          prisma.analysis
            .create({
              data: {
                userId: session?.user?.id || null,
                locationName: data.location,
                location: data.location,
                coordinates: undefined,
                metrics: {
                  localityScore: 0,
                  footfallScore: 0,
                  recommendedHours: "",
                },
                usedMapsGrounding: false,
                businessType: data.businessType.type,
                completedSuccessfully: false,
                errorMessage,
                processingTimeMs,
              },
            })
            .catch((dbError) => {
              console.error("Failed to save error analysis:", dbError);
            });

          // Try to signal an error to the client, but avoid enqueueing if
          // the controller is already closed.
          try {
            safeEnqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "error",
                  error: "Nepodařilo se zpracovat analýzu",
                  details: errorMessage,
                })}\n\n`,
              ),
            );
          } finally {
            try {
              if (!streamClosed) controller.close();
            } catch (err) {
              console.warn("Failed to close controller in error handler:", err);
            }
            streamClosed = true;
          }
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
      { status: 500 },
    );
  }
}
