"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";

interface MapContentProps {
  position: LatLngExpression;
  location: string;
}

export default function MapContent({ position, location }: MapContentProps) {
  useEffect(() => {
    // Fix for default marker icon in Next.js
    delete (L.Icon.Default.prototype as L.Icon & { _getIconUrl?: () => string })
      ._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

  return (
    <MapContainer
      center={position}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
      className="z-0 rounded-t-2xl"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />
      <Marker position={position}>
        <Popup>
          <div className="text-sm">
            <strong>{location}</strong>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
