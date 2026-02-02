"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAnalysis } from "@/lib/contexts/analysis-context";
import AnalysisResultsDesktop from "@/components/analysis-results-desktop";
import AnalysisResultsMobileNew from "@/components/analysis-results-mobile-new";

export default function AnalysisPage() {
  const router = useRouter();
  const { messages, analysisData, hasCompletedAnalysis } = useAnalysis();

  const [isMobile, setIsMobile] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [hasAttemptedRestore, setHasAttemptedRestore] = useState(false);

  // Redirect to home if no analysis data
  useEffect(() => {
    // Wait a bit for restoration to complete before checking
    const timer = setTimeout(() => {
      setHasAttemptedRestore(true);
      if (!hasCompletedAnalysis || !analysisData) {
        router.replace("/");
      }
    }, 500); // Give 500ms for restoration

    return () => clearTimeout(timer);
  }, [hasCompletedAnalysis, analysisData, router]);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Don't render anything while redirecting or waiting for restoration
  if (!hasAttemptedRestore || !hasCompletedAnalysis || !analysisData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Načítání...</div>
      </div>
    );
  }

  // Desktop/Tablet View
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block"
      >
        <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
        <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
        <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
      </div>
      <section>
        <div className="relative pt-12 md:pt-20">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"
          />
          {/* Persistent AI disclaimer */}
          <div className="hidden lg:block fixed bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-slate-300 px-3 py-1 z-50 max-w-[90%] text-center pointer-events-none">
            Výsledky jsou založeny na AI a slouží pouze pro informační účely —
            nemusí být přesné ani úplné.
          </div>

          {isMobile ? (
            <AnalysisResultsMobileNew analysisData={analysisData} />
          ) : (
            <AnalysisResultsDesktop analysisData={analysisData} />
          )}
        </div>
      </section>
    </>
  );
}
