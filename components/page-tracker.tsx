"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView, trackVisit } from "@/lib/analytics/tracking-client";

export default function PageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track page view when pathname changes
    trackPageView(pathname);
    // Track visit for UTM/campaign attribution
    trackVisit(pathname);
  }, [pathname, searchParams]);

  return null;
}
