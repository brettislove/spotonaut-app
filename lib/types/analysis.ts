import type { BusinessType } from "@/lib/constants/business-types";

export interface AnalysisRequest {
  location: string;
  businessType: BusinessType;
  fingerprint?: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
}

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

export interface Analysis {
  id: string;
  locationName: string;
  location: string;
  coordinates: { lat: number; lng: number } | null;
  metrics: {
    localityScore?: number;
    footfallScore?: number;
    recommendedHours?: number;
  };
  businessType: string | null;
  createdAt: string;
}

export type ProgressStep =
  | "geocoding"
  | "maps_grounding"
  | "pro_analysis"
  | "finalizing"
  | "complete";
