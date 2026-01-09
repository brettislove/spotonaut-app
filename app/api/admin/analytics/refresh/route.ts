import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import {
  aggregateDailyStats,
  aggregateHourlyStats,
} from "@/lib/analytics/aggregation";

const prisma = new PrismaClient();

function getAdminEmails(): string[] {
  const adminEmailsEnv = process.env.ADMIN_EMAILS;
  if (!adminEmailsEnv) return [];
  try {
    const parsed = JSON.parse(adminEmailsEnv);
    return Array.isArray(parsed)
      ? parsed.map((email: string) => email.toLowerCase())
      : [];
  } catch {
    return [];
  }
}

function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

/**
 * POST /api/admin/analytics/refresh
 * Manually trigger aggregation for latest data
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Run both aggregations
    await Promise.all([
      aggregateDailyStats(prisma),
      aggregateHourlyStats(prisma),
    ]);

    // Get latest stats to return
    const latestDaily = await prisma.dailyAnalytics.findFirst({
      orderBy: { date: "desc" },
    });

    const latestHourly = await prisma.hourlyAnalytics.findFirst({
      orderBy: { timestamp: "desc" },
    });

    return NextResponse.json({
      success: true,
      message: "Analytics refreshed successfully",
      latest: {
        daily: latestDaily,
        hourly: latestHourly,
      },
    });
  } catch (error) {
    console.error("Analytics refresh error:", error);
    return NextResponse.json(
      { error: "Failed to refresh analytics" },
      { status: 500 }
    );
  }
}
