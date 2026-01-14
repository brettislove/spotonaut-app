"use client";

import { useEffect, useRef, useState } from "react";
import type L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LocationPickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: {
    address: string;
    lat: number;
    lon: number;
  }) => void;
  initialCenter?: [number, number];
}

export default function LocationPickerDialog({
  isOpen,
  onClose,
  onLocationSelect,
  initialCenter = [49.1951, 16.6068], // Brno default
}: LocationPickerDialogProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [currentCenter, setCurrentCenter] =
    useState<[number, number]>(initialCenter);
  const [currentAddress, setCurrentAddress] = useState<string>("");
  const [isLoadingCurrentAddress, setIsLoadingCurrentAddress] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Dynamically import Leaflet only on client side
    const initMap = async () => {
      const L = (await import("leaflet")).default;

      // Initialize map only if not already initialized
      if (!mapRef.current && mapContainerRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: currentCenter,
          zoom: 13,
          zoomControl: true,
          scrollWheelZoom: true,
          dragging: true,
          touchZoom: true,
        });

        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: "abcd",
            maxZoom: 20,
          }
        ).addTo(map);

        mapRef.current = map;

        // Update center when map is moved
        map.on("moveend", () => {
          const center = map.getCenter();
          setCurrentCenter([center.lat, center.lng]);
        });
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Fetch address when center changes (with debounce)
  useEffect(() => {
    if (!isOpen) return;

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsLoadingCurrentAddress(true);

    // Debounce the reverse geocoding
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentCenter[0]}&lon=${currentCenter[1]}&addressdetails=1`,
          {
            headers: {
              "User-Agent": "SpotonAutApp/1.0",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setCurrentAddress(data.display_name);
        } else {
          // Fallback to coordinates if request fails
          setCurrentAddress(
            `${currentCenter[0].toFixed(6)}, ${currentCenter[1].toFixed(6)}`
          );
        }
      } catch (error) {
        console.error("Error fetching address:", error);
        setCurrentAddress(
          `${currentCenter[0].toFixed(6)}, ${currentCenter[1].toFixed(6)}`
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
  }, [currentCenter, isOpen]);

  // Fetch address when center changes (with debounce)
  useEffect(() => {
    if (!isOpen) return;

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsLoadingCurrentAddress(true);

    // Debounce the reverse geocoding
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/location-search?q=${currentCenter[0]},${currentCenter[1]}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.suggestions && data.suggestions.length > 0) {
            setCurrentAddress(data.suggestions[0].display_name);
          } else {
            // Fallback to coordinates if no address found
            setCurrentAddress(
              `${currentCenter[0].toFixed(6)}, ${currentCenter[1].toFixed(6)}`
            );
          }
        }
      } catch (error) {
        console.error("Error fetching address:", error);
        setCurrentAddress(
          `${currentCenter[0].toFixed(6)}, ${currentCenter[1].toFixed(6)}`
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
  }, [currentCenter, isOpen]);

  const handleConfirmLocation = async () => {
    setIsLoadingAddress(true);
    try {
      // Reverse geocode to get address
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentCenter[0]}&lon=${currentCenter[1]}&addressdetails=1`,
        {
          headers: {
            "User-Agent": "SpotonAutApp/1.0",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        onLocationSelect({
          address: data.display_name,
          lat: currentCenter[0],
          lon: currentCenter[1],
        });
        onClose();
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-950 border-0 sm:border border-slate-700 rounded-none sm:rounded-xl shadow-2xl w-full max-w-3xl h-full sm:h-full sm:max-h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Vyberte lokalitu
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Přesuňte mapu a umístěte špendlík na požadované místo
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative min-h-[300px]">
          <div
            ref={mapContainerRef}
            className="absolute inset-0 rounded-none sm:rounded-b-xl overflow-hidden"
          />

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

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-700 flex gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="flex-1 text-white font-semibold text-sm px-4 py-2.5 rounded-full transition-all touch-manipulation bg-slate-900/80 border border-slate-700/50 backdrop-blur-sm cursor-pointer hover:bg-slate-800/70 active:scale-95"
          >
            Zrušit
          </button>
          <button
            onClick={handleConfirmLocation}
            disabled={isLoadingAddress}
            className="flex-1 bg-gradient-to-br from-blue-500 via-blue-600/100 to-blue-800 text-white font-semibold text-sm px-4 py-2.5 rounded-full cursor-pointer hover:from-blue-400 hover:to-blue-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {isLoadingAddress ? "Načítání..." : "Potvrdit lokalitu"}
          </button>
        </div>
      </div>
    </div>
  );
}
