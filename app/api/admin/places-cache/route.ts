import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// Admin email check
function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  try {
    const adminEmails = JSON.parse(process.env.ADMIN_EMAILS || "[]");
    return adminEmails.includes(email);
  } catch {
    return false;
  }
}

/**
 * GET /api/admin/places-cache
 * View cache statistics and recent errors
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get cache statistics
    const totalCached = await prisma.placesApiCache.count();
    const now = new Date();
    const activeCached = await prisma.placesApiCache.count({
      where: {
        expiresAt: {
          gte: now,
        },
      },
    });
    const expiredCached = totalCached - activeCached;

    // Get usage statistics
    const currentMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
    const currentUsage = await prisma.placesApiUsage.findUnique({
      where: { month: currentMonth },
    });

    // Get recent cache entries
    const recentCache = await prisma.placesApiCache.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        lat: true,
        lng: true,
        businessType: true,
        radius: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    // Get recent errors
    const recentErrors = await prisma.placesApiError.findMany({
      take: 20,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Group errors by type
    const errorsByType = recentErrors.reduce((acc, error) => {
      const key = error.errorCode || "unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get errors by business type
    const errorsByBusinessType = recentErrors.reduce((acc, error) => {
      acc[error.businessType] = (acc[error.businessType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      cache: {
        total: totalCached,
        active: activeCached,
        expired: expiredCached,
        recent: recentCache,
      },
      usage: {
        month: currentMonth,
        count: currentUsage?.count || 0,
        limit: currentUsage?.monthlyLimit || 5000,
        remaining:
          (currentUsage?.monthlyLimit || 5000) - (currentUsage?.count || 0),
      },
      errors: {
        total: recentErrors.length,
        byType: errorsByType,
        byBusinessType: errorsByBusinessType,
        recent: recentErrors.map((e) => ({
          id: e.id,
          lat: e.lat,
          lng: e.lng,
          businessType: e.businessType,
          errorMessage: e.errorMessage,
          errorCode: e.errorCode,
          createdAt: e.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching Places API cache stats:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch cache statistics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/places-cache
 * Clear cache entries
 * Query params:
 * - all=true: Clear all cache entries
 * - expired=true: Clear only expired entries
 * - locationHash=xxx: Clear specific location
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const clearAll = searchParams.get("all") === "true";
    const clearExpired = searchParams.get("expired") === "true";
    const locationHash = searchParams.get("locationHash");

    let deletedCount = 0;

    if (locationHash) {
      // Clear specific location
      await prisma.placesApiCache.delete({
        where: { locationHash },
      });
      deletedCount = 1;
    } else if (clearExpired) {
      // Clear expired entries
      const now = new Date();
      const result = await prisma.placesApiCache.deleteMany({
        where: {
          expiresAt: {
            lt: now,
          },
        },
      });
      deletedCount = result.count;
    } else if (clearAll) {
      // Clear all cache
      const result = await prisma.placesApiCache.deleteMany({});
      deletedCount = result.count;
    } else {
      return NextResponse.json(
        {
          error:
            "Invalid request. Use ?all=true, ?expired=true, or ?locationHash=xxx",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Successfully cleared ${deletedCount} cache ${
        deletedCount === 1 ? "entry" : "entries"
      }`,
    });
  } catch (error) {
    console.error("Error clearing Places API cache:", error);
    return NextResponse.json(
      {
        error: "Failed to clear cache",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
