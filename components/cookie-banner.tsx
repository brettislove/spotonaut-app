"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Delay check to avoid hydration mismatch
    requestAnimationFrame(() => {
      const cookieConsent = localStorage.getItem("cookieConsent");
      if (!cookieConsent) {
        setShowBanner(true);
      }
    });
  }, []);

  const acceptCookies = () => {
    try {
      localStorage.setItem("cookieConsent", "accepted");
    } catch (e) {
      console.warn("Failed to persist cookie consent", e);
    }
    setShowBanner(false);
  };

  const rejectCookies = () => {
    try {
      localStorage.setItem("cookieConsent", "declined");
    } catch (e) {
      console.warn("Failed to persist cookie consent", e);
    }
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-slate-900/95 backdrop-blur-lg border border-slate-700 rounded-2xl p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <svg
                  className="w-6 h-6 text-blue-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-white">
                  Používáme cookies
                </h3>
              </div>
              <p className="text-sm text-slate-300 mb-3">
                Používáme cookies k zajištění základní funkčnosti webu a
                zlepšení vaší uživatelské zkušenosti. Sbíráme anonymní
                analytická data (zobrazení stránek, používání funkcí,
                země/region) pro zlepšení našich služeb. IP adresy jsou
                hashovány denně, data uchováváme 90 dní. Neukládáme osobní
                údaje.
              </p>
              <Link
                href="/cookies"
                className="text-sm text-blue-400 hover:text-blue-300 underline transition-colors"
              >
                Zobrazit podrobnosti o cookies →
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={rejectCookies}
                className="cursor-pointer px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-all border border-slate-700"
              >
                Pouze nezbytné
              </button>
              <button
                onClick={acceptCookies}
                className="cursor-pointer px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all"
              >
                Přijmout vše
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
