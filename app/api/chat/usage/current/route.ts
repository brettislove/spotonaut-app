import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function parseAdminEmails(): string[] {
  try {
    const adminEmailsEnv = process.env.ADMIN_EMAILS;
    if (!adminEmailsEnv) return [];
    const parsed = JSON.parse(adminEmailsEnv);
    return Array.isArray(parsed) ? parsed.map((e) => e.toLowerCase()) : [];
  } catch (error) {
    console.error("Failed to parse ADMIN_EMAILS:", error);
    return [];
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email.toLowerCase();
    const adminEmails = parseAdminEmails();
    const isAdmin = adminEmails.includes(userEmail);

    // Admin users have unlimited credits
    if (isAdmin) {
      return NextResponse.json({
        unlimited: true,
        promptCount: 0,
        quota: null,
        remaining: Infinity,
        quotaSource: "admin",
        requestPending: false,
      });
    }

    // Fetch regular user's credit usage
    const userId = session.user.id as string;
    const usage = await prisma.chatUsage.findUnique({
      where: { userId },
    });

    // If no record exists, return default quota
    if (!usage) {
      return NextResponse.json({
        promptCount: 0,
        quota: 3,
        remaining: 3,
        unlimited: false,
        quotaSource: "default",
        requestPending: false,
      });
    }

    // Calculate remaining credits
    const remaining =
      usage.quota === null
        ? Infinity
        : Math.max(0, usage.quota - usage.promptCount);

    return NextResponse.json({
      promptCount: usage.promptCount,
      quota: usage.quota,
      remaining,
      unlimited: usage.quota === null,
      quotaSource: usage.quotaSource || "default",
      requestPending: usage.requestPending,
    });
  } catch (error) {
    console.error("Error fetching credit usage:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
