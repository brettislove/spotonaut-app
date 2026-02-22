"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAnalysis } from "@/lib/contexts/analysis-context";
import AnalysisResultsDesktop from "@/components/analysis-results/analysis-results-desktop";
import AnalysisResultsMobile from "@/components/analysis-results/analysis-results-mobile";

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

  return (
    <>
      <section className="flex flex-1 flex-col sm:pt-24">
        {isMobile ? (
          <AnalysisResultsMobile analysisData={analysisData} />
        ) : (
          <AnalysisResultsDesktop analysisData={analysisData} />
        )}
      </section>
    </>
  );
}
