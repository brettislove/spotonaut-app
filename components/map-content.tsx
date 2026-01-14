"use client";

import { useMemo, useEffect, useState } from "react";
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
  onFilterChange?: (key: string) => void;
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
  onFilterChange,
}: MapContentProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
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

  const getFilterDisplayName = (key: string) => {
    switch (key) {
      case "competitors":
        return "Konkurence";
      case "transit":
        return "Doprava";
      case "shopping":
        return "Nákupy";
      case "office":
        return "Kanceláře";
      case "residential":
        return "Bydlení";
      case "availableProperties":
        return "Dostupné prostory";
      default:
        return "Ostatní";
    }
  };

  const hasDataForFilter = (key: string) => {
    switch (key) {
      case "competitors":
        return (groundedLocationData?.competitors?.length ?? 0) > 0;
      case "transit":
        return groundedLocationData?.footfallProxies?.some(
          (proxy) => proxy.type === "transit"
        );
      case "shopping":
        return groundedLocationData?.footfallProxies?.some(
          (proxy) => proxy.type === "shopping"
        );
      case "office":
        return groundedLocationData?.footfallProxies?.some(
          (proxy) => proxy.type === "office"
        );
      case "residential":
        return groundedLocationData?.footfallProxies?.some(
          (proxy) => proxy.type === "residential"
        );
      case "availableProperties":
        return (groundedLocationData?.availableProperties?.length ?? 0) > 0;
      case "other":
        return groundedLocationData?.footfallProxies?.some(
          (proxy) => proxy.type === "other"
        );
      default:
        return false;
    }
  };

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
      case "availableProperties":
        return "#ec4899"; // pink
      default:
        return "#6b7280"; // gray
    }
  };

  return (
    <div className="relative h-full w-full overflow-visible">
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

        {/* Render competitors */}
        {(groundedLocationData?.competitors ?? [])
          .filter(
            (competitor) => competitor.coordinates && filterState?.competitors
          )
          .map((competitor, index) => {
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
        {(groundedLocationData?.footfallProxies ?? [])
          .filter((proxy) => proxy.coordinates && filterState?.[proxy.type])
          .map((proxy, index) => {
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

        {/* Render available commercial properties */}
        {(groundedLocationData?.availableProperties ?? [])
          .filter(
            (property) =>
              property.coordinates && filterState?.availableProperties
          )
          .map((property) => {
            return (
              <Marker
                key={`property-${property.source}-${property.id}`}
                position={[
                  property.coordinates!.lat,
                  property.coordinates!.lng,
                ]}
                icon={createMarkerIcon(
                  "availableProperties",
                  getMarkerColor("availableProperties")
                )}
              >
                <Popup>
                  <div className="text-sm max-w-64">
                    <strong className="text-pink-600 block mb-1">
                      {property.title}
                    </strong>
                    <div className="text-gray-600 text-xs mb-2">
                      {property.category}
                    </div>
                    {property.price && (
                      <div className="flex items-center gap-1 mt-1 font-semibold text-base">
                        <span>{property.price.toLocaleString("cs-CZ")} Kč</span>
                        {property.transactionType === "rent" && (
                          <span className="text-xs text-gray-500 font-normal">
                            / měsíc
                          </span>
                        )}
                      </div>
                    )}
                    {property.pricePerSqm && property.size && (
                      <div className="text-gray-500 text-xs">
                        {property.pricePerSqm.toLocaleString("cs-CZ")} Kč/m²
                      </div>
                    )}
                    {property.size && (
                      <div className="text-gray-600 text-sm mt-1">
                        <span className="font-medium">{property.size} m²</span>
                      </div>
                    )}
                    {property.address && (
                      <div className="text-gray-600 text-xs mt-1">
                        📍 {property.address}
                      </div>
                    )}
                    {property.distanceMeters && (
                      <div className="text-gray-500 text-xs mt-1">
                        {Math.round(property.distanceMeters)}m od lokace
                      </div>
                    )}
                    {property.labels && property.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {property.labels.slice(0, 3).map((label, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-gray-100 px-1.5 py-0.5 rounded"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                    <a
                      href={property.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-xs mt-2 block hover:underline font-medium"
                    >
                      Zobrazit inzerát →
                    </a>
                    <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-200">
                      Zdroj:{" "}
                      {property.source === "sreality" ? (
                        <a
                          href="https://www.sreality.cz"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:underline"
                        >
                          Sreality.cz
                        </a>
                      ) : (
                        <a
                          href="https://www.bezrealitky.cz"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:underline"
                        >
                          Bezrealitky.cz
                        </a>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      {/* Filter Dropdown */}
      {groundedLocationData && filterState && onFilterChange && (
        <div className="fixed top-3 right-3 z-[9999] sm:absolute">
          <div className="relative">
            {/* Dropdown Trigger */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-full px-3 py-2 text-slate-300 text-sm font-medium flex items-center gap-2 cursor-pointer hover:bg-slate-800/90 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Body v okolí
              <svg
                className={`w-4 h-4 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Content */}
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 bg-slate-900/95 backdrop-blur-lg border border-slate-700 rounded-2xl p-1 min-w-[100px] shadow-2xl z-[9999]">
                <div className="">
                  {Object.entries(filterState).map(([key, isVisible]) => {
                    const hasData = hasDataForFilter(key);
                    return (
                      <div
                        key={key}
                        onClick={() => hasData && onFilterChange(key)}
                        onMouseEnter={() => hasData && setHoveredKey(key)}
                        onMouseLeave={() => setHoveredKey(null)}
                        className={`flex items-center gap-3 px-2 my-2 rounded-full transition-all duration-200 border-2 ${
                          !hasData
                            ? "opacity-50 cursor-not-allowed text-slate-500"
                            : isVisible
                            ? "cursor-pointer text-white font-semibold"
                            : "cursor-pointer text-slate-300"
                        }`}
                        style={
                          !hasData
                            ? {
                                borderColor: "transparent",
                              }
                            : isVisible
                            ? {
                                backgroundColor: `${getMarkerColor(key)}40`, // 50% opacity
                                borderColor: getMarkerColor(key), // 100% opacity
                              }
                            : hoveredKey === key
                            ? {
                                backgroundColor: `${getMarkerColor(key)}30`, // 30% opacity for hover
                                borderColor: "transparent",
                              }
                            : {
                                borderColor: "transparent", // invisible border for unselected
                              }
                        }
                      >
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getMarkerColor(key) }}
                        />
                        <span className="text-sm font-medium">
                          {getFilterDisplayName(key)}
                        </span>
                        {!hasData && (
                          <span className="text-xs text-slate-500 ml-auto">
                            (žádné)
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Click outside to close */}
          {isDropdownOpen && (
            <div
              className="fixed inset-0 z-[-1]"
              onClick={() => setIsDropdownOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}
