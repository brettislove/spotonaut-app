"use client";

export interface GroundingSource {
  title: string;
  uri: string;
}

interface GroundingSourcesProps {
  sources: GroundingSource[];
  className?: string;
}

export function GroundingSources({
  sources,
  className = "",
}: GroundingSourcesProps) {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className={`mt-4 ${className}`}>
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
        <svg
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span>Zdroje z Google Maps</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {sources.map((source, index) => (
          <a
            key={index}
            href={source.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-md transition-colors text-slate-300 hover:text-white"
          >
            <span className="max-w-[200px] truncate">{source.title}</span>
            <svg
              className="h-3 w-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}
