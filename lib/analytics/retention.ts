import { PrismaClient } from "@prisma/client";

// Memory cache for tracking last cleanup check
let lastCleanupCheckDate: string | null = null;

/**
 * Clean up old tracking data based on retention policies
 * - PageView: 90 days
 * - UserEvent: 90 days
 * - HourlyAnalytics: 30 days
 * - DailyAnalytics: Keep indefinitely
 * - ApiPerformance: Keep indefinitely
 * - UserCohort: Keep indefinitely
 */
export async function cleanupOldTrackingData(
  prisma: PrismaClient
): Promise<{
  deletedPageViews: number;
  deletedEvents: number;
  deletedHourly: number;
}> {
  const today = new Date().toISOString().split("T")[0];

  // Check if already cleaned up today
  if (lastCleanupCheckDate === today) {
    return { deletedPageViews: 0, deletedEvents: 0, deletedHourly: 0 };
  }

  console.log("Running data retention cleanup...");

  try {
    // Delete PageViews older than 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const deletedPageViews = await prisma.pageView.deleteMany({
      where: {
        createdAt: { lt: ninetyDaysAgo },
      },
    });

    console.log(
      `Deleted ${deletedPageViews.count} page views older than 90 days`
    );

    // Delete UserEvents older than 90 days
    const deletedEvents = await prisma.userEvent.deleteMany({
      where: {
        createdAt: { lt: ninetyDaysAgo },
      },
    });

    console.log(
      `Deleted ${deletedEvents.count} user events older than 90 days`
    );

    // Delete HourlyAnalytics older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deletedHourly = await prisma.hourlyAnalytics.deleteMany({
      where: {
        timestamp: { lt: thirtyDaysAgo },
      },
    });

    console.log(
      `Deleted ${deletedHourly.count} hourly analytics older than 30 days`
    );

    lastCleanupCheckDate = today;

    return {
      deletedPageViews: deletedPageViews.count,
      deletedEvents: deletedEvents.count,
      deletedHourly: deletedHourly.count,
    };
  } catch (error) {
    console.error("Error during cleanup:", error);
    throw error;
  }
}

/**
 * Opportunistically run cleanup if not already run today
 * Non-blocking, runs in background
 */
export function runCleanupIfNeeded(prisma: PrismaClient): void {
  // Run in background (don't await)
  cleanupOldTrackingData(prisma).catch((err) =>
    console.error("Background cleanup failed:", err)
  );
}
