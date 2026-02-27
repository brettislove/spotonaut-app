import crypto from "crypto";

function getIpHashSecret(): string {
  const secret = process.env.IP_HASH_SECRET;
  if (!secret) {
    throw new Error("Missing required environment variable: IP_HASH_SECRET");
  }
  return secret;
}

/**
 * Gets a daily rotating salt for IP hashing
 * This ensures same IP gets same hash on same day, but different hash on different days
 */
function getDailySalt(): string {
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const secret = getIpHashSecret();
  return crypto
    .createHash("sha256")
    .update(`${secret}-${date}`)
    .digest("hex")
    .slice(0, 16);
}

/**
 * Anonymizes an IP address using SHA-256 hash with daily rotating salt
 * GDPR compliant - irreversible transformation
 * @param ip - The IP address to anonymize
 * @returns Hashed IP address (16 characters)
 */
export function anonymizeIP(ip: string): string {
  if (!ip || ip === "unknown") return "unknown";

  const salt = getDailySalt();
  const hash = crypto
    .createHash("sha256")
    .update(`${ip}-${salt}`)
    .digest("hex")
    .slice(0, 16); // 16 chars sufficient for uniqueness

  return hash;
}

/**
 * Extract country and region from IP address using free geolocation API
 * Falls back to "Unknown" if geolocation fails or rate limit exceeded
 * @param ip - The IP address to geolocate
 * @returns Object with country and region
 */
export async function getCountryFromIP(
  ip: string,
): Promise<{ country: string; region: string | null }> {
  if (!ip || ip === "unknown") {
    return { country: "Unknown", region: null };
  }

  try {
    // Using ipapi.co free tier (1000 requests/day)
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      method: "GET",
      headers: {
        "User-Agent": "Spotonaut-Analytics/1.0",
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });

    if (!response.ok) {
      console.warn(`IP geolocation failed for ${ip}: ${response.status}`);
      return { country: "Unknown", region: null };
    }

    const data = await response.json();

    // Check if we hit rate limit
    if (data.error) {
      console.warn(`IP geolocation error for ${ip}: ${data.reason}`);
      return { country: "Unknown", region: null };
    }

    return {
      country: data.country_name || "Unknown",
      region: data.region || null,
    };
  } catch (error) {
    // Network error, timeout, or parsing error
    console.error("IP geolocation failed:", error);
    return { country: "Unknown", region: null };
  }
}

/**
 * Extracts IP address from Next.js request headers
 * Handles x-forwarded-for (proxies) and x-real-ip headers
 * @param headers - Next.js request headers
 * @returns IP address or 'unknown'
 */
export function extractIPFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : headers.get("x-real-ip") || "unknown";
  return ip;
}
