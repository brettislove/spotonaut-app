import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function parseAdminEmails(): string[] {
  const env = process.env.ADMIN_EMAILS;
  if (!env) return [];
  try {
    const parsed = JSON.parse(env);
    if (Array.isArray(parsed))
      return parsed.map((e) => String(e).toLowerCase());
  } catch (e) {
    console.error("Failed to parse ADMIN_EMAILS", e);
  }
  return [];
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      // Avoid exposing raw English/technical messages to users
      return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const userEmail = (session.user.email || "").toLowerCase();

    const adminEmails = parseAdminEmails();
    if (userEmail && adminEmails.includes(userEmail)) {
      return NextResponse.json({
        allowed: true,
        remaining: Number.POSITIVE_INFINITY,
      });
    }

    // Atomically increment promptCount when promptCount < quota using
    // a parameterized query so Postgres placeholders are handled correctly.
    // Use the tagged `$executeRaw` so the `userId` parameter is bound safely.
    const res = await prisma.$executeRaw`
      UPDATE chat_usage
      SET promptCount = promptCount + 1, updatedAt = CURRENT_TIMESTAMP
      WHERE userId = ${userId} AND promptCount < quota
    `;

    // $executeRawUnsafe returns number of affected rows for UPDATE
    if (res === 0) {
      // No rows updated — either no record exists or quota reached
      const existing = await prisma.chatUsage.findUnique({ where: { userId } });
      if (!existing) {
        // Create record and consume first prompt
        const created = await prisma.chatUsage.create({
          data: { userId, promptCount: 1, quota: 3 },
        });
        return NextResponse.json({
          allowed: true,
          remaining: Math.max(0, created.quota - created.promptCount),
        });
      }

      if (existing.promptCount >= existing.quota) {
        return NextResponse.json(
          { allowed: false, limitExceeded: true },
          { status: 403 }
        );
      }

      // If here, attempt update again (race retry)
      const retry = await prisma.$executeRaw`
        UPDATE chat_usage
        SET promptCount = promptCount + 1, updatedAt = CURRENT_TIMESTAMP
        WHERE userId = ${userId} AND promptCount < quota
      `;
      if (retry === 0) {
        return NextResponse.json(
          { allowed: false, limitExceeded: true },
          { status: 403 }
        );
      }

      const updated = await prisma.chatUsage.findUnique({ where: { userId } });
      return NextResponse.json({
        allowed: true,
        remaining: Math.max(
          0,
          (updated?.quota || 3) - (updated?.promptCount || 0)
        ),
      });
    }

    // Updated successfully — fetch current usage
    const usage = await prisma.chatUsage.findUnique({ where: { userId } });
    return NextResponse.json({
      allowed: true,
      remaining: Math.max(
        0,
        usage?.quota ? usage.quota - usage.promptCount : 0
      ),
    });
  } catch (err) {
    // Generate a short error id for correlation in logs (safe to show to users)
    const errorId = `${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    console.error("Claim error", { errorId, err });

    // Return a friendly, non-technical message. Include the errorId so
    // support can correlate logs if the user reports the issue.
    return NextResponse.json(
      {
        error:
          "Nastal problém při zpracování požadavku. Zkuste to prosím později.",
        errorId,
      },
      { status: 500 }
    );
  }
}
