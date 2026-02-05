"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapThumbnailProps {
  coordinates: { lat: number; lng: number };
  locationName: string;
}

export default function MapThumbnail({ coordinates }: MapThumbnailProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [coordinates.lat, coordinates.lng],
      zoom: 15,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Add CARTO tile layer (same as main map)
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        subdomains: "abcd",
        maxZoom: 20,
      },
    ).addTo(map);

    // Custom marker icon
    const customIcon = L.divIcon({
      className: "custom-marker-thumbnail",
      html: `
        <div style="position: relative;">
          <div style="
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
          "></div>
          <div style="
            position: absolute;
            top: 10px;
            left: 10px;
            width: 12px;
            height: 12px;
            background: white;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    // Add marker
    L.marker([coordinates.lat, coordinates.lng], { icon: customIcon }).addTo(
      map,
    );

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [coordinates.lat, coordinates.lng]);

  return (
    <div
      ref={mapRef}
      className="h-full w-full relative z-0"
      style={{ background: "#f0f0f0" }}
    />
  );
}
