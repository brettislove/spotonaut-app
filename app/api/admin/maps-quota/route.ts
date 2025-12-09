import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { getTodaysUsageStats } from "@/lib/google-ai/usage";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get admin emails from environment variable (JSON array)
function getAdminEmails(): string[] {
  const adminEmailsEnv = process.env.ADMIN_EMAILS;
  if (!adminEmailsEnv) {
    return [];
  }
  try {
    const parsed = JSON.parse(adminEmailsEnv);
    if (Array.isArray(parsed)) {
      return parsed.map((email: string) => email.toLowerCase());
    }
    return [];
  } catch {
    console.error("Failed to parse ADMIN_EMAILS environment variable");
    return [];
  }
}

function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const adminEmails = getAdminEmails();
  return adminEmails.includes(email.toLowerCase());
}

export async function GET() {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (!isAdmin(session.user.email)) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Get today's usage stats
    const todayStats = await getTodaysUsageStats(prisma);

    // Get historical data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const historicalUsage = await prisma.googleMapsUsage.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        date: "desc",
      },
      select: {
        date: true,
        count: true,
        dailyLimit: true,
        archived: true,
      },
    });

    // Calculate totals
    const totalUsageLast30Days = historicalUsage.reduce(
      (sum: number, record: { count: number }) => sum + record.count,
      0
    );
    const averageUsagePerDay =
      historicalUsage.length > 0
        ? Math.round(totalUsageLast30Days / historicalUsage.length)
        : 0;

    return NextResponse.json({
      today: todayStats,
      history: historicalUsage,
      summary: {
        totalLast30Days: totalUsageLast30Days,
        averagePerDay: averageUsagePerDay,
        daysTracked: historicalUsage.length,
      },
    });
  } catch (error) {
    console.error("Admin maps quota API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quota data" },
      { status: 500 }
    );
  }
}
