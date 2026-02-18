import { redirect } from "next/navigation";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, BarChart3, Star, QrCode } from "lucide-react";

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

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.email || !isAdmin(session.user.email)) {
    redirect("/");
  }

  // Get quick stats
  const totalFeedback = await prisma.feedback.count();
  const avgRating = await prisma.feedback.aggregate({
    _avg: { rating: true },
  });

  const totalUsers = await prisma.user.count();
  const pendingQuotaRequests = await prisma.chatUsage.count({
    where: { requestPending: true },
  });

  // Get analyses this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const analysesThisWeek = await prisma.analysis.count({
    where: {
      createdAt: { gte: weekAgo },
    },
  });

  // Get visit stats for traffic card
  const totalVisits = await prisma.visit.count({
    where: { createdAt: { gte: weekAgo } },
  });
  const utmVisits = await prisma.visit.count({
    where: { createdAt: { gte: weekAgo }, utmSource: { not: null } },
  });

  // Check latest performance data for alerts
  const latestPerformance = await prisma.apiPerformance.findFirst({
    orderBy: { date: "desc" },
  });

  const hasPerformanceAlert =
    latestPerformance &&
    ((latestPerformance.totalRequests > 0 &&
      latestPerformance.failedRequests / latestPerformance.totalRequests >
        0.05) ||
      (latestPerformance.avgResponseTimeMs || 0) > 2000);

  return (
    <section className="py-16 md:pt-32 md:pb-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mx-auto max-w-2xl space-y-6 text-center mb-12 md:mb-20">
          <h1 className="text-4xl font-semibold lg:text-5xl">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Centrální rozcestník pro správu aplikace
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {/* Feedback Card */}
          <Link href="/admin/feedback">
            <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:border-primary/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Feedback</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{totalFeedback}</span>
                    <span className="text-sm text-muted-foreground">
                      celkem
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-lg font-semibold">
                      {avgRating._avg.rating?.toFixed(1) || "N/A"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      průměr
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardContent className="pt-0">
                <Button
                  variant="ghost"
                  className="w-full justify-start p-0 h-auto text-primary hover:text-primary/80"
                >
                  Zobrazit zpětnou vazbu →
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Chat Usage Card */}
          <Link href="/admin/chat-usage">
            <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:border-primary/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Chat Kvóty</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{totalUsers}</span>
                    <span className="text-sm text-muted-foreground">
                      uživatelů
                    </span>
                  </div>
                  {pendingQuotaRequests > 0 && (
                    <Badge variant="secondary" className="w-fit">
                      {pendingQuotaRequests} čekajících
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardContent className="pt-0">
                <Button
                  variant="ghost"
                  className="w-full justify-start p-0 h-auto text-primary hover:text-primary/80"
                >
                  Spravovat kvóty →
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Analytics Card */}
          <Link href="/admin/analytics">
            <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:border-primary/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Analytika</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">
                      {analysesThisWeek}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      analýz tento týden
                    </span>
                  </div>
                  {hasPerformanceAlert && (
                    <Badge variant="destructive" className="w-fit">
                      ⚠ Performance alert
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardContent className="pt-0">
                <Button
                  variant="ghost"
                  className="w-full justify-start p-0 h-auto text-primary hover:text-primary/80"
                >
                  Zobrazit analytiku →
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Traffic / UTM Card */}
          <Link href="/admin/traffic">
            <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:border-primary/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>UTM Kampaně</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{totalVisits}</span>
                    <span className="text-sm text-muted-foreground">
                      návštěv tento týden
                    </span>
                  </div>
                  {utmVisits > 0 && (
                    <Badge variant="secondary" className="w-fit">
                      {utmVisits} s UTM parametry
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardContent className="pt-0">
                <Button
                  variant="ghost"
                  className="w-full justify-start p-0 h-auto text-primary hover:text-primary/80"
                >
                  Zobrazit statistiky →
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </section>
  );
}
