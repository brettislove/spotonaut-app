import { GroundedLocationData } from "../google-ai/location-analysis";

interface MapContentProps {
  /** Center coordinates as [longitude, latitude] (MapLibre convention) */
  center: [number, number];
  location: string;
  groundedLocationData?: GroundedLocationData;
  filterState?: Record<string, boolean>;
}

export type { MapContentProps };
