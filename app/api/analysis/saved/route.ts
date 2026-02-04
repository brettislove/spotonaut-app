import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET - Load user's saved analysis
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the user's saved analysis (only one allowed)
    const savedAnalysis = await prisma.analysis.findFirst({
      where: {
        userId: user.id,
        isSavedAnalysis: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!savedAnalysis) {
      return NextResponse.json({ analysis: null }, { status: 200 });
    }

    return NextResponse.json({
      analysis: {
        id: savedAnalysis.id,
        locationName: savedAnalysis.locationName,
        location: savedAnalysis.location,
        coordinates: savedAnalysis.coordinates,
        metrics: savedAnalysis.metrics,
        groundingSources: savedAnalysis.groundingSources,
        groundedLocationData: savedAnalysis.groundedLocationData,
        chatMessages: savedAnalysis.chatMessages,
        businessType: savedAnalysis.businessType,
        createdAt: savedAnalysis.createdAt,
      },
    });
  } catch (error) {
    console.error("Error loading saved analysis:", error);
    return NextResponse.json(
      { error: "Failed to load saved analysis" },
      { status: 500 },
    );
  }
}

// POST - Save/overwrite user's analysis
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has an existing saved analysis
    const existingAnalysis = await prisma.analysis.findFirst({
      where: {
        userId: user.id,
        isSavedAnalysis: true,
      },
    });

    // Delete existing saved analysis if present
    if (existingAnalysis) {
      await prisma.analysis.delete({
        where: { id: existingAnalysis.id },
      });
    }

    // Create new saved analysis
    const newAnalysis = await prisma.analysis.create({
      data: {
        userId: user.id,
        locationName: data.locationName || data.location,
        location: data.location,
        coordinates: data.coordinates || null,
        metrics: data.metrics || {
          localityScore: 0,
          footfallScore: 0,
          recommendedHours: "",
        },
        groundingSources: data.groundingSources || null,
        groundedLocationData: data.groundedLocationData || null,
        chatMessages: data.chatMessages || null,
        usedMapsGrounding: data.usedMapsGrounding || false,
        completedSuccessfully: true,
        isSavedAnalysis: true,
      },
    });

    return NextResponse.json({
      success: true,
      analysisId: newAnalysis.id,
      hadExisting: !!existingAnalysis,
    });
  } catch (error) {
    console.error("Error saving analysis:", error);
    return NextResponse.json(
      { error: "Failed to save analysis" },
      { status: 500 },
    );
  }
}

// DELETE - Delete user's saved analysis
export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete the user's saved analysis
    const deleted = await prisma.analysis.deleteMany({
      where: {
        userId: user.id,
        isSavedAnalysis: true,
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleted.count,
    });
  } catch (error) {
    console.error("Error deleting saved analysis:", error);
    return NextResponse.json(
      { error: "Failed to delete saved analysis" },
      { status: 500 },
    );
  }
}

// HEAD - Check if user has a saved analysis (for quick check without loading data)
export async function HEAD() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return new NextResponse(null, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse(null, { status: 404 });
    }

    const hasAnalysis = await prisma.analysis.findFirst({
      where: {
        userId: user.id,
        isSavedAnalysis: true,
      },
      select: { id: true },
    });

    return new NextResponse(null, {
      status: 200,
      headers: {
        "X-Has-Saved-Analysis": hasAnalysis ? "true" : "false",
      },
    });
  } catch (error) {
    console.error("Error checking saved analysis:", error);
    return new NextResponse(null, { status: 500 });
  }
}
