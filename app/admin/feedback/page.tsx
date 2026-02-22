import { auth } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Star, BarChart3, MessageSquare, Users } from "lucide-react";
import Link from "next/link";

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
  const typeBreakdown = feedbackList.reduce(
    (acc, f) => {
      const type = f.feedbackType || "general";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

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
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
    );
  };

  const getTypeBadgeVariant = (
    type: string | null,
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case "accuracy":
        return "default";
      case "chat":
        return "secondary";
      default:
        return "outline";
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
    <section className="py-16 md:pt-32 md:pb-24">
      <div className="mx-auto max-w-7xl px-6">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zpět na dashboard
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-12 md:mb-20">
          <h1 className="text-4xl font-semibold lg:text-5xl">Zpětná vazba</h1>
          <p className="text-muted-foreground">
            Přehled zpětné vazby od uživatelů aplikace Spotonaut
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Total Feedback */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Celkem hodnocení
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalFeedback}</div>
            </CardContent>
          </Card>

          {/* Average Rating */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Průměrné hodnocení
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold">
                  {averageRating.toFixed(1)}
                </div>
                <span className="text-muted-foreground text-sm">/ 5.0</span>
              </div>
            </CardContent>
          </Card>

          {/* Type Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Podle typu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(typeBreakdown).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm">{getTypeLabel(type)}</span>
                    <span className="font-medium">
                      {count}{" "}
                      <span className="text-muted-foreground text-xs">
                        ({Math.round((count / totalFeedback) * 100)}%)
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Table */}
        <Card>
          <CardHeader>
            <CardTitle>Všechna hodnocení</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Uživatel</TableHead>
                  <TableHead>Hodnocení</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Komentář</TableHead>
                  <TableHead>Lokalita</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbackList.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Zatím nebyla přijata žádná zpětná vazba
                    </TableCell>
                  </TableRow>
                ) : (
                  feedbackList.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(feedback.createdAt)}
                      </TableCell>
                      <TableCell>
                        {feedback.user ? (
                          <div>
                            <div className="font-medium">
                              {feedback.user.email}
                            </div>
                            {feedback.user.name && (
                              <div className="text-sm text-muted-foreground">
                                {feedback.user.name}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Badge variant="secondary">Anonymní</Badge>
                        )}
                      </TableCell>
                      <TableCell>{renderStars(feedback.rating)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={getTypeBadgeVariant(feedback.feedbackType)}
                        >
                          {getTypeLabel(feedback.feedbackType)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        {feedback.comment ? (
                          <p className="line-clamp-2">{feedback.comment}</p>
                        ) : (
                          <span className="text-muted-foreground italic">
                            Bez komentáře
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {feedback.analysis ? (
                          <div>
                            <div className="font-medium">
                              {feedback.analysis.locationName}
                            </div>
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {feedback.analysis.location}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Footer note */}
            {feedbackList.length === 100 && (
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Zobrazeno posledních 100 hodnocení
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
