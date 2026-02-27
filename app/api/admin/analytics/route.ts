import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { writeAdminAuditEvent } from "@/lib/security/admin-audit";

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
 * Clamp date range to max allowed days
 */
function clampDateRange(
  startDate: string,
  endDate: string,
  maxDays: number,
): { start: string; end: string } {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays > maxDays) {
    // Adjust start date to max allowed range
    const adjustedStart = new Date(end);
    adjustedStart.setDate(adjustedStart.getDate() - maxDays);
    return {
      start: adjustedStart.toISOString().split("T")[0],
      end: endDate,
    };
  }

  return { start: startDate, end: endDate };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email || !isAdmin(session.user.email)) {
      await writeAdminAuditEvent(prisma, request.headers, {
        action: "analytics_read",
        resource: "admin_analytics",
        result: "denied",
        actorEmail: session?.user?.email || null,
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "daily";
    const page = parseInt(searchParams.get("page") || "1");
    const userType = searchParams.get("userType") || "all";
    const minCohortSize = parseInt(searchParams.get("minCohortSize") || "0");

    let startDate = searchParams.get("startDate");
    let endDate = searchParams.get("endDate");

    // Set default date range if not provided
    if (!startDate || !endDate) {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      startDate = start.toISOString().split("T")[0];
      endDate = end.toISOString().split("T")[0];
    }

    // Auto-clamp date ranges
    let actualDateRange = { start: startDate, end: endDate };
    if (type === "daily") {
      actualDateRange = clampDateRange(startDate, endDate, 90);
    } else if (type === "hourly") {
      actualDateRange = clampDateRange(startDate, endDate, 7);
    }

    const take = 100;
    const skip = (page - 1) * take;

    if (type === "daily") {
      const data = await prisma.dailyAnalytics.findMany({
        where: {
          date: {
            gte: actualDateRange.start,
            lte: actualDateRange.end,
          },
        },
        orderBy: { date: "desc" },
        take,
        skip,
      });

      const total = await prisma.dailyAnalytics.count({
        where: {
          date: {
            gte: actualDateRange.start,
            lte: actualDateRange.end,
          },
        },
      });

      return NextResponse.json({
        data,
        pagination: {
          page,
          total,
          hasMore: skip + data.length < total,
        },
        actualDateRange,
      });
    } else if (type === "hourly") {
      const startDateTime = new Date(actualDateRange.start);
      const endDateTime = new Date(actualDateRange.end);
      endDateTime.setHours(23, 59, 59, 999);

      const data = await prisma.hourlyAnalytics.findMany({
        where: {
          timestamp: {
            gte: startDateTime,
            lte: endDateTime,
          },
        },
        orderBy: { timestamp: "desc" },
        take,
        skip,
      });

      const total = await prisma.hourlyAnalytics.count({
        where: {
          timestamp: {
            gte: startDateTime,
            lte: endDateTime,
          },
        },
      });

      return NextResponse.json({
        data,
        pagination: {
          page,
          total,
          hasMore: skip + data.length < total,
        },
        actualDateRange,
      });
    } else if (type === "cohort") {
      const cohorts = await prisma.userCohort.groupBy({
        by: ["cohortWeek"],
        where: {
          cohortDate: {
            gte: actualDateRange.start,
            lte: actualDateRange.end,
          },
        },
        _count: {
          userId: true,
        },
        having: {
          userId: {
            _count: {
              gte: minCohortSize,
            },
          },
        },
        orderBy: {
          cohortWeek: "desc",
        },
        take,
        skip,
      });

      return NextResponse.json({
        data: cohorts,
        pagination: {
          page,
          total: cohorts.length,
          hasMore: false,
        },
        actualDateRange,
      });
    } else if (type === "performance") {
      const data = await prisma.apiPerformance.findMany({
        where: {
          date: {
            gte: actualDateRange.start,
            lte: actualDateRange.end,
          },
        },
        orderBy: { date: "desc" },
        take,
        skip,
      });

      // Add alert flags
      const dataWithAlerts = data.map((d) => ({
        ...d,
        errorRateHigh:
          d.totalRequests > 0 && d.failedRequests / d.totalRequests > 0.05,
        responseTimeSlow: (d.avgResponseTimeMs || 0) > 2000,
      }));

      const total = await prisma.apiPerformance.count({
        where: {
          date: {
            gte: actualDateRange.start,
            lte: actualDateRange.end,
          },
        },
      });

      return NextResponse.json({
        data: dataWithAlerts,
        pagination: {
          page,
          total,
          hasMore: skip + data.length < total,
        },
        actualDateRange,
      });
    }

    return NextResponse.json(
      { error: "Invalid type parameter" },
      { status: 400 },
    );
  } catch (error) {
    await writeAdminAuditEvent(prisma, request.headers, {
      action: "analytics_read",
      resource: "admin_analytics",
      result: "error",
      details: {
        error: error instanceof Error ? error.message : "unknown_error",
      },
    });
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 },
    );
  }
}
