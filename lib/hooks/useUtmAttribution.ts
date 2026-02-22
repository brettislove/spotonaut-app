"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

const UTM_STORAGE_KEY = "spotonaut_first_touch_utm";
const UTM_SENT_KEY = "spotonaut_utm_sent";

/**
 * Hook that sends first-touch UTM data to the server after a user signs in.
 *
 * This handles the Google OAuth case where registration happens automatically
 * via PrismaAdapter and we don't control the signup request body.
 *
 * Also serves as a fallback for credentials users whose UTM data
 * might not have been sent during registration.
 *
 * Runs once per session after the user is authenticated.
 */
export function useUtmAttribution() {
  const { data: session, status } = useSession();
  const hasSent = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;
    if (hasSent.current) return;

    // Check if we already sent UTM for this session
    try {
      const alreadySent = sessionStorage.getItem(UTM_SENT_KEY);
      if (alreadySent) return;
    } catch {
      // sessionStorage unavailable
    }

    const sendUtm = async () => {
      try {
        const stored = localStorage.getItem(UTM_STORAGE_KEY);
        if (!stored) return;

        const utmData = JSON.parse(stored);

        if (!utmData.utmSource && !utmData.utmMedium && !utmData.utmCampaign) {
          return;
        }

        const response = await fetch("/api/user/set-utm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            utmSource: utmData.utmSource || undefined,
            utmMedium: utmData.utmMedium || undefined,
            utmCampaign: utmData.utmCampaign || undefined,
          }),
        });

        if (response.ok) {
          const result = await response.json();

          // Mark as sent so we don't repeat this session
          try {
            sessionStorage.setItem(UTM_SENT_KEY, "true");
          } catch {
            // sessionStorage unavailable
          }

          // If the server actually updated the user, we can clear localStorage
          // (but keep it if not updated, in case of race conditions)
          if (result.updated) {
            localStorage.removeItem(UTM_STORAGE_KEY);
          }
        }
      } catch {
        // Silently fail — UTM attribution is best-effort
      }
    };

    hasSent.current = true;
    sendUtm();
  }, [status, session?.user?.id]);
}
