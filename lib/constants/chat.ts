// Rate limit for RPM (requests per minute) - 2.5-pro allows 150 RPM
export const MAX_REQUESTS_PER_MINUTE = 149;

// Character limit for chat messages
export const MAX_MESSAGE_LENGTH = 2000;

// Chat prompt quota constants
export const DEFAULT_QUOTA = 3;

// Valid promotional codes and their corresponding quotas
export const VALID_PROMO_CODES: Record<string, number> = {
  BONUS6: 6,
  LAUNCH10: 10,
};

/**
 * Get quota for a promotional code (case-insensitive)
 * @param code - Promo code to validate
 * @returns Quota amount if valid, null if invalid
 */
export function getPromoQuota(code: string): number | null {
  if (!code || typeof code !== "string") return null;
  const normalizedCode = code.trim().toUpperCase();
  return VALID_PROMO_CODES[normalizedCode] ?? null;
}
