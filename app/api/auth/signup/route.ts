import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { getPromoQuota } from "@/lib/constants/chat";
import { TIER_SONDA, MAX_CREDITS_SONDA } from "@/lib/constants/tiers";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
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
        { error: "Email a heslo jsou povinné" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Neplatný formát emailu" },
        { status: 400 },
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Heslo musí mít alespoň 6 znaků" },
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
          { error: "Neplatný promo kód" },
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
        { error: "Uživatel s tímto emailem již existuje" },
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
        const subject = `Vítejte na Spotonaut — potvrzení registrace`;
        const html = `
          <p>Ahoj ${name ? `${name},` : ""}</p>
          <p>Děkujeme za registraci do aplikace Spotonaut. Váš účet byl úspěšně vytvořen s tímto emailem: <strong>${email}</strong>.</p>
          <p>Pokud jste registraci neprováděl(a), ihned nás, prosím, kontaktujte.</p>
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
          console.error("Resend error (signup user):", err);
          // proceed without failing the signup
        }
      }
    } catch (err) {
      console.error("Error sending welcome email:", err);
    }

    return NextResponse.json({
      message: "Účet byl úspěšně vytvořen",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Nepodařilo se vytvořit účet" },
      { status: 500 },
    );
  }
}
