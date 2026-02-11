"use client";

import { useCallback, useState } from "react";
import {
  Map,
  useMap,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MapControls,
} from "@/components/ui/map";
import { MapContentProps } from "@/lib/types/map";
import { Mountain, RotateCcw } from "lucide-react";

// ── Marker color helper ──────────────────────────────────────────────
function getMarkerColor(type: string) {
  switch (type) {
    case "competitors":
      return "#ef4444";
    case "transit":
      return "#3b82f6";
    case "shopping":
      return "#10b981";
    case "office":
      return "#8b5cf6";
    case "residential":
      return "#f59e0b";
    case "availableProperties":
      return "#ec4899";
    default:
      return "#6b7280";
  }
}

// ── 3D Tilt toggle (child of Map) ────────────────────────────────────
const STYLE_3D = "https://tiles.openfreemap.org/styles/liberty";
const STYLE_2D_LIGHT =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

function TiltToggle() {
  const { map, isLoaded } = useMap();
  const [is3D, setIs3D] = useState(false);

  const toggle = useCallback(() => {
    if (!map) return;
    const next = !is3D;
    setIs3D(next);

    map.setStyle(next ? STYLE_3D : STYLE_2D_LIGHT);
    map.easeTo({
      pitch: next ? 60 : 0,
      bearing: next ? -20 : 0,
      duration: 1000,
    });
  }, [map, is3D]);

  if (!isLoaded) return null;

  return (
    <button
      onClick={toggle}
      className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5 rounded-md border border-border bg-background/90 px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur hover:bg-accent transition-colors cursor-pointer"
    >
      {is3D ? (
        <>
          <RotateCcw className="size-3.5" /> 2D
        </>
      ) : (
        <>
          <Mountain className="size-3.5" /> 3D
        </>
      )}
    </button>
  );
}

// ── Main map content ─────────────────────────────────────────────────
export default function MapContent({
  center,
  location,
  groundedLocationData,
  filterState,
}: MapContentProps) {
  return (
    <div className="relative h-full w-full">
      <Map theme="light" center={center} zoom={15} scrollZoom>
        <MapControls showZoom showCompass position="bottom-right" />
        <TiltToggle />

        {/* Primary location marker */}
        <MapMarker longitude={center[0]} latitude={center[1]}>
          <MarkerContent>
            <div className="relative">
              <div
                className="h-10 w-10 rounded-full rounded-bl-none -rotate-45 border-3 border-white shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                }}
              />
              <div className="absolute left-3 top-3 h-4 w-4 rounded-full bg-white rotate-45" />
            </div>
          </MarkerContent>
          <MarkerPopup>
            <div className="text-sm font-semibold text-foreground">
              {location}
            </div>
          </MarkerPopup>
        </MapMarker>

        {/* ── Competitors ───────────────────────────────────────── */}
        {(groundedLocationData?.competitors ?? [])
          .filter((c) => c.coordinates && filterState?.competitors)
          .map((competitor, index) => (
            <MapMarker
              key={`competitor-${index}`}
              longitude={competitor.coordinates!.lng}
              latitude={competitor.coordinates!.lat}
            >
              <MarkerContent>
                <div
                  className="h-7 w-7 rounded-full border-2 border-white shadow-md flex items-center justify-center"
                  style={{ background: getMarkerColor("competitors") }}
                >
                  <div className="h-3 w-3 rounded-full bg-white/80" />
                </div>
              </MarkerContent>
              <MarkerPopup className="max-w-48">
                <div className="text-sm space-y-1">
                  <strong className="text-red-600">{competitor.name}</strong>
                  {competitor.category && (
                    <div className="text-muted-foreground">
                      {competitor.category}
                    </div>
                  )}
                  {competitor.rating && (
                    <div className="flex items-center gap-1">
                      <span>⭐</span>
                      <span>{competitor.rating.toFixed(1)}</span>
                      {competitor.userRatingsTotal && (
                        <span className="text-muted-foreground">
                          ({competitor.userRatingsTotal})
                        </span>
                      )}
                    </div>
                  )}
                  {competitor.distanceMeters && (
                    <div className="text-muted-foreground text-xs">
                      {Math.round(competitor.distanceMeters)}m daleko
                    </div>
                  )}
                  {competitor.address && (
                    <div className="text-muted-foreground text-xs">
                      {competitor.address}
                    </div>
                  )}
                  {competitor.mapsUrl && (
                    <a
                      href={competitor.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-xs block"
                    >
                      Zobrazit na Google Maps
                    </a>
                  )}
                </div>
              </MarkerPopup>
            </MapMarker>
          ))}

        {/* ── Footfall proxies ──────────────────────────────────── */}
        {(groundedLocationData?.footfallProxies ?? [])
          .filter((p) => p.coordinates && filterState?.[p.type])
          .map((proxy, index) => (
            <MapMarker
              key={`proxy-${proxy.type}-${index}`}
              longitude={proxy.coordinates!.lng}
              latitude={proxy.coordinates!.lat}
            >
              <MarkerContent>
                <div
                  className="h-7 w-7 rounded-full border-2 border-white shadow-md flex items-center justify-center"
                  style={{ background: getMarkerColor(proxy.type) }}
                >
                  <div className="h-3 w-3 rounded-full bg-white/80" />
                </div>
              </MarkerContent>
              <MarkerPopup className="max-w-48">
                <div className="text-sm space-y-1">
                  <strong style={{ color: getMarkerColor(proxy.type) }}>
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
                  <div className="text-muted-foreground">
                    {proxy.description}
                  </div>
                  {proxy.distanceMeters && (
                    <div className="text-muted-foreground text-xs">
                      {Math.round(proxy.distanceMeters)}m daleko
                    </div>
                  )}
                </div>
              </MarkerPopup>
            </MapMarker>
          ))}

        {/* ── Available commercial properties ───────────────────── */}
        {(groundedLocationData?.availableProperties ?? [])
          .filter((p) => p.coordinates && filterState?.availableProperties)
          .map((property) => (
            <MapMarker
              key={`property-${property.source}-${property.id}`}
              longitude={property.coordinates!.lng}
              latitude={property.coordinates!.lat}
            >
              <MarkerContent>
                <div
                  className="h-7 w-7 rounded-full border-2 border-white shadow-md flex items-center justify-center"
                  style={{
                    background: getMarkerColor("availableProperties"),
                  }}
                >
                  <div className="h-3 w-3 rounded-full bg-white/80" />
                </div>
              </MarkerContent>
              <MarkerPopup className="max-w-64">
                <div className="text-sm space-y-1">
                  <strong className="text-pink-600 block">
                    {property.title}
                  </strong>
                  <div className="text-muted-foreground text-xs">
                    {property.category}
                  </div>
                  {property.price && (
                    <div className="flex items-center gap-1 font-semibold text-base">
                      <span>{property.price.toLocaleString("cs-CZ")} Kč</span>
                      {property.transactionType === "rent" && (
                        <span className="text-xs text-muted-foreground font-normal">
                          / měsíc
                        </span>
                      )}
                    </div>
                  )}
                  {property.pricePerSqm && property.size && (
                    <div className="text-muted-foreground text-xs">
                      {property.pricePerSqm.toLocaleString("cs-CZ")} Kč/m²
                    </div>
                  )}
                  {property.size && (
                    <div className="text-sm">
                      <span className="font-medium">{property.size} m²</span>
                    </div>
                  )}
                  {property.address && (
                    <div className="text-muted-foreground text-xs">
                      📍 {property.address}
                    </div>
                  )}
                  {property.distanceMeters && (
                    <div className="text-muted-foreground text-xs">
                      {Math.round(property.distanceMeters)}m od lokace
                    </div>
                  )}
                  {property.labels && property.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {property.labels.slice(0, 3).map((label, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-muted px-1.5 py-0.5 rounded"
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
                    className="text-blue-600 text-xs block hover:underline font-medium pt-1"
                  >
                    Zobrazit inzerát →
                  </a>
                  <div className="text-xs text-muted-foreground pt-2 mt-1 border-t border-border">
                    Zdroj:{" "}
                    {property.source === "sreality" ? (
                      <a
                        href="https://www.sreality.cz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        Sreality.cz
                      </a>
                    ) : (
                      <a
                        href="https://www.bezrealitky.cz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        Bezrealitky.cz
                      </a>
                    )}
                  </div>
                </div>
              </MarkerPopup>
            </MapMarker>
          ))}
      </Map>
    </div>
  );
}
