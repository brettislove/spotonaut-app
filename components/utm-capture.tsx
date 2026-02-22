"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const UTM_STORAGE_KEY = "spotonaut_first_touch_utm";

/**
 * Captures UTM parameters from the URL on first visit and stores them
 * in localStorage for later attribution (registration).
 *
 * Uses "first-touch" principle: if UTM data already exists in localStorage,
 * it is NOT overwritten — we want to know what originally brought the user.
 *
 * This runs regardless of cookie consent because it's functional data
 * used for registration attribution, not analytics tracking.
 */
export default function UTMCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const utmSource = searchParams.get("utm_source");
    const utmMedium = searchParams.get("utm_medium");
    const utmCampaign = searchParams.get("utm_campaign");

    // Only store if at least one UTM param is present in the URL
    if (!utmSource && !utmMedium && !utmCampaign) return;

    // First-touch: don't overwrite existing UTM data
    try {
      const existing = localStorage.getItem(UTM_STORAGE_KEY);
      if (existing) return;

      const utmData = {
        utmSource: utmSource || undefined,
        utmMedium: utmMedium || undefined,
        utmCampaign: utmCampaign || undefined,
        capturedAt: new Date().toISOString(),
        landingUrl: window.location.pathname,
      };

      localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmData));
    } catch {
      // localStorage might be unavailable (private browsing, etc.)
    }
  }, [searchParams]);

  return null;
}
