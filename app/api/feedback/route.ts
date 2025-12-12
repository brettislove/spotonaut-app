import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
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

// POST: Submit feedback
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();

    const { rating, comment, feedbackType, analysisId } = body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Get fingerprint from headers if anonymous
    const fingerprint = request.headers.get("x-fingerprint");

    // Validate userId - try by ID first, then fall back to email lookup
    let validUserId = null;
    if (session?.user?.id) {
      const userById = await prisma.user.findUnique({
        where: { id: session.user.id },
      });
      if (userById) {
        validUserId = session.user.id;
      } else if (session?.user?.email) {
        // User ID doesn't exist (maybe DB was reset), try finding by email
        const userByEmail = await prisma.user.findUnique({
          where: { email: session.user.email },
        });
        if (userByEmail) {
          validUserId = userByEmail.id;
        }
      }
    }

    // Validate analysisId exists if provided
    let validAnalysisId = null;
    if (analysisId) {
      const analysisExists = await prisma.analysis.findUnique({
        where: { id: analysisId },
      });
      if (analysisExists) {
        validAnalysisId = analysisId;
      }
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        userId: validUserId,
        analysisId: validAnalysisId,
        rating: parseInt(rating),
        comment: comment?.trim() || null,
        feedbackType: feedbackType || null,
        fingerprint: !validUserId ? fingerprint : null,
      },
    });

    return NextResponse.json({
      success: true,
      feedbackId: feedback.id,
      message: "Feedback submitted successfully",
    });
  } catch (error) {
    console.error("Feedback submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

// GET: Admin endpoint to retrieve all feedback
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

    // Fetch all feedback with user and analysis information
    const feedbackList = await prisma.feedback.findMany({
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

    // Count by rating
    const ratingBreakdown = feedbackList.reduce((acc, f) => {
      acc[f.rating] = (acc[f.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return NextResponse.json({
      feedback: feedbackList,
      stats: {
        total: totalFeedback,
        averageRating: Math.round(averageRating * 10) / 10,
        typeBreakdown,
        ratingBreakdown,
        typeBreakdownPercent: Object.entries(typeBreakdown).reduce(
          (acc, [key, value]) => {
            acc[key] = Math.round((value / totalFeedback) * 100);
            return acc;
          },
          {} as Record<string, number>
        ),
      },
    });
  } catch (error) {
    console.error("Feedback retrieval error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve feedback" },
      { status: 500 }
    );
  }
}
