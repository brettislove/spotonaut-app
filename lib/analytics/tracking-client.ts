/**
 * Client-side tracking utilities for analytics
 * Checks for cookie consent before tracking
 */

/**
 * Check if user has consented to tracking
 */
function hasConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const consent = localStorage.getItem("cookieConsent");
    return consent === "accepted";
  } catch {
    return false;
  }
}

/**
 * Get or create a session ID for grouping events
 */
function getSessionId(): string {
  if (typeof window === "undefined") return "";

  try {
    let sessionId = sessionStorage.getItem("analytics_session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}`;
      sessionStorage.setItem("analytics_session_id", sessionId);
    }
    return sessionId;
  } catch {
    return "";
  }
}

/**
 * Get fingerprint from localStorage (created by lib/fingerprint.ts)
 */
function getFingerprint(): string {
  if (typeof window === "undefined") return "";

  try {
    return localStorage.getItem("spotonaut_fingerprint") || "";
  } catch {
    return "";
  }
}

/**
 * Extract UTM parameters from URL
 */
export function extractUTMParams(url: string): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
} {
  const params = new URLSearchParams(
    new URL(url, window.location.origin).search,
  );
  return {
    utmSource: params.get("utm_source") || undefined,
    utmMedium: params.get("utm_medium") || undefined,
    utmCampaign: params.get("utm_campaign") || undefined,
    utmTerm: params.get("utm_term") || undefined,
    utmContent: params.get("utm_content") || undefined,
  };
}

const UTM_STORAGE_KEY = "spotonaut_first_touch_utm";

/**
 * Get first-touch UTM data from localStorage.
 * Returns the stored UTM parameters or null if none exist.
 */
export function getFirstTouchUTM(): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
} | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(UTM_STORAGE_KEY);
    if (!stored) return null;
    const data = JSON.parse(stored);
    return {
      utmSource: data.utmSource || undefined,
      utmMedium: data.utmMedium || undefined,
      utmCampaign: data.utmCampaign || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Track a visit for UTM/campaign attribution.
 * Sends visit data to /api/tracking/visit.
 */
export async function trackVisit(path?: string): Promise<void> {
  if (!hasConsent()) return;

  const utmParams = extractUTMParams(window.location.href);

  try {
    const currentPath = path || window.location.pathname;
    const sessionId = getSessionId();
    const fingerprint = getFingerprint();

    await fetch("/api/tracking/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        visitedUrl: currentPath,
        referrer: document.referrer || null,
        fingerprint,
        ...utmParams,
      }),
    });
  } catch (error) {
    console.error("Failed to track visit:", error);
  }
}

/**
 * Track a page view
 */
export async function trackPageView(path?: string): Promise<void> {
  if (!hasConsent()) return;

  try {
    const currentPath = path || window.location.pathname;
    const utmParams = extractUTMParams(window.location.href);
    const fingerprint = getFingerprint();

    await fetch("/api/tracking/page-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: currentPath,
        referrer: document.referrer || null,
        fingerprint,
        ...utmParams,
      }),
    });
  } catch (error) {
    console.error("Failed to track page view:", error);
  }
}

/**
 * Track a user event
 */
export async function trackEvent(
  eventType: string,
  eventData?: Record<string, any>,
  page?: string,
): Promise<void> {
  if (!hasConsent()) return;

  try {
    const sessionId = getSessionId();
    const fingerprint = getFingerprint();
    const currentPage = page || window.location.pathname;

    await fetch("/api/tracking/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType,
        eventData: eventData || null,
        page: currentPage,
        sessionId,
        fingerprint,
      }),
    });
  } catch (error) {
    console.error("Failed to track event:", error);
  }
}
