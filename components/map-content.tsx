"use client";

import { useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";

interface MapContentProps {
  position: LatLngExpression;
  location: string;
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

export default function MapContent({ position, location }: MapContentProps) {
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
    </MapContainer>
  );
}
