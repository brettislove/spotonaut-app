"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useAnalysis } from "@/lib/contexts/analysis-context";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function RequestMorePromptsModal({ isOpen, onClose }: Props) {
  const { data: session } = useSession();
  const { showToast } = useAnalysis();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleRequest = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/prompts/request", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit request");
      }
      showToast("Požadavek byl odeslán. Děkujeme!");
      onClose();
    } catch (err) {
      console.error(err);
      showToast("Chyba při odesílání požadavku. Zkuste to prosím znovu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg mb-2">
              Žádost o další dotazy
            </h3>
            <p className="text-slate-400 text-sm">
              Vyčerpali jste svůj limit dotazů. Můžete požádat tým Spotonaut o
              navýšení kvóty.
            </p>
            <p className="text-slate-400 text-sm mt-2">
              Uživatel:{" "}
              <strong className="text-slate-200">
                {session?.user?.email || "přihlaste se"}
              </strong>
            </p>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-all border border-slate-700"
          >
            Zrušit
          </button>
          <button
            onClick={handleRequest}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-lg transition-all shadow-lg disabled:opacity-50"
          >
            {isSubmitting ? "Odesílám…" : "Požádat o více"}
          </button>
        </div>
      </div>
    </div>
  );
}
