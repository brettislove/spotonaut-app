import "next-auth";
import { UserTier } from "./lib/constants/tiers";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    tier?: number;
    maxCredits?: number | null;
    usedCredits?: number;
    creditsResetAt?: Date | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      tier: number;
      maxCredits: number | null;
      usedCredits: number;
      creditsResetAt: Date | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    tier?: number;
    maxCredits?: number | null;
    usedCredits?: number;
    creditsResetAt?: Date | null;
  }
}
