import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
    }

    const userId = session.user.id as string;

    // Upsert chatUsage record and set requestPending = true
    const existing = await prisma.chatUsage.findUnique({ where: { userId } });
    if (existing) {
      if (existing.requestPending) {
        return NextResponse.json({ ok: true, message: "already_pending" });
      }
      await prisma.chatUsage.update({
        where: { userId },
        data: { requestPending: true },
      });
      return NextResponse.json({ ok: true });
    }

    // Create a record with requestPending true; keep default quota
    await prisma.chatUsage.create({
      data: { userId, promptCount: 0, quota: 3, requestPending: true },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Prompts request error", err);
    return NextResponse.json(
      { error: "Nastala chyba při odesílání požadavku" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { Resend } from "resend";

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email || "";
    const userName = session.user.name || "";

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const RESEND_FROM =
      process.env.RESEND_FROM || "Tým Spotonaut <crew@spotonaut.com>";
    const CREW_TO = process.env.CONTACT_TO || "crew@spotonaut.com";

    if (!RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Email provider not configured" },
        { status: 500 }
      );
    }

    const resend = new Resend(RESEND_API_KEY);

    const subject = `Request for more prompts: ${userEmail}`;
    const html = `
      <p>User <strong>${escapeHtml(
        userName || userEmail
      )}</strong> (${escapeHtml(userEmail)}) requested more chat prompts.</p>
      <p>Please review and increase the user's quota if appropriate.</p>
    `;

    try {
      const data = await resend.emails.send({
        from: RESEND_FROM,
        to: [CREW_TO],
        subject,
        html,
      });
      console.log("Resend crew email sent:", data);
    } catch (error) {
      console.error("Resend error (crew):", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 502 }
      );
    }

    // Send confirmation to user
    const userSubject = `We've received your request for more chat prompts`;
    const userHtml = `
      <p>Hi ${escapeHtml(userName || "")},</p>
      <p>We received your request for additional chat prompts. Our team will review it and get back to you shortly.</p>
      <p>Thanks — the Spotonaut team</p>
    `;

    try {
      const sent = await resend.emails.send({
        from: RESEND_FROM,
        to: [userEmail],
        subject: userSubject,
        html: userHtml,
      });
      console.log("Resend user confirmation sent:", sent);
    } catch (error) {
      console.error("Resend error (user):", error);
      // Log but still return success for crew send
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
