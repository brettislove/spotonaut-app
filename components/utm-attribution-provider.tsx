"use client";

import { useUtmAttribution } from "@/lib/hooks/useUtmAttribution";

/**
 * Client component that runs the UTM attribution hook.
 * After a user signs in (credentials or Google OAuth), this sends
 * stored first-touch UTM data to the server to associate it with the user.
 */
export default function UtmAttributionProvider() {
  useUtmAttribution();
  return null;
}
