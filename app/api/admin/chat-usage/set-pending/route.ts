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
        action: "chat_pending_update",
        resource: "chat_usage",
        result: "denied",
      });
      return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
    }

    const userEmail = (session.user.email || "").toLowerCase();
    const admins = parseAdminEmails();
    if (!admins.includes(userEmail)) {
      await writeAdminAuditEvent(prisma, request.headers, {
        action: "chat_pending_update",
        resource: "chat_usage",
        result: "denied",
        actorEmail: session.user.email,
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { email, requestPending } = body || {};
    if (!email || typeof requestPending !== "boolean") {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existing = await prisma.chatUsage.findUnique({
      where: { userId: user.id },
    });
    if (existing) {
      const updated = await prisma.chatUsage.update({
        where: { userId: user.id },
        data: { requestPending },
      });
      await writeAdminAuditEvent(prisma, request.headers, {
        action: "chat_pending_update",
        resource: "chat_usage",
        result: "success",
        actorEmail: session.user.email,
        details: {
          targetEmail: email,
          requestPending,
          mode: "update",
        },
      });
      return NextResponse.json({
        ok: true,
        requestPending: updated.requestPending,
      });
    }

    const created = await prisma.chatUsage.create({
      data: { userId: user.id, promptCount: 0, quota: 3, requestPending },
    });
    await writeAdminAuditEvent(prisma, request.headers, {
      action: "chat_pending_update",
      resource: "chat_usage",
      result: "success",
      actorEmail: session.user.email,
      details: {
        targetEmail: email,
        requestPending,
        mode: "create",
      },
    });
    return NextResponse.json({
      ok: true,
      requestPending: created.requestPending,
    });
  } catch (err) {
    await writeAdminAuditEvent(prisma, request.headers, {
      action: "chat_pending_update",
      resource: "chat_usage",
      result: "error",
      details: {
        error: err instanceof Error ? err.message : "unknown_error",
      },
    });
    console.error("Admin set-pending error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
