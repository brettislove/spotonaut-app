"use client";

import { usePathname } from "next/navigation";
import FooterSection from "@/components/footer";

export default function FooterGuard() {
  const pathname = usePathname();
  const isAppRoute = pathname === "/app" || pathname.startsWith("/app/");
  const isAnalysisRoute =
    pathname === "/analysis" || pathname.startsWith("/analysis/");

  if (isAppRoute) {
    return null;
  }

  if (isAnalysisRoute) {
    return (
      <div className="hidden md:block">
        <FooterSection />
      </div>
    );
  }

  return <FooterSection />;
}
