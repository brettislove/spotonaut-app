import { LatLngExpression } from "leaflet";
import { GroundedLocationData } from "../google-ai/location-analysis";

interface MapContentProps {
  position: LatLngExpression;
  location: string;
  groundedLocationData?: GroundedLocationData;
  filterState?: Record<string, boolean>;
  onFilterChange?: (key: string) => void;
}

export type { MapContentProps };
