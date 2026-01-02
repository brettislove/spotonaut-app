import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email a heslo jsou povinné" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Neplatný formát emailu" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Heslo musí mít alespoň 6 znaků" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Uživatel s tímto emailem již existuje" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
      },
    });

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
      { status: 500 }
    );
  }
}
