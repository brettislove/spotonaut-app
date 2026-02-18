import { redirect } from "next/navigation";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import AnalyticsPieChart from "@/components/analytics/analytics-pie-chart";
import AnalyticsBarChart from "@/components/analytics/analytics-bar-chart";
import ConversionFunnel from "@/components/analytics/conversion-funnel";
import ApiPerformanceChart from "@/components/analytics/api-performance-chart";
import CohortRetentionChart from "@/components/analytics/cohort-retention-chart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RefreshCw,
  Download,
  AlertTriangle,
  Star,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { ChartConfig } from "@/components/ui/chart";
import AnalyticsLineChart from "@/components/analytics/analytics-line-chart";

const chartConfig = {
  analyses: {
    label: "Analýzy",
  },
  totalAnalyses: {
    label: "Celkové analýzy",
    color: "var(--chart-1)",
  },
  anonymousAnalyses: {
    label: "Anonymní analýzy",
    color: "var(--chart-2)",
  },
  registeredAnalyses: {
    label: "Registrované analýzy",
    color: "var(--chart-3)",
  },
  uniqueVisitors: {
    label: "Návštěvníci",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

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
    0,
  );
  const totalRegistered = dailyData.reduce(
    (sum, d) => sum + d.registeredAnalyses,
    0,
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
    <section className="py-16 md:pt-32 md:pb-24">
      <div className="mx-auto max-w-7xl px-6">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zpět na dashboard
          </Button>
        </Link>
        {/* Header with Refresh Button */}
        <div className="flex items-center justify-between mb-12 md:mb-20">
          <div>
            <h1 className="text-4xl font-semibold lg:text-5xl">
              Přehled analýz a API požadavků
            </h1>
          </div>
          <form action="/api/admin/analytics/refresh" method="POST">
            <Button type="submit" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Aktualizovat data
            </Button>
          </form>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Celkové analýzy</CardDescription>
              <CardTitle className="text-3xl">{totalAnalyses}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <span className="text-blue-600">{totalAnonymous}</span>
                <span> anonymní / </span>
                <span className="text-purple-600">{totalRegistered}</span>
                <span> registrovaní</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Návštěvníci</CardDescription>
              <CardTitle className="text-3xl">{totalVisitors}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Unikátní návštěvníci
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Průměrné hodnocení</CardDescription>
              <CardTitle className="text-3xl">
                {avgRating ? avgRating.toFixed(1) : "N/A"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1">
                {avgRating && (
                  <>
                    {Array.from({ length: Math.round(avgRating) }, (_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>API Performance</CardDescription>
              <CardTitle className="text-3xl">
                {latestPerformance?.avgResponseTimeMs?.toFixed(0) || "N/A"}
                <span className="text-lg text-muted-foreground ml-1">ms</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(hasErrorAlert || hasResponseTimeAlert) && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Alert
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="space-y-8 mb-8">
          {/* Trend Line Chart */}
          {/* <AnalyticsLineChart
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
          /> */}
          <AnalyticsLineChart
            chartConfig={chartConfig}
            lineChartData={lineChartData}
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
        <Card>
          <CardHeader>
            <CardTitle>Denní statistiky</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left">Datum</TableHead>
                  <TableHead className="text-right">Analýzy</TableHead>
                  <TableHead className="text-right">Anonymní</TableHead>
                  <TableHead className="text-right">Registrovaní</TableHead>
                  <TableHead className="text-right">Návštěvníci</TableHead>
                  <TableHead className="text-right">Hodnocení</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyData.map((day) => (
                  <TableRow key={day.date}>
                    <TableCell>{day.date}</TableCell>
                    <TableCell className="text-right font-medium">
                      {day.totalAnalyses}
                    </TableCell>
                    <TableCell className="text-right text-blue-600">
                      {day.anonymousAnalyses}
                    </TableCell>
                    <TableCell className="text-right text-purple-600">
                      {day.registeredAnalyses}
                    </TableCell>
                    <TableCell className="text-right">
                      {day.uniqueVisitors}
                    </TableCell>
                    <TableCell className="text-right">
                      {day.avgFeedbackRating?.toFixed(1) || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Export Button */}
            <div className="mt-6 flex justify-end">
              <Button asChild variant="outline" className="gap-2">
                <a
                  href={`/api/admin/analytics/export?type=daily&startDate=${dateStr}&endDate=${
                    new Date().toISOString().split("T")[0]
                  }`}
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export & Documentation */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              <strong>💡 Tip:</strong> Data se automaticky agregují každou
              hodinu a den. Pro manuální aktualizaci použijte tlačítko
              &quot;Aktualizovat data&quot; nahoře.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
