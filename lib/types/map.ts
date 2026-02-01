import { LatLngExpression } from "leaflet";
import { GroundedLocationData } from "../google-ai/location-analysis";
import React from "react";

interface MapContentProps {
  position: LatLngExpression;
  location: string;
  groundedLocationData?: GroundedLocationData;
  filterState?: Record<string, boolean>;
}

export type { MapContentProps };
