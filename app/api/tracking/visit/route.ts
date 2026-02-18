import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  anonymizeIP,
  extractIPFromHeaders,
  getCountryFromIP,
} from "@/lib/security/ip-anonymization";

const prisma = new PrismaClient();

/**
 * Parse device type from User-Agent string
 */
function getDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(ua)) {
    return "tablet";
  }
  if (
    /mobile|iphone|ipod|blackberry|iemobile|opera mini|android.*mobile/i.test(
      ua,
    )
  ) {
    return "mobile";
  }
  return "desktop";
}

/**
 * POST /api/tracking/visit
 * Track a visit with UTM parameters for marketing funnel analysis.
 * Separate from page-view tracking — focused on campaign attribution.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      sessionId,
      visitedUrl,
      referrer,
      fingerprint,
      utmSource,
      utmMedium,
      utmCampaign,
    } = body;

    if (!sessionId || !visitedUrl) {
      return NextResponse.json(
        { error: "sessionId and visitedUrl are required" },
        { status: 400 },
      );
    }

    // Extract IP and get geographic data
    const ip = extractIPFromHeaders(request.headers);
    const { country, region } = await getCountryFromIP(ip);
    const anonymousId = anonymizeIP(ip) + "-" + (fingerprint || "unknown");

    // Get user agent and device type
    const userAgent = request.headers.get("user-agent") || "unknown";
    const deviceType = getDeviceType(userAgent);

    // Create visit record
    await prisma.visit.create({
      data: {
        sessionId,
        anonymousId,
        visitedUrl,
        referrer: referrer || null,
        country: country || null,
        region: region || null,
        deviceType,
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Visit tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track visit" },
      { status: 500 },
    );
  }
}
