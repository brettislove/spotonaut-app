import { Prisma, PrismaClient } from "@prisma/client";
import {
  calculateNextResetDate,
  getRemainingCredits,
  getTierMaxCredits,
  isRenewableTier,
  needsCreditsReset,
} from "@/lib/constants/tiers";

export interface CreditStatus {
  maxCredits: number | null;
  usedCredits: number;
  remainingCredits: number | null;
}

export interface ConsumeCreditsResult extends CreditStatus {
  allowed: boolean;
}

async function ensureCreditsRenewedIfDue(
  tx: Prisma.TransactionClient,
  userId: string,
): Promise<void> {
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: {
      tier: true,
      maxCredits: true,
      usedCredits: true,
      creditsResetAt: true,
    },
  });

  if (!user || !isRenewableTier(user.tier)) {
    return;
  }

  if (!needsCreditsReset(user.creditsResetAt)) {
    return;
  }

  const tierMaxCredits = getTierMaxCredits(user.tier);
  const nextResetAt = calculateNextResetDate(user.tier, new Date());

  await tx.user.update({
    where: { id: userId },
    data: {
      maxCredits: tierMaxCredits,
      usedCredits: 0,
      creditsResetAt: nextResetAt,
    },
  });
}

export async function getUserCreditStatus(
  prisma: PrismaClient,
  userId: string,
): Promise<CreditStatus | null> {
  return prisma.$transaction(async (tx) => {
    await ensureCreditsRenewedIfDue(tx, userId);

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: {
        maxCredits: true,
        usedCredits: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      maxCredits: user.maxCredits,
      usedCredits: user.usedCredits,
      remainingCredits: getRemainingCredits(user.maxCredits, user.usedCredits),
    };
  });
}

export async function consumeUserCredits(
  prisma: PrismaClient,
  userId: string,
  cost: number,
): Promise<ConsumeCreditsResult | null> {
  return prisma.$transaction(async (tx) => {
    await ensureCreditsRenewedIfDue(tx, userId);

    const updated = await tx.$queryRaw<
      Array<{ maxCredits: number | null; usedCredits: number }>
    >(Prisma.sql`
      UPDATE users
      SET "usedCredits" = "usedCredits" + ${cost}, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = ${userId}
      AND ("maxCredits" IS NULL OR ("usedCredits" + ${cost}) <= "maxCredits")
      RETURNING "maxCredits", "usedCredits"
    `);

    if (updated.length > 0) {
      const user = updated[0];
      return {
        allowed: true,
        maxCredits: user.maxCredits,
        usedCredits: user.usedCredits,
        remainingCredits: getRemainingCredits(
          user.maxCredits,
          user.usedCredits,
        ),
      };
    }

    const status = await tx.user.findUnique({
      where: { id: userId },
      select: {
        maxCredits: true,
        usedCredits: true,
      },
    });

    if (!status) {
      return null;
    }

    return {
      allowed: false,
      maxCredits: status.maxCredits,
      usedCredits: status.usedCredits,
      remainingCredits: getRemainingCredits(
        status.maxCredits,
        status.usedCredits,
      ),
    };
  });
}
