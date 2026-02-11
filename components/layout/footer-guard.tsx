"use client";

import { usePathname } from "next/navigation";
import FooterSection from "@/components/footer";

export default function FooterGuard() {
  const pathname = usePathname();
  const isAppRoute = pathname === "/app" || pathname.startsWith("/app/");

  if (isAppRoute) {
    return null;
  }

  return <FooterSection />;
}
