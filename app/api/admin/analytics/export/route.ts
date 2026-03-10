import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { generateCSVWithLabels } from "@/lib/analytics/export";

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

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "daily";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    let csv = "";
    const filename = `analytics-${type}-${startDate}-${endDate}.csv`;

    if (type === "daily") {
      const data = await prisma.dailyAnalytics.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: "desc" },
      });

      csv = generateCSVWithLabels(data, [
        { key: "date", label: "Date" },
        { key: "totalAnalyses", label: "Total Analyses" },
        { key: "anonymousAnalyses", label: "Anonymous Analyses" },
        { key: "registeredAnalyses", label: "Registered Analyses" },
        { key: "uniqueVisitors", label: "Unique Visitors" },
        { key: "anonymousVisitors", label: "Anonymous Visitors" },
        { key: "registeredVisitors", label: "Registered Visitors" },
        { key: "chatMessages", label: "Chat Messages" },
        { key: "feedbackCount", label: "Feedback Count" },
        { key: "avgFeedbackRating", label: "Avg Rating" },
      ]);
    } else if (type === "hourly") {
      const startDateTime = new Date(startDate);
      const endDateTime = new Date(endDate);

      const data = await prisma.hourlyAnalytics.findMany({
        where: {
          timestamp: {
            gte: startDateTime,
            lte: endDateTime,
          },
        },
        orderBy: { timestamp: "desc" },
      });

      csv = generateCSVWithLabels(data, [
        { key: "timestamp", label: "Timestamp" },
        { key: "analyses", label: "Analyses" },
        { key: "anonymousAnalyses", label: "Anonymous Analyses" },
        { key: "registeredAnalyses", label: "Registered Analyses" },
        { key: "visitors", label: "Visitors" },
        { key: "anonymousVisitors", label: "Anonymous Visitors" },
        { key: "registeredVisitors", label: "Registered Visitors" },
      ]);
    } else if (type === "performance") {
      const data = await prisma.apiPerformance.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: "desc" },
      });

      csv = generateCSVWithLabels(data, [
        { key: "date", label: "Date" },
        { key: "totalRequests", label: "Total Requests" },
        { key: "successfulRequests", label: "Successful Requests" },
        { key: "failedRequests", label: "Failed Requests" },
        { key: "avgResponseTimeMs", label: "Avg Response Time (ms)" },
        { key: "maxResponseTimeMs", label: "Max Response Time (ms)" },
        { key: "quotaUsed", label: "Quota Used" },
      ]);
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Analytics export error:", error);
    return NextResponse.json(
      { error: "Failed to export analytics data" },
      { status: 500 },
    );
  }
}
