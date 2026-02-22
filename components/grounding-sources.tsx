"use client";

import { useState } from "react";

export interface GroundingSource {
  title: string;
  uri: string;
}

interface GroundingSourcesProps {
  sources: GroundingSource[];
  className?: string;
}

// Helper to render source links and apply Google Maps attribution styling when appropriate
export const renderSourceLink = (source: { title: string; uri: string }) => {
  const isGoogleMaps =
    /maps\.google\.com/.test(source.uri) || source.title === "Google Maps";

  return (
    <a
      href={source.uri}
      target="_blank"
      rel="noopener noreferrer"
      translate={isGoogleMaps ? "no" : undefined}
      className={`inline-flex items-start gap-3 p-2 rounded-lg transition-colors text-left ${
        isGoogleMaps
          ? "GMP-attribution bg-slate-900/60 hover:bg-slate-900/80"
          : "border-slate-700 bg-slate-800/60 hover:bg-slate-700"
      }`}
    >
      <div className="flex flex-col">
        <span className="text-[10px] leading-none text-slate-400 font-medium">
          {isGoogleMaps
            ? "Google Maps"
            : (() => {
                try {
                  return new URL(source.uri).hostname;
                } catch {
                  return source.title || "Source";
                }
              })()}
        </span>
        <span className="text-sm text-slate-100 max-w-xs truncate">
          {source.title}
        </span>
      </div>
    </a>
  );
};

export function GroundingSources({
  sources,
  className = "",
}: GroundingSourcesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <div className="mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          className="inline-flex items-center cursor-pointer gap-2 text-sm px-2 py-1 underline underline-offset-2 text-slate-400 hover:text-white transition-colors"
        >
          <span>{isExpanded ? "Skrýt zdroje" : "Zdroje"}</span>
        </button>
      </div>

      {isExpanded && (
        <div className="mt-2 md:absolute md:bottom-full md:right-0 md:mb-2 md:bg-slate-800 md:rounded-lg shadow-lg md:w-full md:p-4 md:z-50">
          <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
            {sources.map((source, index) => (
              <div key={index}>{renderSourceLink(source)}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
