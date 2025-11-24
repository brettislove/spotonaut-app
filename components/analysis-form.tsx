"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import LocationPickerDialog from "./location-picker-dialog";

interface AnalysisFormData {
  location: string;
  productType: "coffee" | "snacks" | "cold_drinks";
  operatingHours: number;
  avgSpend: number;
  timeframe: "day" | "week" | "month" | "year";
}

interface AnalysisFormProps {
  onSubmit: (data: AnalysisFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  showCancelButton?: boolean;
}

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
  osm_type?: string;
  osm_id?: number;
  type?: string;
  importance?: number;
}

export default function AnalysisForm({
  onSubmit,
  onCancel,
  isLoading = false,
  showCancelButton = true,
}: AnalysisFormProps) {
  const [formData, setFormData] = useState<AnalysisFormData>({
    location: "",
    productType: "coffee",
    operatingHours: 40,
    avgSpend: 50,
    timeframe: "month",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof AnalysisFormData, string>>
  >({});

  const [locationInput, setLocationInput] = useState("");
  const [fullLocationData, setFullLocationData] = useState<{
    displayName: string;
    coordinates: { lat: number; lon: number };
  } | null>(null);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const suggestionBoxRef = useRef<HTMLDivElement>(null);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionBoxRef.current &&
        !suggestionBoxRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch location suggestions from Nominatim API
  const fetchLocationSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      // Use our API route to avoid CORS issues
      const response = await fetch(
        `/api/location-search?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        console.error(
          "Location search API error:",
          response.status,
          response.statusText
        );
        setSuggestions([]);
        setIsLoadingSuggestions(false);
        return;
      }

      const data = await response.json();

      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
      } else {
        console.error("Unexpected response format:", data);
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  // Handle location input change with debounce
  const handleLocationChange = (value: string) => {
    setLocationInput(value);
    setShowSuggestions(true);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      fetchLocationSuggestions(value);
    }, 300);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    const shortName = getShortLocationName(suggestion);
    setLocationInput(shortName);
    setFullLocationData({
      displayName: suggestion.display_name,
      coordinates: {
        lat: parseFloat(suggestion.lat),
        lon: parseFloat(suggestion.lon),
      },
    });
    setFormData((prev) => ({ ...prev, location: suggestion.display_name }));
    setShowSuggestions(false);
    setSuggestions([]);
    // Clear error when valid location is selected
    if (errors.location) {
      setErrors((prev) => ({ ...prev, location: undefined }));
    }
  };

  // Handle location picker selection
  const handleLocationPickerSelect = (location: {
    address: string;
    lat: number;
    lon: number;
  }) => {
    const suggestion: LocationSuggestion = {
      display_name: location.address,
      lat: location.lat.toString(),
      lon: location.lon.toString(),
      place_id: Date.now(), // Temporary ID
    };
    const shortName = getShortLocationName(suggestion);
    setLocationInput(shortName);
    setFullLocationData({
      displayName: location.address,
      coordinates: {
        lat: location.lat,
        lon: location.lon,
      },
    });
    setFormData((prev) => ({ ...prev, location: location.address }));
    // Clear error when valid location is selected
    if (errors.location) {
      setErrors((prev) => ({ ...prev, location: undefined }));
    }
  };

  // Format location name for display - shorter version
  const getShortLocationName = (suggestion: LocationSuggestion): string => {
    const parts = suggestion.display_name.split(", ");

    // For Czech addresses, extract: street number, city
    // Example: "Václavské náměstí 846, Praha" from "Václavské náměstí 846/1, Nové Město, Praha 1, Hlavní město Praha, Praha, Střední Čechy, 110 00, Česko"

    let street = "";
    let city = "";

    // First part usually contains street name and possibly number
    if (parts[0]) {
      street = parts[0];
    }

    // Find city name - look for major Czech cities or capitalized names
    city =
      parts.find(
        (p) =>
          p === "Praha" ||
          p === "Brno" ||
          p === "Ostrava" ||
          p === "Plzeň" ||
          p === "Liberec" ||
          p === "Olomouc" ||
          p === "Ústí nad Labem" ||
          p === "Hradec Králové" ||
          p === "České Budějovice" ||
          p === "Pardubice" ||
          (p.match(
            /^[A-ZŠČŘŽÝÁÍÉÚŮ][a-zščřžýáíéúů]+(?: [A-ZŠČŘŽÝÁÍÉÚŮ][a-zščřžýáíéúů]+)*$/
          ) &&
            !p.includes("Česko") &&
            !p.includes("Čechy") &&
            !p.match(/^\d/)) // Not a postal code
      ) || "";

    if (street && city) {
      return `${street}, ${city}`;
    }

    return street || parts[0] || suggestion.display_name;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Use full location data if available, otherwise fall back to input
    const locationToSubmit = fullLocationData?.displayName || locationInput;
    setFormData((prev) => ({ ...prev, location: locationToSubmit }));

    // Validate with current input
    const tempFormData = { ...formData, location: locationToSubmit };
    const newErrors: Partial<Record<keyof AnalysisFormData, string>> = {};

    if (!locationInput.trim()) {
      newErrors.location = "Lokalita je povinná";
    }

    if (tempFormData.operatingHours < 1 || tempFormData.operatingHours > 168) {
      newErrors.operatingHours = "Hodiny musí být mezi 1-168";
    }

    if (tempFormData.avgSpend < 1) {
      newErrors.avgSpend = "Průměrná útrata musí být alespoň 1 Kč";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit(tempFormData);
    }
  };

  const updateField = <K extends keyof AnalysisFormData>(
    field: K,
    value: AnalysisFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 max-w-2xl mx-auto">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">
          Analýza lokality
        </h3>
        <p className="text-slate-400 text-xs">
          Vyplňte základní informace o vašem podnikání potřebné pro analýzu
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Location */}
        <div className="relative" ref={suggestionBoxRef}>
          <label
            htmlFor="location"
            className="block text-xs font-medium text-slate-300 mb-1"
          >
            Cílová lokalita *
          </label>
          <div className="relative">
            <input
              id="location"
              type="text"
              value={locationInput}
              onChange={(e) => handleLocationChange(e.target.value)}
              placeholder="např. Václavské náměstí, Praha"
              disabled={isLoading}
              autoComplete="off"
              className={`w-full bg-slate-900/50 border ${
                errors.location ? "border-red-500" : "border-slate-600"
              } text-white text-sm placeholder-slate-500 rounded-lg px-3 pr-32 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all disabled:opacity-50`}
            />
            <button
              type="button"
              onClick={() => setIsLocationPickerOpen(true)}
              disabled={isLoading}
              className="absolute cursor-pointer right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors px-2 py-1 disabled:opacity-50 flex items-center gap-1.5"
              title="Vybrat z mapy"
            >
              <span className="text-xs font-medium">Vybrat z mapy</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
          {errors.location && (
            <p className="text-red-400 text-xs mt-0.5">{errors.location}</p>
          )}

          {/* Suggestions Dropdown */}
          {showSuggestions &&
            (suggestions.length > 0 || isLoadingSuggestions) && (
              <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {isLoadingSuggestions ? (
                  <div className="px-3 py-2 text-slate-400 text-xs">
                    Načítání...
                  </div>
                ) : (
                  suggestions.map((suggestion) => (
                    <button
                      key={`${suggestion.place_id}-${suggestion.osm_type}`}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0"
                    >
                      <div className="font-medium">
                        {getShortLocationName(suggestion)}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 truncate">
                        {suggestion.display_name}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
        </div>

        {/* Product Type */}
        <div>
          <label
            htmlFor="productType"
            className="block text-xs font-medium text-slate-300 mb-1"
          >
            Typ produktu *
          </label>
          <select
            id="productType"
            value={formData.productType}
            onChange={(e) =>
              updateField(
                "productType",
                e.target.value as AnalysisFormData["productType"]
              )
            }
            disabled={isLoading}
            className="w-full bg-slate-900/50 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all disabled:opacity-50"
          >
            <option value="coffee">Káva / Teplé nápoje</option>
            <option value="snacks">Snacky</option>
            <option value="cold_drinks">Studené nápoje</option>
          </select>
        </div>

        {/* Operating Hours and Average Spend - Side by Side */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="operatingHours"
              className="block text-xs font-medium text-slate-300 mb-2"
            >
              Otevírací doba (počet hodin za týden) *
            </label>
            <div className="space-y-2">
              <input
                id="operatingHours"
                type="range"
                min="1"
                max="168"
                value={formData.operatingHours}
                onChange={(e) =>
                  updateField("operatingHours", parseInt(e.target.value))
                }
                disabled={isLoading}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-blue-500 [&::-webkit-slider-thumb]:to-purple-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gradient-to-r [&::-moz-range-thumb]:from-blue-500 [&::-moz-range-thumb]:to-purple-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-lg"
                style={{
                  background: `linear-gradient(to right, rgb(59 130 246) 0%, rgb(59 130 246) ${
                    (formData.operatingHours / 168) * 100
                  }%, rgb(51 65 85) ${
                    (formData.operatingHours / 168) * 100
                  }%, rgb(51 65 85) 100%)`,
                }}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">1h</span>
                <div className="bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-1.5">
                  <span className="text-sm font-semibold text-white">
                    {formData.operatingHours}h
                  </span>
                </div>
                <span className="text-xs text-slate-500">168h</span>
              </div>
            </div>
            {errors.operatingHours && (
              <p className="text-red-400 text-xs mt-0.5">
                {errors.operatingHours}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="avgSpend"
              className="block text-xs font-medium text-slate-300 mb-2"
            >
              Průměrná útrata na zákazníka (Kč) *
            </label>
            <div className="space-y-2">
              <input
                id="avgSpend"
                type="range"
                min="1"
                max="200"
                value={formData.avgSpend}
                onChange={(e) =>
                  updateField("avgSpend", parseInt(e.target.value))
                }
                disabled={isLoading}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-purple-500 [&::-webkit-slider-thumb]:to-pink-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gradient-to-r [&::-moz-range-thumb]:from-purple-500 [&::-moz-range-thumb]:to-pink-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-lg"
                style={{
                  background: `linear-gradient(to right, rgb(168 85 247) 0%, rgb(168 85 247) ${
                    (formData.avgSpend / 200) * 100
                  }%, rgb(51 65 85) ${
                    (formData.avgSpend / 200) * 100
                  }%, rgb(51 65 85) 100%)`,
                }}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">1 Kč</span>
                <div className="bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-1.5">
                  <span className="text-sm font-semibold text-white">
                    {formData.avgSpend} Kč
                  </span>
                </div>
                <span className="text-xs text-slate-500">200 Kč</span>
              </div>
            </div>
            {errors.avgSpend && (
              <p className="text-red-400 text-xs mt-0.5">{errors.avgSpend}</p>
            )}
          </div>
        </div>

        {/* Timeframe */}
        <div>
          <label
            htmlFor="timeframe"
            className="block text-xs font-medium text-slate-300 mb-1"
          >
            Období analýzy *
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: "day", label: "Den" },
              { value: "week", label: "Týden" },
              { value: "month", label: "Měsíc" },
              { value: "year", label: "Rok" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  updateField(
                    "timeframe",
                    option.value as AnalysisFormData["timeframe"]
                  )
                }
                disabled={isLoading}
                className={`py-1.5 px-3 rounded-lg font-medium text-xs transition-all disabled:opacity-50 ${
                  formData.timeframe === option.value
                    ? "bg-blue-500 text-white"
                    : "bg-slate-900/50 border border-slate-600 text-slate-300 hover:border-slate-500"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {showCancelButton && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 bg-slate-700 text-white font-semibold text-sm px-4 py-2 rounded-lg hover:bg-slate-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Zrušit
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-sm px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Analyzuji..." : "Analyzovat"}
          </button>
        </div>
      </form>

      <LocationPickerDialog
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        onLocationSelect={handleLocationPickerSelect}
      />
    </div>
  );
}
