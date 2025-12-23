"use client";

import { useEffect, useState } from "react";

export type ProgressStep =
  | "geocoding"
  | "maps_grounding"
  | "pro_analysis"
  | "finalizing"
  | "complete";

interface AnalysisProgressProps {
  currentStep: ProgressStep;
  streamingText?: string;
  className?: string;
}

const stepLabels: Record<ProgressStep, string> = {
  geocoding: "Geokódování lokality",
  maps_grounding: "Získávání dat z map",
  pro_analysis: "Analýza obchodního potenciálu",
  finalizing: "Finalizace výsledků",
  complete: "Hotovo",
};

const stepDescriptions: Record<ProgressStep, string> = {
  geocoding: "Hledání souřadnic lokality...",
  maps_grounding: "Zjišťování konkurence a průchodnosti...",
  pro_analysis: "Vyhodnocování dat a generování analýzy...",
  finalizing: "Příprava finálních výsledků...",
  complete: "Analýza dokončena",
};

const stepOrder: ProgressStep[] = [
  "geocoding",
  "maps_grounding",
  "pro_analysis",
  "finalizing",
  "complete",
];

export default function AnalysisProgress({
  currentStep,
  streamingText,
  className = "",
}: AnalysisProgressProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const index = stepOrder.indexOf(currentStep);
    if (index >= 0) {
      setCurrentStepIndex(index);
    }
  }, [currentStep]);

  const getStepStatus = (
    step: ProgressStep
  ): "completed" | "active" | "pending" => {
    const stepIdx = stepOrder.indexOf(step);
    if (stepIdx < currentStepIndex) return "completed";
    if (stepIdx === currentStepIndex) return "active";
    return "pending";
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Local CSS for glare and blink animations */}
      <style jsx>{`
        @keyframes glare {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        @keyframes blink {
          0%,
          49% {
            opacity: 1;
          }
          50%,
          100% {
            opacity: 0;
          }
        }
        .glare-text {
          background: linear-gradient(90deg, #93c5fd, #a78bfa, #fda4af, #fff);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: glare 2s linear infinite;
        }
        .thinking-glare {
          background: linear-gradient(90deg, #a78bfa, #60a5fa, #a78bfa);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: glare 1.6s linear infinite;
        }
        .animate-blink {
          display: inline-block;
          width: 6px;
          height: 18px;
          vertical-align: middle;
          background: linear-gradient(180deg, #60a5fa, #a78bfa);
          animation: blink 1s steps(2, start) infinite;
        }
      `}</style>

      {/* Progress Steps */}
      <div className="space-y-3">
        {stepOrder.slice(0, -1).map((step, index) => {
          const status = getStepStatus(step);
          const isActive = status === "active";
          const isCompleted = status === "completed";

          return (
            <div
              key={step}
              className={`flex items-start gap-3 transition-all duration-300 ${
                isActive ? "scale-[1.02]" : ""
              }`}
            >
              {/* Status Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {isCompleted ? (
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                ) : isActive ? (
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-600"></div>
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? "glare-text"
                      : isCompleted
                      ? "text-green-400"
                      : "text-slate-400"
                  }`}
                >
                  {stepLabels[step]}
                </div>
                <div
                  className={`text-xs mt-0.5 transition-colors ${
                    isActive
                      ? step === "pro_analysis"
                        ? "thinking-glare"
                        : "text-slate-300"
                      : isCompleted
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                >
                  {stepDescriptions[step]}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Streaming Text Preview */}
      {streamingText && currentStep === "pro_analysis" && (
        <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg">
          <div className="text-xs text-slate-400 mb-2 font-medium">
            Náhled analýzy:
          </div>
          <div className="text-sm leading-relaxed">
            <span className="thinking-glare">{streamingText}</span>
            <span className="inline-block ml-1 animate-blink" />
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="pt-2">
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${((currentStepIndex + 1) / stepOrder.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Small disclaimer below the progress bar for extra clarity (mobile only) */}
      <div className="text-xs text-slate-400 mt-2 md:hidden">
        Výsledky jsou založeny na AI a slouží pouze pro informační účely —
        nemusí být přesné.
      </div>
    </div>
  );
}
