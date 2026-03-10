import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import {
  TIER_MODUL,
  TIER_RAKETA,
  TIER_SONDA,
  calculateNextResetDate,
  getTierMaxCredits,
  isRenewableTier,
} from "@/lib/constants/tiers";
import { isAdminEmail } from "@/lib/security/admin-access";
import { writeAdminAuditEvent } from "@/lib/security/admin-audit";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email || !isAdminEmail(session.user.email)) {
      await writeAdminAuditEvent(prisma, request.headers, {
        action: "user_tier_update",
        resource: "users",
        result: "denied",
        actorEmail: session?.user?.email,
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { email, tier, resetUsage } = body || {};

    if (!email || typeof tier !== "number") {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (![TIER_SONDA, TIER_RAKETA, TIER_MODUL].includes(tier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const maxCredits = getTierMaxCredits(tier);
    const creditsResetAt = isRenewableTier(tier)
      ? calculateNextResetDate(tier, new Date())
      : null;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        tier,
        maxCredits,
        creditsResetAt,
        ...(resetUsage ? { usedCredits: 0 } : {}),
      },
      select: {
        id: true,
        tier: true,
        maxCredits: true,
        usedCredits: true,
        creditsResetAt: true,
      },
    });

    await writeAdminAuditEvent(prisma, request.headers, {
      action: "user_tier_update",
      resource: "users",
      result: "success",
      actorEmail: session.user.email,
      details: {
        targetEmail: email,
        tier,
        resetUsage: !!resetUsage,
      },
    });

    return NextResponse.json({ ok: true, user: updated });
  } catch (error) {
    await writeAdminAuditEvent(prisma, request.headers, {
      action: "user_tier_update",
      resource: "users",
      result: "error",
      details: {
        error: error instanceof Error ? error.message : "unknown_error",
      },
    });

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
