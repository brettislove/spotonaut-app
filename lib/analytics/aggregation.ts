import { PrismaClient } from "@prisma/client";

// Memory cache for tracking last aggregation runs (opportunistic execution)
let lastDailyAggregation: string | null = null;
let lastHourlyAggregation: string | null = null;

/**
 * Get ISO week string (YYYY-Www format) from date
 */
function getISOWeek(date: Date): string {
  const target = new Date(date.valueOf());
  const dayNumber = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNumber + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNumber =
    1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return target.getFullYear() + "-W" + String(weekNumber).padStart(2, "0");
}

/**
 * Aggregate daily statistics for the previous day
 * Called opportunistically or via cron job
 */
export async function aggregateDailyStats(prisma: PrismaClient): Promise<void> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split("T")[0]; // YYYY-MM-DD

  // Check if already aggregated today
  if (lastDailyAggregation === dateStr) {
    return;
  }

  const startOfDay = new Date(dateStr);
  const endOfDay = new Date(dateStr);
  endOfDay.setDate(endOfDay.getDate() + 1);

  console.log(`Aggregating daily stats for ${dateStr}...`);

  try {
    // Get total analyses count
    const totalAnalyses = await prisma.analysis.count({
      where: {
        createdAt: { gte: startOfDay, lt: endOfDay },
      },
    });

    // Get anonymous vs registered analyses
    const anonymousAnalyses = await prisma.analysis.count({
      where: {
        createdAt: { gte: startOfDay, lt: endOfDay },
        userId: null,
      },
    });

    const registeredAnalyses = totalAnalyses - anonymousAnalyses;

    // Get unique visitors from PageView
    const pageViews = await prisma.pageView.findMany({
      where: {
        createdAt: { gte: startOfDay, lt: endOfDay },
      },
      select: {
        userId: true,
        anonymousId: true,
      },
    });

    const uniqueUserIds = new Set(
      pageViews.filter((pv) => pv.userId).map((pv) => pv.userId)
    );
    const uniqueAnonymousIds = new Set(
      pageViews.filter((pv) => !pv.userId).map((pv) => pv.anonymousId)
    );

    const registeredVisitors = uniqueUserIds.size;
    const anonymousVisitors = uniqueAnonymousIds.size;
    const uniqueVisitors = registeredVisitors + anonymousVisitors;

    // Get chat messages count (from ChatUsage increments)
    // Note: ChatUsage tracks cumulative counts, so we need to check UserEvents or another method
    // For now, we'll estimate from feedback or leave as 0 - this can be enhanced later
    const chatMessages = 0; // TODO: Track individual chat messages if needed

    // Get feedback count and average rating
    const feedbacks = await prisma.feedback.findMany({
      where: {
        createdAt: { gte: startOfDay, lt: endOfDay },
      },
      select: {
        rating: true,
      },
    });

    const feedbackCount = feedbacks.length;
    const avgFeedbackRating =
      feedbackCount > 0
        ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbackCount
        : null;

    // Get top business types
    const analyses = await prisma.analysis.findMany({
      where: {
        createdAt: { gte: startOfDay, lt: endOfDay },
        businessType: { not: null },
      },
      select: {
        businessType: true,
      },
    });

    const businessTypeCount: Record<string, number> = {};
    analyses.forEach((a) => {
      if (a.businessType) {
        businessTypeCount[a.businessType] =
          (businessTypeCount[a.businessType] || 0) + 1;
      }
    });

    const topBusinessTypes = Object.entries(businessTypeCount)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get top locations
    const locationAnalyses = await prisma.analysis.findMany({
      where: {
        createdAt: { gte: startOfDay, lt: endOfDay },
      },
      select: {
        locationName: true,
      },
    });

    const locationCount: Record<string, number> = {};
    locationAnalyses.forEach((a) => {
      locationCount[a.locationName] = (locationCount[a.locationName] || 0) + 1;
    });

    const topLocations = Object.entries(locationCount)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get UTM sources
    const utmPageViews = await prisma.pageView.findMany({
      where: {
        createdAt: { gte: startOfDay, lt: endOfDay },
        utmSource: { not: null },
      },
      select: {
        utmSource: true,
      },
    });

    const utmSourceCount: Record<string, number> = {};
    utmPageViews.forEach((pv) => {
      if (pv.utmSource) {
        utmSourceCount[pv.utmSource] = (utmSourceCount[pv.utmSource] || 0) + 1;
      }
    });

    // Get countries data with anonymous/registered split
    const countryPageViews = await prisma.pageView.findMany({
      where: {
        createdAt: { gte: startOfDay, lt: endOfDay },
        country: { not: null },
      },
      select: {
        country: true,
        userId: true,
      },
    });

    const countryData: Record<
      string,
      { count: number; anonymous: number; registered: number }
    > = {};

    countryPageViews.forEach((pv) => {
      if (pv.country) {
        if (!countryData[pv.country]) {
          countryData[pv.country] = { count: 0, anonymous: 0, registered: 0 };
        }
        countryData[pv.country].count += 1;
        if (pv.userId) {
          countryData[pv.country].registered += 1;
        } else {
          countryData[pv.country].anonymous += 1;
        }
      }
    });

    const countriesData = Object.entries(countryData)
      .map(([country, data]) => ({ country, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // Update cohort data for users who created analyses
    const userAnalyses = await prisma.analysis.findMany({
      where: {
        createdAt: { gte: startOfDay, lt: endOfDay },
        userId: { not: null },
      },
      select: {
        userId: true,
        createdAt: true,
      },
    });

    for (const analysis of userAnalyses) {
      if (!analysis.userId) continue;

      // Check if this is user's first analysis
      const firstAnalysis = await prisma.analysis.findFirst({
        where: { userId: analysis.userId },
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      });

      if (firstAnalysis) {
        const cohortDate = firstAnalysis.createdAt.toISOString().split("T")[0];
        const cohortWeek = getISOWeek(firstAnalysis.createdAt);

        // Calculate weeks since first analysis
        const daysSinceFirst = Math.floor(
          (analysis.createdAt.getTime() - firstAnalysis.createdAt.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        const weekNumber = Math.floor(daysSinceFirst / 7);

        // Upsert cohort record
        const existingCohort = await prisma.userCohort.findUnique({
          where: {
            cohortWeek_userId: {
              cohortWeek,
              userId: analysis.userId,
            },
          },
        });

        const weeklyActivity = existingCohort?.weeklyActivity
          ? (existingCohort.weeklyActivity as Record<string, boolean>)
          : {};
        weeklyActivity[`week${weekNumber}`] = true;

        await prisma.userCohort.upsert({
          where: {
            cohortWeek_userId: {
              cohortWeek,
              userId: analysis.userId,
            },
          },
          create: {
            cohortDate,
            cohortWeek,
            userId: analysis.userId,
            firstAnalysisDate: firstAnalysis.createdAt,
            weeklyActivity,
          },
          update: {
            weeklyActivity,
            updatedAt: new Date(),
          },
        });
      }
    }

    // Aggregate API performance metrics
    const performanceAnalyses = await prisma.analysis.findMany({
      where: {
        createdAt: { gte: startOfDay, lt: endOfDay },
      },
      select: {
        completedSuccessfully: true,
        apiResponseTimeMs: true,
        errorMessage: true,
      },
    });

    const totalRequests = performanceAnalyses.length;
    const successfulRequests = performanceAnalyses.filter(
      (a) => a.completedSuccessfully
    ).length;
    const failedRequests = totalRequests - successfulRequests;

    const responseTimes = performanceAnalyses
      .filter((a) => a.apiResponseTimeMs !== null)
      .map((a) => a.apiResponseTimeMs as number);

    const avgResponseTimeMs =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length
        : null;
    const maxResponseTimeMs =
      responseTimes.length > 0 ? Math.max(...responseTimes) : null;

    // Aggregate error types
    const errors: Record<string, number> = {};
    performanceAnalyses.forEach((a) => {
      if (!a.completedSuccessfully && a.errorMessage) {
        const errorType = a.errorMessage.split(":")[0]; // Get error prefix
        errors[errorType] = (errors[errorType] || 0) + 1;
      }
    });

    // Upsert DailyAnalytics
    await prisma.dailyAnalytics.upsert({
      where: { date: dateStr },
      create: {
        date: dateStr,
        totalAnalyses,
        anonymousAnalyses,
        registeredAnalyses,
        uniqueVisitors,
        anonymousVisitors,
        registeredVisitors,
        chatMessages,
        feedbackCount,
        avgFeedbackRating,
        topBusinessTypes,
        topLocations,
        utmSources: utmSourceCount,
        countriesData,
      },
      update: {
        totalAnalyses,
        anonymousAnalyses,
        registeredAnalyses,
        uniqueVisitors,
        anonymousVisitors,
        registeredVisitors,
        chatMessages,
        feedbackCount,
        avgFeedbackRating,
        topBusinessTypes,
        topLocations,
        utmSources: utmSourceCount,
        countriesData,
        updatedAt: new Date(),
      },
    });

    // Upsert ApiPerformance
    await prisma.apiPerformance.upsert({
      where: { date: dateStr },
      create: {
        date: dateStr,
        totalRequests,
        successfulRequests,
        failedRequests,
        avgResponseTimeMs,
        maxResponseTimeMs,
        quotaUsed: totalRequests, // Assuming 1 request per analysis
        errors,
      },
      update: {
        totalRequests,
        successfulRequests,
        failedRequests,
        avgResponseTimeMs,
        maxResponseTimeMs,
        quotaUsed: totalRequests,
        errors,
        updatedAt: new Date(),
      },
    });

    lastDailyAggregation = dateStr;
    console.log(`Daily stats aggregated for ${dateStr}`);
  } catch (error) {
    console.error("Error aggregating daily stats:", error);
    throw error;
  }
}

/**
 * Aggregate hourly statistics for the previous hour
 * Called opportunistically or via cron job
 */
export async function aggregateHourlyStats(
  prisma: PrismaClient
): Promise<void> {
  const now = new Date();
  const lastHour = new Date(now);
  lastHour.setHours(lastHour.getHours() - 1);
  lastHour.setMinutes(0, 0, 0);

  const endOfLastHour = new Date(lastHour);
  endOfLastHour.setHours(endOfLastHour.getHours() + 1);

  const timestampStr = lastHour.toISOString();

  // Check if already aggregated this hour
  if (lastHourlyAggregation === timestampStr) {
    return;
  }

  console.log(`Aggregating hourly stats for ${timestampStr}...`);

  try {
    // Get analyses count
    const analyses = await prisma.analysis.count({
      where: {
        createdAt: { gte: lastHour, lt: endOfLastHour },
      },
    });

    const anonymousAnalyses = await prisma.analysis.count({
      where: {
        createdAt: { gte: lastHour, lt: endOfLastHour },
        userId: null,
      },
    });

    const registeredAnalyses = analyses - anonymousAnalyses;

    // Get unique visitors
    const pageViews = await prisma.pageView.findMany({
      where: {
        createdAt: { gte: lastHour, lt: endOfLastHour },
      },
      select: {
        userId: true,
        anonymousId: true,
      },
    });

    const uniqueUserIds = new Set(
      pageViews.filter((pv) => pv.userId).map((pv) => pv.userId)
    );
    const uniqueAnonymousIds = new Set(
      pageViews.filter((pv) => !pv.userId).map((pv) => pv.anonymousId)
    );

    const registeredVisitors = uniqueUserIds.size;
    const anonymousVisitors = uniqueAnonymousIds.size;
    const visitors = registeredVisitors + anonymousVisitors;

    // Chat messages (placeholder for now)
    const chatMessages = 0;

    // Upsert HourlyAnalytics
    await prisma.hourlyAnalytics.upsert({
      where: { timestamp: lastHour },
      create: {
        timestamp: lastHour,
        analyses,
        anonymousAnalyses,
        registeredAnalyses,
        chatMessages,
        visitors,
        anonymousVisitors,
        registeredVisitors,
      },
      update: {
        analyses,
        anonymousAnalyses,
        registeredAnalyses,
        chatMessages,
        visitors,
        anonymousVisitors,
        registeredVisitors,
      },
    });

    lastHourlyAggregation = timestampStr;
    console.log(`Hourly stats aggregated for ${timestampStr}`);
  } catch (error) {
    console.error("Error aggregating hourly stats:", error);
    throw error;
  }
}

/**
 * Opportunistically run aggregations if not already run today/this hour
 * Non-blocking, runs in background
 */
export function runAggregationsIfNeeded(prisma: PrismaClient): void {
  // Run in background (don't await)
  aggregateDailyStats(prisma).catch((err) =>
    console.error("Background daily aggregation failed:", err)
  );
  aggregateHourlyStats(prisma).catch((err) =>
    console.error("Background hourly aggregation failed:", err)
  );
}
