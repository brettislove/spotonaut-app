import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { getPromoQuota } from "@/lib/constants/chat";
import { TIER_SONDA, MAX_CREDITS_SONDA } from "@/lib/constants/tiers";
import { detectLocaleFromRequest } from "@/lib/i18n/detect-locale";
import { createTranslator } from "@/lib/i18n/translator";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const locale = detectLocaleFromRequest(request);
  const t = createTranslator(locale);

  try {
    const {
      email,
      password,
      name,
      promoCode,
      utmSource,
      utmMedium,
      utmCampaign,
    } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: t("api.auth.signup.emailPasswordRequired") },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: t("api.auth.signup.invalidEmailFormat") },
        { status: 400 },
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: t("api.auth.signup.passwordTooShort") },
        { status: 400 },
      );
    }
    // Validate promo code if provided
    let promoQuota: number | null = null;
    let normalizedPromoCode: string | null = null;

    if (promoCode && typeof promoCode === "string" && promoCode.trim()) {
      const trimmedCode = promoCode.trim();
      promoQuota = getPromoQuota(trimmedCode);

      if (promoQuota === null) {
        return NextResponse.json(
          { error: t("api.auth.signup.invalidPromoCode") },
          { status: 400 },
        );
      }

      normalizedPromoCode = trimmedCode.toUpperCase();
    }
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: t("api.auth.signup.userAlreadyExists") },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with promo code if valid
    // Initialize with Sonda (Free) tier and default credits
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        promoCode: normalizedPromoCode,
        tier: TIER_SONDA,
        maxCredits: MAX_CREDITS_SONDA,
        usedCredits: 0,
        creditsResetAt: null,
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
      },
    });

    // Create ChatUsage record with bonus quota if promo code was used
    if (promoQuota !== null && normalizedPromoCode) {
      await prisma.chatUsage.create({
        data: {
          userId: user.id,
          quota: promoQuota,
          quotaSource: `promo:${normalizedPromoCode}`,
          promptCount: 0,
        },
      });
    }

    // Send welcome / registration email via Resend (if configured)
    try {
      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      const RESEND_FROM =
        process.env.RESEND_FROM || "Tým Spotonaut <crew@spotonaut.com>";

      if (RESEND_API_KEY) {
        const resend = new Resend(RESEND_API_KEY);
        const subject = t("api.auth.signup.welcomeSubject");
        const html = `
          <p>${t("api.auth.signup.welcomeGreeting")} ${name ? `${name},` : ""}</p>
          <p>${t("api.auth.signup.welcomeBody")} <strong>${email}</strong>.</p>
          <p>${t("api.auth.signup.welcomeIfNotYou")}</p>
          <p>${t("api.auth.signup.welcomeTeam")}</p>
        `;

        try {
          await resend.emails.send({
            from: RESEND_FROM,
            to: [email],
            subject,
            html,
          });
        } catch (err) {
          console.error("Resend error (signup user):", err);
          // proceed without failing the signup
        }
      }
    } catch (err) {
      console.error("Error sending welcome email:", err);
    }

    return NextResponse.json({
      message: t("api.auth.signup.accountCreated"),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: t("api.auth.signup.accountCreateFailed") },
      { status: 500 },
    );
  }
}
