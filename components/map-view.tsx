"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import type { LatLngExpression } from "leaflet";
import { GroundingSources } from "./grounding-sources";

interface AnalysisData {
  location: string;
  locationName: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  metrics?: {
    localityScore: number;
    footfallScore: number;
    recommendedHours: string;
  };
  sources?: Array<{ title: string; uri: string }>;
}

interface MapViewProps {
  data: AnalysisData;
}

interface MapContentProps {
  position: LatLngExpression;
  location: string;
}

// Import Map component dynamically to avoid SSR issues
const MapContent = dynamic<MapContentProps>(
  () => import("./map-content").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-slate-400">Načítání mapy...</div>
      </div>
    ),
  }
);

export default function MapView({ data }: MapViewProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Use timeout to avoid SSR hydration issues
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Default to Prague center if no coordinates
  const position: LatLngExpression = useMemo(() => {
    return data.coordinates
      ? [data.coordinates.lat, data.coordinates.lng]
      : [49.1951, 16.6068];
  }, [data.coordinates]);

  if (!isMounted) {
    return (
      <div className="h-full w-full bg-slate-900/50 backdrop-blur-sm border border-slate-800 flex items-center justify-center">
        <div className="text-slate-400">Načítání mapy...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-slate-900/50 backdrop-blur-sm border border-slate-800 overflow-hidden flex flex-col sm:rounded-t-2xl">
      {/* Map */}
      <div className="flex-1 relative">
        <MapContent
          position={position}
          location={data.locationName || data.location}
        />
      </div>

      {/* Data Overlay - Desktop Only */}
      {data.metrics && (
        <div className="hidden lg:block p-3 lg:p-4 bg-slate-900/90 backdrop-blur-sm border-t border-slate-700">
          {/* Location Name */}
          <div className="mb-3 lg:mb-4">
            <h2 className="text-white font-semibold text-sm lg:text-lg mb-1 flex items-center gap-2">
              <svg
                className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400"
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
              {data.locationName || data.location}
            </h2>
          </div>

          {/* Metrics Grid */}
          <h3 className="text-slate-400 font-medium text-xs lg:text-sm mb-2 lg:mb-3">
            Klíčové metriky
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-3">
            {/* Locality Score - Blue */}
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-3 lg:p-4">
              <div className="text-blue-300 text-xs lg:text-sm mb-2 font-medium">
                Hodnocení lokality
              </div>
              <div className="flex items-end gap-2">
                <div className="text-white font-bold text-2xl lg:text-3xl">
                  {data.metrics.localityScore}
                </div>
                <div className="text-blue-400 text-sm lg:text-base pb-1">
                  / 100
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                  style={{ width: `${data.metrics.localityScore}%` }}
                />
              </div>
            </div>

            {/* Footfall Score - Purple */}
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-3 lg:p-4">
              <div className="text-purple-300 text-xs lg:text-sm mb-2 font-medium">
                Průchodnost
              </div>
              <div className="flex items-end gap-2">
                <div className="text-white font-bold text-2xl lg:text-3xl">
                  {data.metrics.footfallScore}
                </div>
                <div className="text-purple-400 text-sm lg:text-base pb-1">
                  / 100
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-500"
                  style={{ width: `${data.metrics.footfallScore}%` }}
                />
              </div>
            </div>

            {/* Recommended Hours - Pink */}
            <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 rounded-lg p-3 lg:p-4">
              <div className="text-pink-300 text-xs lg:text-sm mb-2 font-medium">
                Doporučené hodiny
              </div>
              <div className="flex items-center gap-2 mt-1">
                <svg
                  className="w-6 h-6 lg:w-8 lg:h-8 text-pink-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-white font-bold text-xl lg:text-2xl">
                  {data.metrics.recommendedHours}
                </div>
              </div>
              <div className="mt-2 text-pink-200 text-xs">
                Optimální provozní doba
              </div>
            </div>
          </div>

          {/* Grounding Sources */}
          {data.sources && data.sources.length > 0 && (
            <GroundingSources sources={data.sources} className="mt-4" />
          )}
        </div>
      )}
    </div>
  );
}
