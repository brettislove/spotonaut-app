import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { JWT } from "next-auth/jwt";
import type { User, Account } from "next-auth";
import {
  MAX_CREDITS_SONDA,
  TIER_SONDA,
  getTierMaxCredits,
} from "@/lib/constants/tiers";

const prisma = new PrismaClient();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email a heslo jsou povinné");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            password: true,
            tier: true,
            maxCredits: true,
            usedCredits: true,
            creditsResetAt: true,
          },
        });

        if (!user || !user.password) {
          throw new Error("Neplatné přihlašovací údaje");
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!passwordMatch) {
          throw new Error("Neplatné přihlašovací údaje");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          tier: user.tier,
          maxCredits: user.maxCredits,
          usedCredits: user.usedCredits,
          creditsResetAt: user.creditsResetAt,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user?.id) {
        return true;
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          tier: true,
          maxCredits: true,
          usedCredits: true,
          creditsResetAt: true,
        },
      });

      if (!dbUser) {
        return true;
      }

      if (dbUser.maxCredits === null) {
        const normalizedTier = dbUser.tier ?? TIER_SONDA;
        const normalizedMaxCredits = getTierMaxCredits(normalizedTier);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            tier: normalizedTier,
            maxCredits:
              normalizedMaxCredits ??
              (normalizedTier === TIER_SONDA ? MAX_CREDITS_SONDA : null),
            usedCredits: dbUser.usedCredits ?? 0,
            creditsResetAt: dbUser.creditsResetAt ?? null,
          },
        });
      }

      return true;
    },
    async jwt({
      token,
      user,
      trigger,
      account,
    }: {
      token: JWT;
      user: User;
      trigger?: "signIn" | "update" | "signUp";
      account?: Account | null;
    }) {
      // On initial sign-in, set user ID and tier data
      if (user) {
        token.id = user.id;
        token.tier = user.tier;
        token.maxCredits = user.maxCredits;
        token.usedCredits = user.usedCredits;
        token.creditsResetAt = user.creditsResetAt;
      }

      // For OAuth providers (Google), fetch tier data from database since adapter doesn't include it
      // Also fetch for existing tokens that don't have tier data
      if (
        token.id &&
        (account?.provider === "google" || token.tier === undefined)
      ) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            tier: true,
            maxCredits: true,
            usedCredits: true,
            creditsResetAt: true,
          },
        });

        if (dbUser) {
          token.tier = dbUser.tier;
          token.maxCredits = dbUser.maxCredits;
          token.usedCredits = dbUser.usedCredits;
          token.creditsResetAt = dbUser.creditsResetAt;
        }
      }

      // Refresh user data from database on update trigger
      if (trigger === "update" && token.id) {
        const updatedUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            tier: true,
            maxCredits: true,
            usedCredits: true,
            creditsResetAt: true,
          },
        });

        if (updatedUser) {
          token.tier = updatedUser.tier;
          token.maxCredits = updatedUser.maxCredits;
          token.usedCredits = updatedUser.usedCredits;
          token.creditsResetAt = updatedUser.creditsResetAt;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.tier = (token.tier as number) ?? 0;
        session.user.maxCredits = (token.maxCredits as number | null) ?? null;
        session.user.usedCredits = (token.usedCredits as number) ?? 0;
        session.user.creditsResetAt = token.creditsResetAt
          ? new Date(token.creditsResetAt)
          : null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export const { GET, POST } = handlers;
