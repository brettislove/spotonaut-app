import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the 4 most recent analyses for the user
    const analyses = await prisma.analysis.findMany({
      where: {
        userId: user.id,
        completedSuccessfully: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 4,
      select: {
        id: true,
        locationName: true,
        location: true,
        coordinates: true,
        metrics: true,
        businessType: true,
        createdAt: true,
      },
    });

    return NextResponse.json(analyses);
  } catch (error) {
    console.error("Error fetching recent analyses:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent analyses" },
      { status: 500 },
    );
  }
}
