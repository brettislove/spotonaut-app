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
                } catch (e) {
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
          className="inline-flex items-center cursor-pointer gap-2 text-sm px-2 py-1 bg-slate-800/30 border border-slate-700 rounded-md text-slate-200 hover:bg-slate-700 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-slate-300"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d={
                isExpanded
                  ? "M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                  : "M5.23 12.79a.75.75 0 011.06-.02L10 9.06l3.71 3.71a.75.75 0 011.06-1.06l-4.24-4.24a.75.75 0 01-1.06 0L5.21 11.71a.75.75 0 01.02 1.08z"
              }
              clipRule="evenodd"
            />
          </svg>
          <span>Zobrazit zdroje</span>
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
