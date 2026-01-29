import { useEffect, useMemo, useState } from "react";
import { Item, ItemContent, ItemMedia, ItemTitle } from "./ui/item";
import { Spinner } from "./ui/spinner";
import dynamic from "next/dynamic";
import { MapContentProps } from "@/lib/types/map";
import { LatLngExpression } from "leaflet";
import { AnalysisData } from "@/lib/types/analysis";

// Import Map component dynamically to avoid SSR issues
const MapContent = dynamic<MapContentProps>(
  () => import("./map-content").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full flex-col gap-4 [--radius:1rem]">
        <Item variant="muted">
          <ItemMedia>
            <Spinner />
          </ItemMedia>
          <ItemContent>
            <ItemTitle className="line-clamp-1">Načítání mapy...</ItemTitle>
          </ItemContent>
        </Item>
      </div>
    ),
  },
);

export default function MapViewNew({
  analysisData,
}: {
  analysisData: AnalysisData;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [filterState, setFilterState] = useState<Record<string, boolean>>(
    () => {
      // Default filter state with all filters visible
      const defaultFilters = {
        competitors: true,
        transit: true,
        shopping: true,
        office: true,
        residential: true,
        other: true,
        availableProperties: true,
      };

      // Load from localStorage or use default
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("mapFilters");
        if (saved) {
          try {
            const savedFilters = JSON.parse(saved);
            // Merge saved filters with defaults to ensure new filters are included
            return { ...defaultFilters, ...savedFilters };
          } catch {
            return defaultFilters;
          }
        }
      }
      return defaultFilters;
    },
  );

  // Save filter state to localStorage
  useEffect(() => {
    localStorage.setItem("mapFilters", JSON.stringify(filterState));
  }, [filterState]);

  useEffect(() => {
    // Use timeout to avoid SSR hydration issues
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Default to Brno center if no coordinates
  const position: LatLngExpression = useMemo(() => {
    return analysisData.coordinates
      ? [analysisData.coordinates.lat, analysisData.coordinates.lng]
      : [49.1951, 16.6068];
  }, [analysisData.coordinates]);

  const handleFilterChange = (key: string) => {
    setFilterState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center w-full flex-col gap-4 [--radius:1rem]">
        <Item variant="muted">
          <ItemMedia>
            <Spinner />
          </ItemMedia>
          <ItemContent>
            <ItemTitle className="line-clamp-1">Načítání mapy...</ItemTitle>
          </ItemContent>
        </Item>
      </div>
    );
  }
  return (
    <MapContent
      position={position}
      location={analysisData.locationName || analysisData.location}
      groundedLocationData={analysisData.groundedLocationData}
      filterState={filterState}
      onFilterChange={handleFilterChange}
    />
  );
}
