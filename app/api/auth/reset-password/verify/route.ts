import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    // Validate input
    if (!token || !password) {
      return NextResponse.json(
        { error: "Token a heslo jsou povinné" },
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

    // Find the token in database
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Neplatný nebo expirovaný token" },
        { status: 400 },
      );
    }

    // Check if token is expired
    if (new Date() > resetToken.expires) {
      // Delete expired token
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });

      return NextResponse.json(
        { error: "Token vypršel. Požádejte o nový odkaz pro obnovení hesla." },
        { status: 400 },
      );
    }

    // Clean up all expired tokens globally (maintenance)
    await prisma.passwordResetToken.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    });

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // Delete the used token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    // Return user email for auto-login
    return NextResponse.json({
      message: "Heslo bylo úspěšně obnoveno",
      email: resetToken.user.email,
    });
  } catch (error) {
    console.error("Password reset verification error:", error);
    return NextResponse.json(
      { error: "Nepodařilo se obnovit heslo" },
      { status: 500 },
    );
  }
}
