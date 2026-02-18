import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/app/api/auth/[...nextauth]/route";

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
 * GET /api/admin/traffic?days=30
 * Returns aggregated traffic/UTM data for the admin dashboard.
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get("days") || "30", 10);
  const since = new Date();
  since.setDate(since.getDate() - days);

  // --- 1. Visits by campaign ---
  const visitsByCampaign = await prisma.visit.groupBy({
    by: ["utmCampaign"],
    where: {
      createdAt: { gte: since },
      utmCampaign: { not: null },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 20,
  });

  // --- 2. Visits by source ---
  const visitsBySource = await prisma.visit.groupBy({
    by: ["utmSource"],
    where: {
      createdAt: { gte: since },
      utmSource: { not: null },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 20,
  });

  // --- 3. Visits by medium ---
  const visitsByMedium = await prisma.visit.groupBy({
    by: ["utmMedium"],
    where: {
      createdAt: { gte: since },
      utmMedium: { not: null },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 20,
  });

  // --- 4. Daily visit trend ---
  const allVisits = await prisma.visit.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true, utmSource: true },
    orderBy: { createdAt: "asc" },
  });

  // Group by day
  const dailyMap = new Map<string, { total: number; withUtm: number }>();
  for (const v of allVisits) {
    const day = v.createdAt.toISOString().split("T")[0];
    const entry = dailyMap.get(day) || { total: 0, withUtm: 0 };
    entry.total++;
    if (v.utmSource) entry.withUtm++;
    dailyMap.set(day, entry);
  }
  const dailyTrend = Array.from(dailyMap.entries())
    .map(([date, counts]) => ({ date, ...counts }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // --- 5. Registrations with UTM ---
  const registrationsByCampaign = await prisma.user.groupBy({
    by: ["utmCampaign"],
    where: {
      createdAt: { gte: since },
      utmSource: { not: null },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 20,
  });

  const registrationsBySource = await prisma.user.groupBy({
    by: ["utmSource"],
    where: {
      createdAt: { gte: since },
      utmSource: { not: null },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 20,
  });

  // --- 6. Conversion funnel per campaign ---
  const funnelData = visitsByCampaign.map((vc) => {
    const campaign = vc.utmCampaign!;
    const visits = vc._count.id;
    const reg = registrationsByCampaign.find((r) => r.utmCampaign === campaign);
    const registrations = reg ? reg._count.id : 0;
    const conversionRate =
      visits > 0 ? Math.round((registrations / visits) * 1000) / 10 : 0;
    return { campaign, visits, registrations, conversionRate };
  });

  // --- 7. Summary stats ---
  const totalVisits = await prisma.visit.count({
    where: { createdAt: { gte: since } },
  });
  const totalUtmVisits = await prisma.visit.count({
    where: { createdAt: { gte: since }, utmSource: { not: null } },
  });
  const totalRegistrations = await prisma.user.count({
    where: { createdAt: { gte: since } },
  });
  const totalUtmRegistrations = await prisma.user.count({
    where: { createdAt: { gte: since }, utmSource: { not: null } },
  });
  const uniqueSessions = await prisma.visit.groupBy({
    by: ["sessionId"],
    where: { createdAt: { gte: since } },
  });

  return NextResponse.json({
    summary: {
      totalVisits,
      totalUtmVisits,
      totalRegistrations,
      totalUtmRegistrations,
      uniqueSessions: uniqueSessions.length,
      days,
    },
    visitsByCampaign: visitsByCampaign.map((v) => ({
      campaign: v.utmCampaign,
      visits: v._count.id,
    })),
    visitsBySource: visitsBySource.map((v) => ({
      source: v.utmSource,
      visits: v._count.id,
    })),
    visitsByMedium: visitsByMedium.map((v) => ({
      medium: v.utmMedium,
      visits: v._count.id,
    })),
    registrationsBySource: registrationsBySource.map((r) => ({
      source: r.utmSource,
      registrations: r._count.id,
    })),
    dailyTrend,
    funnelData,
  });
}
