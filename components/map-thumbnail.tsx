"use client";

import { Map, MapMarker, MarkerContent } from "@/components/ui/map";

interface MapThumbnailProps {
  coordinates: { lat: number; lng: number };
  locationName: string;
}

export default function MapThumbnail({ coordinates }: MapThumbnailProps) {
  return (
    <div className="h-full w-full relative z-0">
      <Map
        center={[coordinates.lng, coordinates.lat]}
        zoom={15}
        scrollZoom={false}
        dragPan={false}
        dragRotate={false}
        doubleClickZoom={false}
        keyboard={false}
        touchZoomRotate={false}
        attributionControl={false}
      >
        <MapMarker longitude={coordinates.lng} latitude={coordinates.lat}>
          <MarkerContent>
            <div className="relative">
              <div
                className="h-8 w-8 rounded-full rounded-bl-none -rotate-45 border-2 border-white shadow-md"
                style={{
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                }}
              />
              <div className="absolute left-2.5 top-2.5 h-3 w-3 rounded-full bg-white rotate-45" />
            </div>
          </MarkerContent>
        </MapMarker>
      </Map>
    </div>
  );
}
