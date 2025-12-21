import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message } = body || {};

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const RESEND_FROM =
      process.env.RESEND_FROM ||
      `noreply@${process.env.NEXT_PUBLIC_SITE_DOMAIN || "example.com"}`;
    const CONTACT_TO = process.env.CONTACT_TO || "crew@spotonaut.com";

    if (!RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Email provider not configured" },
        { status: 500 }
      );
    }

    const subject = `Kontakt: ${name}`;
    const html = `
      <p><strong>Jméno:</strong> ${escapeHtml(name)}</p>
      <p><strong>E‑mail:</strong> ${escapeHtml(email)}</p>
      <p><strong>Zpráva:</strong></p>
      <div>${escapeHtml(message).replace(/\n/g, "<br />")}</div>
    `;

    const payload = {
      from: RESEND_FROM,
      to: CONTACT_TO,
      subject,
      html,
    };

    const res = await fetch("https://api.resend.com/v1/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("Resend error:", text);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
