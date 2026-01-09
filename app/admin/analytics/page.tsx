import { redirect } from "next/navigation";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import AnalyticsLineChart from "@/components/analytics/analytics-line-chart";
import AnalyticsPieChart from "@/components/analytics/analytics-pie-chart";
import AnalyticsBarChart from "@/components/analytics/analytics-bar-chart";
import ConversionFunnel from "@/components/analytics/conversion-funnel";
import ApiPerformanceChart from "@/components/analytics/api-performance-chart";
import CohortRetentionChart from "@/components/analytics/cohort-retention-chart";

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

export default async function AdminAnalyticsPage() {
  const session = await auth();

  if (!session?.user?.email || !isAdmin(session.user.email)) {
    redirect("/");
  }

  // Get last 30 days of daily analytics
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const dateStr = thirtyDaysAgo.toISOString().split("T")[0];

  const dailyData = await prisma.dailyAnalytics.findMany({
    where: {
      date: {
        gte: dateStr,
      },
    },
    orderBy: { date: "desc" },
    take: 30,
  });

  // Calculate KPIs
  const totalAnalyses = dailyData.reduce((sum, d) => sum + d.totalAnalyses, 0);
  const totalAnonymous = dailyData.reduce(
    (sum, d) => sum + d.anonymousAnalyses,
    0
  );
  const totalRegistered = dailyData.reduce(
    (sum, d) => sum + d.registeredAnalyses,
    0
  );
  const totalVisitors = dailyData.reduce((sum, d) => sum + d.uniqueVisitors, 0);

  const avgRating =
    dailyData.filter((d) => d.avgFeedbackRating !== null).length > 0
      ? dailyData
          .filter((d) => d.avgFeedbackRating !== null)
          .reduce((sum, d) => sum + (d.avgFeedbackRating || 0), 0) /
        dailyData.filter((d) => d.avgFeedbackRating !== null).length
      : null;

  // Get latest performance data
  const latestPerformance = await prisma.apiPerformance.findFirst({
    orderBy: { date: "desc" },
  });

  const hasErrorAlert =
    latestPerformance &&
    latestPerformance.totalRequests > 0 &&
    latestPerformance.failedRequests / latestPerformance.totalRequests > 0.05;

  const hasResponseTimeAlert =
    latestPerformance && (latestPerformance.avgResponseTimeMs || 0) > 2000;

  // Get API performance data for the last 30 days
  const apiPerformanceData = await prisma.apiPerformance.findMany({
    where: {
      date: {
        gte: dateStr,
      },
    },
    orderBy: { date: "asc" },
  });

  // Get cohort data grouped by week
  const cohortData = await prisma.userCohort.groupBy({
    by: ["cohortWeek"],
    _count: {
      userId: true,
    },
    orderBy: {
      cohortWeek: "desc",
    },
    take: 6,
  });

  // Prepare chart data
  const lineChartData = dailyData
    .slice()
    .reverse()
    .map((day) => ({
      date: day.date,
      totalAnalyses: day.totalAnalyses,
      anonymousAnalyses: day.anonymousAnalyses,
      registeredAnalyses: day.registeredAnalyses,
      uniqueVisitors: day.uniqueVisitors,
    }));

  const pieChartData = [
    {
      name: "Anonymní uživatelé",
      value: totalAnonymous,
      color: "#3b82f6",
    },
    {
      name: "Registrovaní uživatelé",
      value: totalRegistered,
      color: "#a855f7",
    },
  ];

  const barChartData = dailyData
    .slice(0, 7)
    .reverse()
    .map((day) => ({
      name: new Date(day.date).toLocaleDateString("cs-CZ", {
        day: "numeric",
        month: "short",
      }),
      anonymní: day.anonymousAnalyses,
      registrovaní: day.registeredAnalyses,
      návštěvníci: day.uniqueVisitors,
    }));

  // Calculate conversion funnel
  const funnelStages = [
    {
      name: "Návštěvníci stránky",
      value: totalVisitors,
      color: "#3b82f6",
    },
    {
      name: "Zahájené analýzy",
      value: totalAnalyses,
      color: "#8b5cf6",
    },
    {
      name: "Dokončené analýzy",
      value: totalAnalyses, // Assuming all started analyses are completed
      color: "#a855f7",
    },
    {
      name: "Registrace po analýze",
      value: totalRegistered,
      color: "#c026d3",
    },
  ];

  const performanceChartData = apiPerformanceData.map((perf) => ({
    date: perf.date,
    avgResponseTime: perf.avgResponseTimeMs || 0,
    errorRate:
      perf.totalRequests > 0
        ? (perf.failedRequests / perf.totalRequests) * 100
        : 0,
    totalRequests: perf.totalRequests,
  }));

  // Process cohort data - calculate retention from weeklyActivity JSON
  const cohortChartData = cohortData.map((cohort) => {
    const size = cohort._count.userId;
    // For now, show simplified data - full retention calculation would need individual user tracking
    return {
      cohortMonth: cohort.cohortWeek,
      cohortSize: size,
      retentionRates: [100], // Week 0 is always 100%
    };
  });

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Refresh Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-slate-400">Poslední 30 dní aktivit uživatelů</p>
          </div>
          <form action="/api/admin/analytics/refresh" method="POST">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all"
            >
              ↻ Aktualizovat data
            </button>
          </form>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
            <div className="text-slate-400 text-sm mb-2">Celkové analýzy</div>
            <div className="text-3xl font-bold text-white">{totalAnalyses}</div>
            <div className="mt-2 text-sm">
              <span className="text-blue-400">{totalAnonymous}</span>
              <span className="text-slate-500"> anonymní / </span>
              <span className="text-purple-400">{totalRegistered}</span>
              <span className="text-slate-500"> registrovaní</span>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
            <div className="text-slate-400 text-sm mb-2">Návštěvníci</div>
            <div className="text-3xl font-bold text-white">{totalVisitors}</div>
            <div className="mt-2 text-sm text-slate-500">
              Unikátní návštěvníci
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
            <div className="text-slate-400 text-sm mb-2">
              Průměrné hodnocení
            </div>
            <div className="text-3xl font-bold text-white">
              {avgRating ? avgRating.toFixed(1) : "N/A"}
            </div>
            <div className="mt-2 text-sm text-yellow-400">
              {avgRating ? "★★★★★".slice(0, Math.round(avgRating)) : ""}
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
            <div className="text-slate-400 text-sm mb-2">API Performance</div>
            <div className="text-3xl font-bold text-white">
              {latestPerformance?.avgResponseTimeMs?.toFixed(0) || "N/A"}
              <span className="text-lg text-slate-500"> ms</span>
            </div>
            {(hasErrorAlert || hasResponseTimeAlert) && (
              <div className="mt-2">
                <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium">
                  ⚠ Alert
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Charts Section */}
        <div className="space-y-8 mb-8">
          {/* Trend Line Chart */}
          <AnalyticsLineChart
            data={lineChartData}
            lines={[
              {
                dataKey: "totalAnalyses",
                name: "Celkové analýzy",
                color: "#8b5cf6",
              },
              {
                dataKey: "anonymousAnalyses",
                name: "Anonymní",
                color: "#3b82f6",
              },
              {
                dataKey: "registeredAnalyses",
                name: "Registrovaní",
                color: "#a855f7",
              },
              {
                dataKey: "uniqueVisitors",
                name: "Návštěvníci",
                color: "#10b981",
              },
            ]}
            title="Trendy v čase"
          />

          {/* User Type Distribution & Weekly Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AnalyticsPieChart
              data={pieChartData}
              title="Rozdělení uživatelů"
            />
            <AnalyticsBarChart
              data={barChartData}
              bars={[
                { dataKey: "anonymní", name: "Anonymní", color: "#3b82f6" },
                {
                  dataKey: "registrovaní",
                  name: "Registrovaní",
                  color: "#a855f7",
                },
                {
                  dataKey: "návštěvníci",
                  name: "Návštěvníci",
                  color: "#10b981",
                },
              ]}
              title="Poslední týden - porovnání"
            />
          </div>

          {/* Conversion Funnel */}
          <ConversionFunnel stages={funnelStages} title="Konverzní trychtýř" />

          {/* API Performance */}
          {performanceChartData.length > 0 && (
            <ApiPerformanceChart
              data={performanceChartData}
              title="API Performance - poslední 30 dní"
            />
          )}

          {/* Cohort Retention */}
          {cohortChartData.length > 0 && (
            <CohortRetentionChart
              cohorts={cohortChartData}
              title="Kohortní retence (min. 5 uživatelů)"
            />
          )}
        </div>

        {/* Data Table */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            Denní statistiky
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-slate-400 text-sm font-medium pb-3">
                    Datum
                  </th>
                  <th className="text-right text-slate-400 text-sm font-medium pb-3">
                    Analýzy
                  </th>
                  <th className="text-right text-slate-400 text-sm font-medium pb-3">
                    Anonymní
                  </th>
                  <th className="text-right text-slate-400 text-sm font-medium pb-3">
                    Registrovaní
                  </th>
                  <th className="text-right text-slate-400 text-sm font-medium pb-3">
                    Návštěvníci
                  </th>
                  <th className="text-right text-slate-400 text-sm font-medium pb-3">
                    Hodnocení
                  </th>
                </tr>
              </thead>
              <tbody>
                {dailyData.map((day) => (
                  <tr
                    key={day.date}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30"
                  >
                    <td className="py-3 text-white">{day.date}</td>
                    <td className="py-3 text-right text-white">
                      {day.totalAnalyses}
                    </td>
                    <td className="py-3 text-right text-blue-400">
                      {day.anonymousAnalyses}
                    </td>
                    <td className="py-3 text-right text-purple-400">
                      {day.registeredAnalyses}
                    </td>
                    <td className="py-3 text-right text-white">
                      {day.uniqueVisitors}
                    </td>
                    <td className="py-3 text-right text-white">
                      {day.avgFeedbackRating?.toFixed(1) || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Export Button */}
          <div className="mt-6 flex justify-end">
            <a
              href={`/api/admin/analytics/export?type=daily&startDate=${dateStr}&endDate=${
                new Date().toISOString().split("T")[0]
              }`}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all border border-slate-700"
            >
              ↓ Export CSV
            </a>
          </div>
        </div>

        {/* Export & Documentation */}
        <div className="mt-8 bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-300 text-sm">
            <strong>💡 Tip:</strong> Data se automaticky agregují každou hodinu
            a den. Pro manuální aktualizaci použijte tlačítko &quot;Aktualizovat
            data&quot; nahoře.
          </p>
        </div>
      </div>

      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10" />
    </div>
  );
}
