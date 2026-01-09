import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  aggregateDailyStats,
  aggregateHourlyStats,
} from "@/lib/analytics/aggregation";

const prisma = new PrismaClient();

/**
 * GET /api/cron/aggregate-analytics?type=daily|hourly
 * Manually trigger analytics aggregation (called by external cron service)
 * Requires CRON_SECRET authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (!process.env.CRON_SECRET || authHeader !== expectedAuth) {
      console.error("Unauthorized cron request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "daily";

    if (type === "daily") {
      await aggregateDailyStats(prisma);
      return NextResponse.json({
        success: true,
        message: "Daily aggregation completed",
        type: "daily",
      });
    } else if (type === "hourly") {
      await aggregateHourlyStats(prisma);
      return NextResponse.json({
        success: true,
        message: "Hourly aggregation completed",
        type: "hourly",
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid type parameter. Use "daily" or "hourly"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Aggregation cron error:", error);
    return NextResponse.json(
      {
        error: "Aggregation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
