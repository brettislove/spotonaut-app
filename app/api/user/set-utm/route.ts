import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

/**
 * POST /api/user/set-utm
 * Associates first-touch UTM parameters with an authenticated user.
 * Used primarily after Google OAuth sign-in, where the signup flow
 * doesn't go through /api/auth/signup.
 *
 * First-touch principle: if the user already has UTM data, it is NOT overwritten.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { utmSource, utmMedium, utmCampaign } = await request.json();

    // Nothing to set
    if (!utmSource && !utmMedium && !utmCampaign) {
      return NextResponse.json({ success: true, updated: false });
    }

    // Check current user UTM data — first-touch: don't overwrite
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { utmSource: true },
    });

    if (user?.utmSource) {
      // User already has UTM attribution — keep the original
      return NextResponse.json({ success: true, updated: false });
    }

    // Set first-touch UTM data
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
      },
    });

    return NextResponse.json({ success: true, updated: true });
  } catch (error) {
    console.error("Set UTM error:", error);
    return NextResponse.json(
      { error: "Failed to set UTM data" },
      { status: 500 },
    );
  }
}
