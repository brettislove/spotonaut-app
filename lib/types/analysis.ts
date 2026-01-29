import type { BusinessType } from "@/lib/constants/business-types";

export interface AnalysisFormData {
  location: string;
  businessType: BusinessType;
  coordinates?: {
    lat: number;
    lon: number;
  };
}

export interface AnalysisFormProps {
  onSubmit: (data: AnalysisFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  showCancelButton?: boolean;
}

export interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
  osm_type?: string;
  osm_id?: number;
  type?: string;
  importance?: number;
}

export interface LocationData {
  displayName: string;
  coordinates: { lat: number; lon: number };
}

export interface AnalysisData {
  id?: string;
  location: string;
  locationName: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  metrics?: {
    localityScore: number;
    footfallScore: number;
    recommendedHours: string;
  };
  sources?: Array<{ title: string; uri: string }>;
  groundedLocationData?: import("@/lib/google-ai/location-analysis").GroundedLocationData;
}
