"use client";

import { useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import type { GroundedLocationData } from "@/lib/google-ai/location-analysis";

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";

interface MapContentProps {
  position: LatLngExpression;
  location: string;
  groundedLocationData?: GroundedLocationData;
  filterState?: Record<string, boolean>;
}

// Component to trigger map invalidation
function MapInvalidator() {
  const map = useMap();

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

export default function MapContent({
  position,
  location,
  groundedLocationData,
  filterState,
}: MapContentProps) {
  const customIcon = useMemo(
    () =>
      L.divIcon({
        className: "custom-marker",
        html: `
        <div style="position: relative;">
          <div style="
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          "></div>
          <div style="
            position: absolute;
            top: 12px;
            left: 12px;
            width: 16px;
            height: 16px;
            background: white;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      }),
    []
  );

  const createMarkerIcon = useMemo(
    () => (type: string, color: string) =>
      L.divIcon({
        className: "custom-marker",
        html: `
      <div style="position: relative;">
        <div style="
          width: 30px;
          height: 30px;
          background: ${color};
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 12px;
            height: 12px;
            background: white;
            border-radius: 50%;
            opacity: 0.8;
          "></div>
        </div>
      </div>
    `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15],
      }),
    []
  );

  const getMarkerColor = (type: string) => {
    switch (type) {
      case "competitors":
        return "#ef4444"; // red
      case "transit":
        return "#3b82f6"; // blue
      case "shopping":
        return "#10b981"; // green
      case "office":
        return "#8b5cf6"; // purple
      case "residential":
        return "#f59e0b"; // yellow
      default:
        return "#6b7280"; // gray
    }
  };

  // Move main location log out of JSX so it doesn't produce a void ReactNode
  console.log("Main location marker:", {
    name: location,
    coordinates: position,
  });

  return (
    <MapContainer
      center={position}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
      className="z-0 sm:rounded-t-2xl"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />
      <MapInvalidator />
      <Marker position={position} icon={customIcon}>
        <Popup>
          <div className="text-sm">
            <strong>{location}</strong>
          </div>
        </Popup>
      </Marker>

      {/* console: moved out of JSX to avoid ReactNode void error */}

      {/* Render competitors */}
      {groundedLocationData?.competitors
        .filter(
          (competitor) => competitor.coordinates && filterState?.competitors
        )
        .map((competitor, index) => {
          console.log("Competitor marker:", {
            name: competitor.name,
            coordinates: competitor.coordinates,
            category: competitor.category,
            rating: competitor.rating,
            distanceMeters: competitor.distanceMeters,
          });
          return (
            <Marker
              key={`competitor-${index}`}
              position={[
                competitor.coordinates!.lat,
                competitor.coordinates!.lng,
              ]}
              icon={createMarkerIcon(
                "competitors",
                getMarkerColor("competitors")
              )}
            >
              <Popup>
                <div className="text-sm max-w-48">
                  <strong className="text-red-600">{competitor.name}</strong>
                  {competitor.category && (
                    <div className="text-gray-600">{competitor.category}</div>
                  )}
                  {competitor.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <span>⭐</span>
                      <span>{competitor.rating.toFixed(1)}</span>
                      {competitor.userRatingsTotal && (
                        <span className="text-gray-500">
                          ({competitor.userRatingsTotal})
                        </span>
                      )}
                    </div>
                  )}
                  {competitor.distanceMeters && (
                    <div className="text-gray-500 text-xs mt-1">
                      {Math.round(competitor.distanceMeters)}m away
                    </div>
                  )}
                  {competitor.address && (
                    <div className="text-gray-600 text-xs mt-1">
                      {competitor.address}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

      {/* Render footfall proxies */}
      {groundedLocationData?.footfallProxies
        .filter((proxy) => proxy.coordinates && filterState?.[proxy.type])
        .map((proxy, index) => {
          console.log("Footfall proxy marker:", {
            type: proxy.type,
            description: proxy.description,
            coordinates: proxy.coordinates,
            distanceMeters: proxy.distanceMeters,
          });
          return (
            <Marker
              key={`proxy-${proxy.type}-${index}`}
              position={[proxy.coordinates!.lat, proxy.coordinates!.lng]}
              icon={createMarkerIcon(proxy.type, getMarkerColor(proxy.type))}
            >
              <Popup>
                <div className="text-sm max-w-48">
                  <strong
                    className="capitalize"
                    style={{ color: getMarkerColor(proxy.type) }}
                  >
                    {proxy.type === "transit"
                      ? "Doprava"
                      : proxy.type === "shopping"
                      ? "Nákupy"
                      : proxy.type === "office"
                      ? "Kancelář"
                      : proxy.type === "residential"
                      ? "Bydlení"
                      : "Ostatní"}
                  </strong>
                  <div className="text-gray-600">{proxy.description}</div>
                  {proxy.distanceMeters && (
                    <div className="text-gray-500 text-xs mt-1">
                      {Math.round(proxy.distanceMeters)}m away
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
    </MapContainer>
  );
}
