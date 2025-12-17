import { PrismaClient } from "@prisma/client";
import type { GenerateContentResponse } from "@google/genai";

// Memory cache for archive check - prevents redundant daily queries
let lastArchiveCheckDate: string | null = null;

// TypeScript interfaces for grounding data
export interface GroundingSource {
  placeId: string;
  title: string;
  uri: string;
}

export interface QuotaStatus {
  allowed: boolean;
  remaining: number;
  quotaExceeded: boolean;
  usagePercentage: number;
  currentCount: number;
  dailyLimit: number;
}

export interface UsageStats {
  date: string;
  count: number;
  dailyLimit: number;
  remaining: number;
  usagePercentage: number;
  quotaExceeded: boolean;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Check global Maps grounding quota
 * Returns quota status and logs warning at 80% usage
 */
export async function checkGlobalMapsQuota(
  prisma: PrismaClient
): Promise<QuotaStatus> {
  const today = getTodayDateString();

  // Get or create today's usage record
  let usage = await prisma.googleMapsUsage.findUnique({
    where: { date: today },
  });

  if (!usage) {
    // Create new record for today with default limit
    usage = await prisma.googleMapsUsage.create({
      data: {
        date: today,
        count: 0,
        dailyLimit: 500,
        archived: false,
      },
    });
  }

  const usagePercentage = (usage.count / usage.dailyLimit) * 100;
  const remaining = Math.max(0, usage.dailyLimit - usage.count);
  const quotaExceeded = usage.count >= usage.dailyLimit;

  // Log warning at 80% usage
  if (usagePercentage >= 80 && usagePercentage < 100) {
    console.warn(
      `[Google Maps Quota] Warning: ${usagePercentage.toFixed(1)}% used (${
        usage.count
      }/${usage.dailyLimit})`
    );
  }

  return {
    allowed: !quotaExceeded,
    remaining,
    quotaExceeded,
    usagePercentage,
    currentCount: usage.count,
    dailyLimit: usage.dailyLimit,
  };
}

/**
 * Increment global Maps usage counter
 */
export async function incrementGlobalMapsUsage(
  prisma: PrismaClient
): Promise<void> {
  const today = getTodayDateString();

  await prisma.googleMapsUsage.upsert({
    where: { date: today },
    update: {
      count: { increment: 1 },
    },
    create: {
      date: today,
      count: 1,
      dailyLimit: 500,
      archived: false,
    },
  });
}

/**
 * Archive old records if not already done today
 * Uses memory cache to prevent redundant queries
 */
export async function archiveOldRecordsIfNeeded(
  prisma: PrismaClient
): Promise<void> {
  const today = getTodayDateString();

  // Skip if already checked today
  if (lastArchiveCheckDate === today) {
    return;
  }

  // Calculate date 365 days ago
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const archiveBeforeDate = oneYearAgo.toISOString().split("T")[0];

  // Archive old records
  await prisma.googleMapsUsage.updateMany({
    where: {
      date: { lt: archiveBeforeDate },
      archived: false,
    },
    data: {
      archived: true,
    },
  });

  // Update cache
  lastArchiveCheckDate = today;
}

/**
 * Check if response contains grounding metadata from Google Maps
 */
export function hasGroundingMetadata(result: GenerateContentResponse): boolean {
  try {
    const groundingMetadata = result.candidates?.[0]?.groundingMetadata;
    return !!(
      groundingMetadata?.groundingChunks &&
      groundingMetadata.groundingChunks.length > 0
    );
  } catch {
    return false;
  }
}

/**
 * Extract grounding sources from response
 */
export function extractGroundingSources(
  result: GenerateContentResponse
): GroundingSource[] {
  try {
    const groundingMetadata = result.candidates?.[0]?.groundingMetadata;
    if (!groundingMetadata?.groundingChunks) {
      return [];
    }

    return groundingMetadata.groundingChunks
      .filter((chunk) => chunk.maps?.uri || chunk.retrievedContext?.uri)
      .map((chunk) => {
        // Handle different chunk types
        if (chunk.maps) {
          return {
            placeId: "",
            title: chunk.maps.title || "Google Maps",
            uri: chunk.maps.uri || "",
          };
        }
        return {
          placeId: "",
          title: chunk.retrievedContext?.title || "Google Maps",
          uri: chunk.retrievedContext?.uri || "",
        };
      });
  } catch {
    return [];
  }
}

/**
 * Get today's usage stats for admin endpoint
 */
export async function getTodaysUsageStats(
  prisma: PrismaClient
): Promise<UsageStats> {
  const today = getTodayDateString();

  const usage = await prisma.googleMapsUsage.findUnique({
    where: { date: today },
  });

  if (!usage) {
    return {
      date: today,
      count: 0,
      dailyLimit: 500,
      remaining: 500,
      usagePercentage: 0,
      quotaExceeded: false,
    };
  }

  const usagePercentage = (usage.count / usage.dailyLimit) * 100;
  const remaining = Math.max(0, usage.dailyLimit - usage.count);

  return {
    date: usage.date,
    count: usage.count,
    dailyLimit: usage.dailyLimit,
    remaining,
    usagePercentage,
    quotaExceeded: usage.count >= usage.dailyLimit,
  };
}

/**
 * Get count of archived records for admin reporting
 */
export async function getArchivedRecordsCount(
  prisma: PrismaClient
): Promise<number> {
  return prisma.googleMapsUsage.count({
    where: { archived: true },
  });
}
