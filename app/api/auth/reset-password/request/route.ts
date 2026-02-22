import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json({ error: "Email je povinný" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Neplatný formát emailu" },
        { status: 400 },
      );
    }

    // Check rate limiting - max 3 requests per hour per email
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentTokens = await prisma.passwordResetToken.findMany({
      where: {
        user: {
          email: email,
        },
        createdAt: {
          gte: oneHourAgo,
        },
      },
    });

    if (recentTokens.length >= 3) {
      return NextResponse.json(
        { error: "Příliš mnoho požadavků. Zkuste to prosím za hodinu." },
        { status: 403 },
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      // Generate secure random token
      const token = crypto.randomBytes(32).toString("hex");

      // Set expiration to 1 hour from now
      const expires = new Date(Date.now() + 60 * 60 * 1000);

      // Store token in database
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expires,
        },
      });

      // Send password reset email via Resend
      try {
        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        const RESEND_FROM =
          process.env.RESEND_FROM || "Tým Spotonaut <crew@spotonaut.com>";
        const NEXTAUTH_URL =
          process.env.NEXTAUTH_URL || "http://localhost:3000";

        if (RESEND_API_KEY) {
          const resend = new Resend(RESEND_API_KEY);
          const resetLink = `${NEXTAUTH_URL}/reset-password?token=${token}`;
          const subject = `Spotonaut — obnovení hesla`;
          const html = `
            <p>Ahoj ${user.name ? `${user.name},` : ""}</p>
            <p>Obdrželi jsme požadavek na obnovení hesla pro váš účet Spotonaut.</p>
            <p>Pro obnovení hesla klikněte na následující odkaz:</p>
            <p><a href="${resetLink}" style="color: #22c55e; font-weight: bold;">${resetLink}</a></p>
            <p><strong>Tento odkaz platí po dobu 1 hodiny.</strong></p>
            <p>Pokud jste o obnovení hesla nežádali, tento email ignorujte. Vaše heslo zůstane beze změny.</p>
            <p>Děkujeme &ndash; Tým Spotonaut</p>
          `;

          try {
            await resend.emails.send({
              from: RESEND_FROM,
              to: [email],
              subject,
              html,
            });
          } catch (err) {
            console.error("Resend error (password reset):", err);
            // Continue - we don't want to reveal if email was sent
          }
        }
      } catch (err) {
        console.error("Error sending password reset email:", err);
        // Continue - we don't want to reveal if email was sent
      }
    }

    // Always return success message (security: prevent email enumeration)
    return NextResponse.json({
      message:
        "Pokud účet existuje, byl odeslán email s instrukcemi pro obnovení hesla.",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "Nepodařilo se zpracovat požadavek" },
      { status: 500 },
    );
  }
}
