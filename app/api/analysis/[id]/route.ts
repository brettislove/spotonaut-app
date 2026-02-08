import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET - Load analysis by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
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

    // Find the analysis by ID
    const analysis = await prisma.analysis.findUnique({
      where: { id },
    });

    if (!analysis) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 },
      );
    }

    // Check ownership - analysis must belong to the user
    if (analysis.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      analysis: {
        id: analysis.id,
        locationName: analysis.locationName,
        location: analysis.location,
        coordinates: analysis.coordinates,
        metrics: analysis.metrics,
        groundingSources: analysis.groundingSources,
        groundedLocationData: analysis.groundedLocationData,
        chatMessages: analysis.chatMessages,
        businessType: analysis.businessType,
        operatingHours: analysis.operatingHours,
        timeframe: analysis.timeframe,
        usedMapsGrounding: analysis.usedMapsGrounding,
        completedSuccessfully: analysis.completedSuccessfully,
        isSavedAnalysis: analysis.isSavedAnalysis,
        createdAt: analysis.createdAt,
      },
    });
  } catch (error) {
    console.error("Error loading analysis:", error);
    return NextResponse.json(
      { error: "Failed to load analysis" },
      { status: 500 },
    );
  }
}
