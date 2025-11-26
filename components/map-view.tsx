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
    dailyFootTraffic: number;
    monthlyRevenue: number;
    revenuePerCustomer: number;
    periodRevenue: number;
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
        <div className="p-2 lg:p-4 bg-slate-900/90 backdrop-blur-sm border-t border-slate-700">
          <h3 className="text-white font-semibold text-xs lg:text-base mb-1.5 lg:mb-3 flex items-center gap-1.5 lg:gap-2">
            <svg
              className="w-3 h-3 lg:w-5 lg:h-5 text-blue-400"
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
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5 lg:gap-3">
            {/* Daily Foot Traffic - Blue */}
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-1.5 lg:p-3">
              <div className="text-blue-300 text-[10px] lg:text-xs mb-0.5 lg:mb-1 font-medium">
                Denní návštěvnost
              </div>
              <div className="text-white font-bold text-sm lg:text-lg">
                {formatNumber(data.metrics.dailyFootTraffic)}
              </div>
            </div>

            {/* Monthly Revenue - Purple */}
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-1.5 lg:p-3">
              <div className="text-purple-300 text-[10px] lg:text-xs mb-0.5 lg:mb-1 font-medium">
                Měsíční příjem
              </div>
              <div className="text-white font-bold text-sm lg:text-lg">
                {formatNumber(data.metrics.monthlyRevenue)} Kč
              </div>
            </div>

            {/* Revenue Per Customer - Pink */}
            <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 rounded-lg p-1.5 lg:p-3">
              <div className="text-pink-300 text-[10px] lg:text-xs mb-0.5 lg:mb-1 font-medium">
                Příjem na zákazníka
              </div>
              <div className="text-white font-bold text-sm lg:text-lg">
                {formatNumber(data.metrics.revenuePerCustomer)} Kč
              </div>
            </div>

            {/* Period Revenue - Cyan */}
            <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-lg p-1.5 lg:p-3">
              <div className="text-cyan-300 text-[10px] lg:text-xs mb-0.5 lg:mb-1 font-medium">
                Příjem za období
              </div>
              <div className="text-white font-bold text-sm lg:text-lg">
                {formatNumber(data.metrics.periodRevenue)} Kč
              </div>
            </div>

            {/* Conversion Rate - Amber */}
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-lg p-1.5 lg:p-3">
              <div className="text-amber-300 text-[10px] lg:text-xs mb-0.5 lg:mb-1 font-medium">
                Konverze
              </div>
              <div className="text-white font-bold text-sm lg:text-lg">
                {data.metrics.conversionRate}%
              </div>
            </div>

            {/* Competitor Count - Rose */}
            <div className="bg-gradient-to-br from-rose-500/10 to-rose-600/5 border border-rose-500/20 rounded-lg p-1.5 lg:p-3">
              <div className="text-rose-300 text-[10px] lg:text-xs mb-0.5 lg:mb-1 font-medium">
                Počet konkurentů
              </div>
              <div className="text-white font-bold text-sm lg:text-lg">
                {data.metrics.competitorCount}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
