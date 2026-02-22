/**
 * Data migration script to initialize tier and credits for existing users
 *
 * This script:
 * 1. Sets all existing users to tier 0 (Sonda/Free) by default
 * 2. Sets maxCredits to 30 for free tier users
 * 3. Sets usedCredits to 0
 * 4. For users with unlimited ChatUsage.quota (null), upgrades them to tier 2 (Modul/Enterprise)
 *
 * Run with: npx tsx scripts/migrate-user-tiers.ts
 * Or: node --loader ts-node/esm scripts/migrate-user-tiers.ts
 */

import { PrismaClient } from "@prisma/client";
import {
  TIER_SONDA,
  TIER_MODUL,
  MAX_CREDITS_SONDA,
  MAX_CREDITS_MODUL,
} from "../lib/constants/tiers";

const prisma = new PrismaClient();

async function migrateUserTiers() {
  console.log("Starting user tier and credits migration...\n");

  try {
    // Get all users
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            analyses: true,
          },
        },
      },
    });

    console.log(`Found ${users.length} users to migrate\n`);

    // Get all chat usage records
    const chatUsages = await prisma.chatUsage.findMany();
    const chatUsageMap = new Map(chatUsages.map((cu) => [cu.userId, cu]));

    let updatedCount = 0;
    let upgradedToModulCount = 0;

    for (const user of users) {
      const chatUsage = chatUsageMap.get(user.id);

      // Determine tier based on existing ChatUsage quota
      let tier = TIER_SONDA;
      let maxCredits: number | null = MAX_CREDITS_SONDA;

      // If user has unlimited chat quota, upgrade to Modul (Enterprise) tier
      if (chatUsage && chatUsage.quota === null) {
        tier = TIER_MODUL;
        maxCredits = MAX_CREDITS_MODUL; // null = unlimited
        upgradedToModulCount++;
        console.log(
          `  Upgrading user ${user.email} to Modul tier (had unlimited chat quota)`,
        );
      }

      // Update user with tier and credits
      await prisma.user.update({
        where: { id: user.id },
        data: {
          tier,
          maxCredits,
          usedCredits: 0, // Start fresh
          creditsResetAt: null, // Will be set when tier becomes renewable
        },
      });

      updatedCount++;
    }

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`   ${updatedCount} users updated`);
    console.log(`   ${upgradedToModulCount} users upgraded to Modul tier`);
    console.log(
      `   ${updatedCount - upgradedToModulCount} users set to Sonda tier\n`,
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateUserTiers()
  .then(() => {
    console.log("Migration script finished.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration script failed:", error);
    process.exit(1);
  });
