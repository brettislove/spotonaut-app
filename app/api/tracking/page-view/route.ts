import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  anonymizeIP,
  extractIPFromHeaders,
  getCountryFromIP,
} from "@/lib/security/ip-anonymization";
import { auth } from "@/app/api/auth/[...nextauth]/route";

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
      ua
    )
  ) {
    return "mobile";
  }
  return "desktop";
}

/**
 * POST /api/tracking/page-view
 * Track a page view with UTM parameters and geographic data
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();

    const {
      path,
      referrer,
      fingerprint,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
    } = body;

    // Extract IP and get geographic data
    const ip = extractIPFromHeaders(request.headers);
    const { country, region } = await getCountryFromIP(ip);
    const anonymousId = anonymizeIP(ip) + "-" + (fingerprint || "unknown");

    // Get user agent and device type
    const userAgent = request.headers.get("user-agent") || "unknown";
    const deviceType = getDeviceType(userAgent);

    // Create page view record
    await prisma.pageView.create({
      data: {
        userId: session?.user?.id || null,
        anonymousId,
        path,
        referrer: referrer || null,
        country: country || null,
        region: region || null,
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
        utmTerm: utmTerm || null,
        utmContent: utmContent || null,
        userAgent,
        deviceType,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Page view tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track page view" },
      { status: 500 }
    );
  }
}
