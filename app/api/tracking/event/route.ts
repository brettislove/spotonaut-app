import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  anonymizeIP,
  extractIPFromHeaders,
} from "@/lib/security/ip-anonymization";
import { auth } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

/**
 * POST /api/tracking/event
 * Track a user event (form interactions, modal opens, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();

    const { eventType, eventData, page, fingerprint, sessionId } = body;

    if (!eventType) {
      return NextResponse.json(
        { error: "eventType is required" },
        { status: 400 }
      );
    }

    // Extract and anonymize IP
    const ip = extractIPFromHeaders(request.headers);
    const anonymousId = anonymizeIP(ip) + "-" + (fingerprint || "unknown");

    // Create event record
    await prisma.userEvent.create({
      data: {
        userId: session?.user?.id || null,
        anonymousId,
        sessionId: sessionId || null,
        eventType,
        eventData: eventData || null,
        page: page || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Event tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 }
    );
  }
}
