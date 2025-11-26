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
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const productDropdownRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionBoxRef.current &&
        !suggestionBoxRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
      if (
        productDropdownRef.current &&
        !productDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProductDropdownOpen(false);
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
    <div className="w-full max-w-2xl mx-auto p-6 bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white">Analýza lokality</h3>
        <p className="mt-1 text-sm text-slate-400">
          Vyplňte základní informace o vašem podnikání potřebné pro analýzu
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location */}
        <div className="relative" ref={suggestionBoxRef}>
          <label
            htmlFor="location"
            className="block mb-2 text-sm font-medium text-white"
          >
            Cílová lokalita
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
              className={`block w-full p-2.5 pr-32 text-sm rounded-lg border bg-slate-800 border-slate-600 placeholder-slate-500 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                errors.location
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setIsLocationPickerOpen(true)}
              disabled={isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-400 hover:text-blue-400 transition-colors disabled:opacity-50"
              title="Vybrat z mapy"
            >
              <span>Vybrat z mapy</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
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
            <p className="mt-2 text-sm text-red-500">{errors.location}</p>
          )}

          {/* Suggestions Dropdown */}
          {showSuggestions &&
            (suggestions.length > 0 || isLoadingSuggestions) && (
              <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {isLoadingSuggestions ? (
                  <div className="px-4 py-3 text-sm text-slate-400">
                    Načítání...
                  </div>
                ) : (
                  <ul className="py-2 text-sm">
                    {suggestions.map((suggestion) => (
                      <li key={`${suggestion.place_id}-${suggestion.osm_type}`}>
                        <button
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="flex flex-col items-start w-full px-4 py-2 text-left hover:bg-slate-700 transition-colors"
                        >
                          <span className="text-sm font-medium text-white">
                            {getShortLocationName(suggestion)}
                          </span>
                          <span className="text-xs text-gray-400 mt-0.5 truncate w-full">
                            {suggestion.display_name}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
        </div>

        {/* Product Type */}
        <div className="relative" ref={productDropdownRef}>
          <label
            htmlFor="productType"
            className="block mb-2 text-sm font-medium text-white"
          >
            Typ produktu
          </label>
          <button
            type="button"
            onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
            disabled={isLoading}
            className="inline-flex items-center justify-between w-full p-2.5 text-sm font-medium text-white bg-slate-800 border border-slate-600 rounded-lg hover:bg-slate-700 focus:ring-2 focus:outline-none focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span>
              {formData.productType === "coffee"
                ? "Káva / Teplé nápoje"
                : formData.productType === "snacks"
                ? "Snacky"
                : "Studené nápoje"}
            </span>
            <svg
              className={`w-2.5 h-2.5 ms-3 transition-transform ${
                isProductDropdownOpen ? "rotate-180" : ""
              }`}
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 4 4 4-4"
              />
            </svg>
          </button>

          {/* Dropdown menu */}
          {isProductDropdownOpen && (
            <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl divide-y divide-slate-700">
              <ul className="py-2 text-sm text-slate-200">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      updateField("productType", "coffee");
                      setIsProductDropdownOpen(false);
                    }}
                    className={`block w-full px-4 py-2 text-left hover:bg-slate-700 hover:text-white transition-colors ${
                      formData.productType === "coffee"
                        ? "bg-slate-700 text-white"
                        : ""
                    }`}
                  >
                    Káva / Teplé nápoje
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      updateField("productType", "snacks");
                      setIsProductDropdownOpen(false);
                    }}
                    className={`block w-full px-4 py-2 text-left hover:bg-slate-700 hover:text-white transition-colors ${
                      formData.productType === "snacks"
                        ? "bg-slate-700 text-white"
                        : ""
                    }`}
                  >
                    Snacky
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      updateField("productType", "cold_drinks");
                      setIsProductDropdownOpen(false);
                    }}
                    className={`block w-full px-4 py-2 text-left hover:bg-slate-700 hover:text-white transition-colors ${
                      formData.productType === "cold_drinks"
                        ? "bg-slate-700 text-white"
                        : ""
                    }`}
                  >
                    Studené nápoje
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Operating Hours and Average Spend - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="operatingHours"
              className="block mb-2 text-sm font-medium text-white"
            >
              Otevírací doba (hodin/týden)
            </label>
            <div className="space-y-3">
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
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(to right, rgb(59 130 246) 0%, rgb(59 130 246) ${
                    ((formData.operatingHours - 1) / 167) * 100
                  }%, rgb(55 65 81) ${
                    ((formData.operatingHours - 1) / 167) * 100
                  }%, rgb(55 65 81) 100%)`,
                }}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">1h</span>
                <span className="px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 border border-blue-500 rounded-lg">
                  {formData.operatingHours}h
                </span>
                <span className="text-sm text-slate-500">168h</span>
              </div>
            </div>
            {errors.operatingHours && (
              <p className="mt-2 text-sm text-red-500">
                {errors.operatingHours}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="avgSpend"
              className="block mb-2 text-sm font-medium text-slate-200"
            >
              Průměrná útrata (Kč)
            </label>
            <div className="space-y-3">
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
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(to right, rgb(139 92 246) 0%, rgb(139 92 246) ${
                    ((formData.avgSpend - 1) / 199) * 100
                  }%, rgb(55 65 81) ${
                    ((formData.avgSpend - 1) / 199) * 100
                  }%, rgb(55 65 81) 100%)`,
                }}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">1 Kč</span>
                <span className="px-3 py-1.5 text-sm font-semibold text-white bg-purple-600 border border-purple-500 rounded-lg">
                  {formData.avgSpend} Kč
                </span>
                <span className="text-sm text-slate-500">200 Kč</span>
              </div>
            </div>
            {errors.avgSpend && (
              <p className="mt-2 text-sm text-red-500">{errors.avgSpend}</p>
            )}
          </div>
        </div>

        {/* Timeframe */}
        <div>
          <label
            htmlFor="timeframe"
            className="block mb-2 text-sm font-medium text-white"
          >
            Období analýzy
          </label>
          <div className="inline-flex rounded-lg shadow-sm" role="group">
            {[
              { value: "day", label: "Den", position: "first" },
              { value: "week", label: "Týden", position: "middle" },
              { value: "month", label: "Měsíc", position: "middle" },
              { value: "year", label: "Rok", position: "last" },
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
                className={`px-4 py-2 text-sm font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  option.position === "first"
                    ? "rounded-s-lg border-r-0"
                    : option.position === "last"
                    ? "rounded-e-lg"
                    : "border-r-0"
                } ${
                  formData.timeframe === option.value
                    ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-lg"
                    : "bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          {showCancelButton && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-5 py-2.5 text-sm font-medium text-white bg-slate-800 border border-slate-600 rounded-lg hover:bg-slate-700 focus:ring-2 focus:outline-none focus:ring-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Zrušit
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:outline-none focus:ring-blue-500 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
