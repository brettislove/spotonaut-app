import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LocationData } from "@/lib/types/analysis";
import { handleConfirmLocation } from "@/utils/location-input";
import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { MapViewport } from "@/components/ui/map";

// Dynamically import the map to avoid SSR issues with MapLibre GL
const LocationPickerMap = dynamic<{
  center: [number, number];
  onViewportChange: (viewport: MapViewport) => void;
}>(
  () =>
    import("@/components/ui/map").then((mod) => {
      const { Map, MapControls } = mod;
      return function PickerMap({
        center,
        onViewportChange,
      }: {
        center: [number, number];
        onViewportChange: (viewport: MapViewport) => void;
      }) {
        return (
          <Map
            theme="light"
            center={center}
            zoom={13}
            onViewportChange={onViewportChange}
          >
            <MapControls showZoom position="bottom-right" />
          </Map>
        );
      };
    }),
  { ssr: false },
);

interface LocationPickerDialogNewProps {
  setLocationInput: React.Dispatch<React.SetStateAction<string>>;
  setFullLocationData: React.Dispatch<
    React.SetStateAction<LocationData | null>
  >;
  setFormField: React.Dispatch<React.SetStateAction<string>>;
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function LocationPickerDialogNew({
  setLocationInput,
  setFullLocationData,
  setFormField,
  isDialogOpen,
  setIsDialogOpen,
}: LocationPickerDialogNewProps) {
  // Brno default — currentCenter is [lat, lng] for reverse geocoding API
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isLoadingCurrentAddress, setIsLoadingCurrentAddress] = useState(false);
  const [currentCenter, setCurrentCenter] = useState<[number, number]>([
    49.1951, 16.6068,
  ]);
  const [currentAddress, setCurrentAddress] = useState<string>("");
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleViewportChange = useCallback((viewport: MapViewport) => {
    // MapLibre center is [lng, lat] — convert to [lat, lng] for geocoding
    setCurrentCenter([viewport.center[1], viewport.center[0]]);
  }, []);

  // Fetch address when center changes (with debounce)
  useEffect(() => {
    if (!isDialogOpen) return;

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsLoadingCurrentAddress(true);

    // Debounce the reverse geocoding
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/location-search?q=${currentCenter[0]},${currentCenter[1]}`,
        );

        if (response.ok) {
          const data = await response.json();
          if (data.suggestions && data.suggestions.length > 0) {
            setCurrentAddress(data.suggestions[0].display_name);
          } else {
            // Fallback to coordinates if no address found
            setCurrentAddress(
              `${currentCenter[0].toFixed(6)}, ${currentCenter[1].toFixed(6)}`,
            );
          }
        }
      } catch (error) {
        console.error("Error fetching address:", error);
        setCurrentAddress(
          `${currentCenter[0].toFixed(6)}, ${currentCenter[1].toFixed(6)}`,
        );
      } finally {
        setIsLoadingCurrentAddress(false);
      }
    }, 500); // Wait 500ms after user stops moving map

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [currentCenter, isDialogOpen]);

  return (
    <DialogContent className="w-full max-w-6xl">
      <DialogHeader>
        <DialogTitle>Vyberte lokalitu</DialogTitle>
        <DialogDescription>
          Přesuňte mapu a umístěte špendlík na požadované místo
        </DialogDescription>
      </DialogHeader>
      {/* Map Container */}
      <div className="relative w-full" style={{ height: "500px" }}>
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <LocationPickerMap
            center={[currentCenter[1], currentCenter[0]]}
            onViewportChange={handleViewportChange}
          />
        </div>

        {/* Center Pin */}
        <div
          className="absolute top-1/2 left-1/2 pointer-events-none z-[1000]"
          style={{ transform: "translate(-50%, -60px)" }}
        >
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600/100 to-blue-800 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-1 h-8 bg-gradient-to-br from-blue-500 via-blue-600/100 to-blue-800" />
            <div className="absolute top-full left-1/2 -translate-x-1/2 translate-y-8 w-3 h-3 bg-gradient-to-br from-blue-500 via-blue-600/100 to-blue-800 rounded-full border-1 border-white shadow-lg" />
          </div>
        </div>

        {/* Address Display */}
        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 text-white text-xs px-3 py-2 rounded-lg z-[1000] max-w-md bg-slate-900/80 border border-slate-700/50 backdrop-blur-sm">
          {isLoadingCurrentAddress ? (
            <div className="flex items-center gap-2 text-slate-400">
              <svg
                className="animate-spin h-3 w-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Načítání adresy...</span>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <svg
                className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5"
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
              <div className="flex-1 min-w-0">
                <div className="text-slate-200 leading-relaxed break-words">
                  {currentAddress || "Vyberte lokalitu..."}
                </div>
                <div className="text-slate-500 font-mono text-[10px] mt-1">
                  {currentCenter[0].toFixed(6)}, {currentCenter[1].toFixed(6)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
          Zrušit
        </Button>
        <Button
          disabled={isLoadingAddress}
          onClick={async () =>
            await handleConfirmLocation(
              setIsLoadingAddress,
              currentCenter,
              setLocationInput,
              setFullLocationData,
              setFormField,
            ).then(() => setIsDialogOpen(false))
          }
          className="bg-gradient-to-br from-blue-500 via-blue-600/100 to-blue-800"
        >
          {isLoadingAddress ? "Načítání..." : "Potvrdit lokalitu"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
