import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cleanupOldTrackingData } from "@/lib/analytics/retention";

const prisma = new PrismaClient();

/**
 * GET /api/cron/cleanup-tracking
 * Manually trigger tracking data cleanup (called by external cron service)
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

    const result = await cleanupOldTrackingData(prisma);

    return NextResponse.json({
      success: true,
      message: "Cleanup completed",
      deleted: result,
    });
  } catch (error) {
    console.error("Cleanup cron error:", error);
    return NextResponse.json(
      {
        error: "Cleanup failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
