import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { writeAdminAuditEvent } from "@/lib/security/admin-audit";

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
      await writeAdminAuditEvent(prisma, request.headers, {
        action: "chat_quota_update",
        resource: "chat_usage",
        result: "denied",
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = (session.user.email || "").toLowerCase();
    const admins = parseAdminEmails();
    if (!admins.includes(userEmail)) {
      await writeAdminAuditEvent(prisma, request.headers, {
        action: "chat_quota_update",
        resource: "chat_usage",
        result: "denied",
        actorEmail: session.user.email,
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { email, quota } = body || {};
    if (!email || typeof quota !== "number") {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Upsert ChatUsage record
    const existing = await prisma.chatUsage.findUnique({
      where: { userId: user.id },
    });
    if (existing) {
      const updated = await prisma.chatUsage.update({
        where: { userId: user.id },
        data: { quota },
      });
      await writeAdminAuditEvent(prisma, request.headers, {
        action: "chat_quota_update",
        resource: "chat_usage",
        result: "success",
        actorEmail: session.user.email,
        details: {
          targetEmail: email,
          quota,
          mode: "update",
        },
      });
      return NextResponse.json({ ok: true, quota: updated.quota });
    }

    const created = await prisma.chatUsage.create({
      data: { userId: user.id, quota, promptCount: 0 },
    });
    await writeAdminAuditEvent(prisma, request.headers, {
      action: "chat_quota_update",
      resource: "chat_usage",
      result: "success",
      actorEmail: session.user.email,
      details: {
        targetEmail: email,
        quota,
        mode: "create",
      },
    });
    return NextResponse.json({ ok: true, quota: created.quota });
  } catch (err) {
    await writeAdminAuditEvent(prisma, request.headers, {
      action: "chat_quota_update",
      resource: "chat_usage",
      result: "error",
      details: {
        error: err instanceof Error ? err.message : "unknown_error",
      },
    });
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
