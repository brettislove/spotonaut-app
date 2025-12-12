import { auth } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";

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

interface FeedbackWithRelations {
  id: string;
  rating: number;
  comment: string | null;
  feedbackType: string | null;
  createdAt: Date;
  user: {
    email: string;
    name: string | null;
  } | null;
  analysis: {
    id: string;
    locationName: string;
    location: string;
  } | null;
}

export default async function AdminFeedbackPage() {
  // Check authentication
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/");
  }

  // Check if user is admin
  if (!isAdmin(session.user.email)) {
    redirect("/");
  }

  // Fetch all feedback with user and analysis information
  const feedbackList: FeedbackWithRelations[] = await prisma.feedback.findMany({
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
      analysis: {
        select: {
          locationName: true,
          location: true,
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  // Calculate statistics
  const totalFeedback = feedbackList.length;
  const averageRating =
    totalFeedback > 0
      ? feedbackList.reduce((sum, f) => sum + f.rating, 0) / totalFeedback
      : 0;

  // Count by type
  const typeBreakdown = feedbackList.reduce((acc, f) => {
    const type = f.feedbackType || "general";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Count by rating (for future use)
  // const ratingBreakdown = feedbackList.reduce(
  //   (acc, f) => {
  //     acc[f.rating] = (acc[f.rating] || 0) + 1;
  //     return acc;
  //   },
  //   {} as Record<number, number>
  // );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("cs-CZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-slate-600 fill-slate-600"
            }`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const getTypeBadgeClass = (type: string | null) => {
    switch (type) {
      case "accuracy":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "chat":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  const getTypeLabel = (type: string | null) => {
    switch (type) {
      case "accuracy":
        return "Přesnost";
      case "chat":
        return "Chat";
      default:
        return "Obecné";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Zpětná vazba
            </span>
          </h1>
          <p className="text-slate-400">
            Přehled zpětné vazby od uživatelů aplikace Spotonaut
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Total Feedback */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-slate-400 text-sm font-medium">
                Celkem hodnocení
              </h3>
              <svg
                className="w-5 h-5 text-blue-400"
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
            <p className="text-3xl font-bold text-white">{totalFeedback}</p>
          </div>

          {/* Average Rating */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-slate-400 text-sm font-medium">
                Průměrné hodnocení
              </h3>
              <svg
                className="w-5 h-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-white">
                {averageRating.toFixed(1)}
              </p>
              <span className="text-slate-400 text-sm">/ 5.0</span>
            </div>
          </div>

          {/* Type Breakdown */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-400 text-sm font-medium">Podle typu</h3>
              <svg
                className="w-5 h-5 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <div className="space-y-2">
              {Object.entries(typeBreakdown).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">
                    {getTypeLabel(type)}
                  </span>
                  <span className="text-white font-medium">
                    {count}{" "}
                    <span className="text-slate-500 text-xs">
                      ({Math.round((count / totalFeedback) * 100)}%)
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feedback Table */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left p-4 text-slate-400 font-medium text-sm">
                    Datum
                  </th>
                  <th className="text-left p-4 text-slate-400 font-medium text-sm">
                    Uživatel
                  </th>
                  <th className="text-left p-4 text-slate-400 font-medium text-sm">
                    Hodnocení
                  </th>
                  <th className="text-left p-4 text-slate-400 font-medium text-sm">
                    Typ
                  </th>
                  <th className="text-left p-4 text-slate-400 font-medium text-sm">
                    Komentář
                  </th>
                  <th className="text-left p-4 text-slate-400 font-medium text-sm">
                    Lokalita
                  </th>
                </tr>
              </thead>
              <tbody>
                {feedbackList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-slate-500">
                      Zatím nebyla přijata žádná zpětná vazba
                    </td>
                  </tr>
                ) : (
                  feedbackList.map((feedback) => (
                    <tr
                      key={feedback.id}
                      className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-4 text-slate-300 text-sm whitespace-nowrap">
                        {formatDate(feedback.createdAt)}
                      </td>
                      <td className="p-4">
                        {feedback.user ? (
                          <div>
                            <div className="text-white text-sm">
                              {feedback.user.email}
                            </div>
                            {feedback.user.name && (
                              <div className="text-slate-500 text-xs">
                                {feedback.user.name}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-700/50 text-slate-400 text-xs">
                            Anonymní
                          </span>
                        )}
                      </td>
                      <td className="p-4">{renderStars(feedback.rating)}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getTypeBadgeClass(
                            feedback.feedbackType
                          )}`}
                        >
                          {getTypeLabel(feedback.feedbackType)}
                        </span>
                      </td>
                      <td className="p-4 max-w-md">
                        {feedback.comment ? (
                          <p className="text-slate-300 text-sm line-clamp-2">
                            {feedback.comment}
                          </p>
                        ) : (
                          <span className="text-slate-600 text-sm italic">
                            Bez komentáře
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {feedback.analysis ? (
                          <div className="text-sm">
                            <div className="text-white">
                              {feedback.analysis.locationName}
                            </div>
                            <div className="text-slate-500 text-xs truncate max-w-[200px]">
                              {feedback.analysis.location}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-sm">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer note */}
        {feedbackList.length === 100 && (
          <div className="mt-4 text-center text-slate-500 text-sm">
            Zobrazeno posledních 100 hodnocení
          </div>
        )}
      </div>
    </div>
  );
}
