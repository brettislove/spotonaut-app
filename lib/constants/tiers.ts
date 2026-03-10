/**
 * User tier constants and helper functions
 * Tiers: 0 = Sonda (Free), 1 = Raketa (Paid), 2 = Modul (Enterprise)
 */

// Tier enum values
export const TIER_SONDA = 0; // Free tier
export const TIER_RAKETA = 1; // Paid tier
export const TIER_MODUL = 2; // Enterprise tier

// Credit costs per operation
export const ANALYSIS_CREDIT_COST = 10;
export const CHAT_MESSAGE_CREDIT_COST = 1;

// TypeScript type for tier values
export type UserTier =
  | typeof TIER_SONDA
  | typeof TIER_RAKETA
  | typeof TIER_MODUL;

// Credit limits per tier
export const MAX_CREDITS_SONDA = 25; // One-time 25 credits
export const MAX_CREDITS_RAKETA = 200; // 200 credits/month (renewable)
export const MAX_CREDITS_MODUL = 2200; // 2200 credits/month (renewable)

// Tier display names (Czech - ready for i18n)
export const TIER_NAMES: Record<UserTier, string> = {
  [TIER_SONDA]: "🌑 Sonda",
  [TIER_RAKETA]: "🚀 Raketa",
  [TIER_MODUL]: "🛰️ Modul",
};

// Tier display names without emojis
export const TIER_NAMES_PLAIN: Record<UserTier, string> = {
  [TIER_SONDA]: "Sonda",
  [TIER_RAKETA]: "Raketa",
  [TIER_MODUL]: "Modul",
};

// Tier descriptions
export const TIER_DESCRIPTIONS: Record<UserTier, string> = {
  [TIER_SONDA]: "Bezplatný tarif s 25 kredity na vyzkoušení",
  [TIER_RAKETA]: "Prémiový tarif s 200 kredity měsíčně",
  [TIER_MODUL]: "Profesionální tarif s 2200 kredity měsíčně",
};

// Tier credit renewal periods (in days, null = no renewal)
export const TIER_RENEWAL_DAYS: Record<UserTier, number | null> = {
  [TIER_SONDA]: null, // One-time credits, no renewal
  [TIER_RAKETA]: 30, // Monthly renewal
  [TIER_MODUL]: 30, // Monthly renewal
};

/**
 * Get display name for a tier
 * @param tier - User tier number (0, 1, or 2)
 * @param withEmoji - Whether to include emoji in the name (default: true)
 * @returns Tier display name
 */
export function getTierName(tier: number, withEmoji: boolean = true): string {
  console.log("getTierName called with tier:", tier, "withEmoji:", withEmoji);
  const names = withEmoji ? TIER_NAMES : TIER_NAMES_PLAIN;
  return names[tier as UserTier] || "Unknown";
}

/**
 * Get description for a tier
 * @param tier - User tier number (0, 1, or 2)
 * @returns Tier description
 */
export function getTierDescription(tier: number): string {
  return TIER_DESCRIPTIONS[tier as UserTier] || "Unknown tier";
}

/**
 * Get maximum credits for a tier
 * @param tier - User tier number (0, 1, or 2)
 * @returns Maximum credits or null for unlimited
 */
export function getTierMaxCredits(tier: number): number | null {
  switch (tier) {
    case TIER_SONDA:
      return MAX_CREDITS_SONDA;
    case TIER_RAKETA:
      return MAX_CREDITS_RAKETA;
    case TIER_MODUL:
      return MAX_CREDITS_MODUL;
    default:
      return MAX_CREDITS_SONDA; // Default to free tier
  }
}

/**
 * Check if credits value represents unlimited
 * @param maxCredits - Maximum credits value (null = unlimited)
 * @returns True if unlimited
 */
export function isUnlimited(maxCredits: number | null): boolean {
  return maxCredits === null;
}

/**
 * Get remaining credits for a user
 * @param maxCredits - Maximum credits (null = unlimited)
 * @param usedCredits - Credits already used
 * @returns Remaining credits or null for unlimited
 */
export function getRemainingCredits(
  maxCredits: number | null,
  usedCredits: number,
): number | null {
  if (isUnlimited(maxCredits)) {
    return null; // Unlimited
  }
  return Math.max(0, maxCredits! - usedCredits);
}

/**
 * Format credits for display (showing ∞ for unlimited)
 * @param credits - Credits value (null = unlimited)
 * @returns Formatted string
 */
export function formatCredits(credits: number | null): string {
  return isUnlimited(credits) ? "∞" : credits!.toString();
}

/**
 * Check if user has credits remaining
 * @param maxCredits - Maximum credits (null = unlimited)
 * @param usedCredits - Credits already used
 * @returns True if user has credits available
 */
export function hasCreditsRemaining(
  maxCredits: number | null,
  usedCredits: number,
): boolean {
  if (isUnlimited(maxCredits)) {
    return true;
  }
  return usedCredits < maxCredits!;
}

/**
 * Check if a tier requires credit renewal
 * @param tier - User tier number (0, 1, or 2)
 * @returns True if tier has renewable credits
 */
export function isRenewableTier(tier: number): boolean {
  return TIER_RENEWAL_DAYS[tier as UserTier] !== null;
}

/**
 * Get renewal period for a tier in days
 * @param tier - User tier number (0, 1, or 2)
 * @returns Number of days for renewal, or null if no renewal
 */
export function getTierRenewalDays(tier: number): number | null {
  return TIER_RENEWAL_DAYS[tier as UserTier] || null;
}

/**
 * Calculate the next credit reset date for a user
 * @param tier - User tier number (0, 1, or 2)
 * @param currentResetDate - Current reset date (optional)
 * @returns Next reset date or null if tier doesn't renew
 */
export function calculateNextResetDate(
  tier: number,
  currentResetDate?: Date | null,
): Date | null {
  const renewalDays = getTierRenewalDays(tier);

  if (renewalDays === null) {
    return null; // No renewal for this tier
  }

  const baseDate = currentResetDate || new Date();
  const nextReset = new Date(baseDate);
  nextReset.setDate(nextReset.getDate() + renewalDays);

  return nextReset;
}

/**
 * Check if credits need to be reset for a user
 * @param creditsResetAt - The scheduled reset date
 * @returns True if reset date has passed
 */
export function needsCreditsReset(creditsResetAt: Date | null): boolean {
  if (!creditsResetAt) {
    return false;
  }
  return new Date() >= creditsResetAt;
}
