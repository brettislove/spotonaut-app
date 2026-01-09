import { redirect } from "next/navigation";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { PrismaClient } from "@prisma/client";

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
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-400">
            Centrální rozcestník pro správu aplikace
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feedback Card */}
          <Link
            href="/admin/feedback"
            className="group relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white">Feedback</h2>
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">
                    {totalFeedback}
                  </span>
                  <span className="text-sm text-slate-400">celkem</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">★</span>
                  <span className="text-lg font-semibold text-white">
                    {avgRating._avg.rating?.toFixed(1) || "N/A"}
                  </span>
                  <span className="text-sm text-slate-400">průměr</span>
                </div>
              </div>
              <div className="mt-4 text-sm text-blue-400 group-hover:text-blue-300 transition-colors">
                Zobrazit zpětnou vazbu →
              </div>
            </div>
          </Link>

          {/* Chat Usage Card */}
          <Link
            href="/admin/chat-usage"
            className="group relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white">Chat Kvóty</h2>
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">
                    {totalUsers}
                  </span>
                  <span className="text-sm text-slate-400">uživatelů</span>
                </div>
                {pendingQuotaRequests > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded-lg text-xs font-medium">
                      {pendingQuotaRequests} čekajících
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-4 text-sm text-purple-400 group-hover:text-purple-300 transition-colors">
                Spravovat kvóty →
              </div>
            </div>
          </Link>

          {/* Analytics Card */}
          <Link
            href="/admin/analytics"
            className="group relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-green-500/50 transition-all duration-300 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white">Analytika</h2>
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">
                    {analysesThisWeek}
                  </span>
                  <span className="text-sm text-slate-400">
                    analýz tento týden
                  </span>
                </div>
                {hasPerformanceAlert && (
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium">
                      ⚠ Performance alert
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-4 text-sm text-green-400 group-hover:text-green-300 transition-colors">
                Zobrazit analytiku →
              </div>
            </div>
          </Link>
        </div>

        {/* Ambient glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10" />
      </div>
    </div>
  );
}
