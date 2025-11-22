"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import type { LatLngExpression } from "leaflet";

interface AnalysisData {
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  metrics?: {
    dailyRevenue: number;
    weeklyRevenue: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    dailyFootTraffic: number;
    conversionRate: number;
    competitorCount: number;
  };
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
      : [50.0755, 14.4378];
  }, [data.coordinates]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("cs-CZ").format(num);
  };

  if (!isMounted) {
    return (
      <div className="h-full w-full bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl flex items-center justify-center">
        <div className="text-slate-400">Načítání mapy...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
      {/* Map */}
      <div className="flex-1 relative">
        <MapContent position={position} location={data.location} />
      </div>

      {/* Data Overlay */}
      {data.metrics && (
        <div className="p-3 lg:p-4 bg-slate-900/90 backdrop-blur-sm border-t border-slate-700">
          <h3 className="text-white font-semibold text-sm lg:text-base mb-2 lg:mb-3 flex items-center gap-2">
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Hlavní metriky
          </h3>
          <div className="grid grid-cols-2 gap-2 lg:gap-3">
            <div className="bg-slate-800/50 rounded-lg p-2 lg:p-3">
              <div className="text-slate-400 text-xs mb-1">Měsíční příjem</div>
              <div className="text-white font-bold text-base lg:text-lg">
                {formatNumber(data.metrics.monthlyRevenue)} Kč
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2 lg:p-3">
              <div className="text-slate-400 text-xs mb-1">
                Denní návštěvnost
              </div>
              <div className="text-white font-bold text-base lg:text-lg">
                {formatNumber(data.metrics.dailyFootTraffic)}
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2 lg:p-3">
              <div className="text-slate-400 text-xs mb-1">Konverze</div>
              <div className="text-white font-bold text-base lg:text-lg">
                {data.metrics.conversionRate}%
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-2 lg:p-3">
              <div className="text-slate-400 text-xs mb-1">Konkurenti</div>
              <div className="text-white font-bold text-base lg:text-lg">
                {data.metrics.competitorCount}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
