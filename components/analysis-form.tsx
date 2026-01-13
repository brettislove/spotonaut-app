"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import LocationPickerDialog from "./location-picker-dialog";
import FieldHelp from "./ui/field-help";
import BusinessTypeSelect from "./ui/business-type-select";
import OperatingDays from "./operating-days";
import type { BusinessType } from "@/lib/constants/business-types";

interface AnalysisFormData {
  location: string;
  businessType: BusinessType;
  operatingHours: number;
  timeframe: "day" | "week" | "month" | "year";
  coordinates?: {
    lat: number;
    lon: number;
  };
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
  const [formData, setFormData] = useState<Partial<AnalysisFormData>>({
    location: "",
    businessType: undefined,
    operatingHours: 40,
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
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  // Daily hours map (managed by OperatingDays component)
  const [dailyHours, setDailyHours] = useState<Record<string, number> | null>(
    null
  );
  const loadingTexts = [
    "Analyzuji lokalitu...",
    "Zjišťuji hustotu provozu...",
    "Mapuji konkurenci...",
    "Počítám potenciální tržby...",
    "Vyhodnocuji data...",
  ];

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

  // dailyHours will be initialized by OperatingDays and reported via onChange

  // Cycle through loading texts
  useEffect(() => {
    if (!isLoading) {
      setLoadingTextIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 2000); // Change text every 2 seconds

    return () => clearInterval(interval);
  }, [isLoading, loadingTexts.length]);

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
    const newErrors: Partial<Record<keyof AnalysisFormData, string>> = {};

    if (!locationInput.trim()) {
      newErrors.location = "Lokalita je povinná";
    } else if (!fullLocationData) {
      newErrors.location =
        "Lokalita je moc obecná, nebo se nám ji nepodařilo určit. Vyberte lokalitu ze seznamu návrhů nebo z mapy";
    }

    if (!formData.businessType) {
      newErrors.businessType = "Typ podnikání je povinný";
    }

    const selectedCount = dailyHours
      ? Object.values(dailyHours).filter((h) => h > 0).length
      : Math.max(0, Math.round((formData.operatingHours || 0) / 24));
    if (selectedCount === 0) {
      newErrors.operatingHours = "Vyberte alespoň jeden den";
    }

    setErrors(newErrors);

    if (
      Object.keys(newErrors).length === 0 &&
      formData.businessType &&
      fullLocationData
    ) {
      onSubmit({
        location: locationToSubmit,
        businessType: formData.businessType,
        operatingHours: formData.operatingHours!,
        timeframe: formData.timeframe!,
        coordinates: fullLocationData.coordinates,
      });
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

  // Stable handler for OperatingDays to avoid changing reference each render
  const handleOperatingDaysChange = useCallback(
    (total: number, days: Record<string, number>) => {
      setFormData((prev) => ({ ...prev, operatingHours: total }));
      setDailyHours(days as Record<string, number>);
      // clear operatingHours validation if present
      setErrors((prev) => ({ ...prev, operatingHours: undefined }));
    },
    []
  );

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-slate-950 border border-slate-700/60 rounded-xl shadow-2xl">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-blue-100">
          Analýza lokality
        </h3>
        <p className="mt-1 text-sm text-blue-200">
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
            <FieldHelp
              title="Cílová lokalita"
              description="Zadejte přesnou adresu nebo název místa. Můžete použít vyhledávání nebo vybrat lokaci z mapy. Pro nejlepší výsledky zadejte město a ulici."
            />
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
              className={`block w-full p-2.5 pr-32 text-sm rounded-2xl border bg-slate-800 border-slate-600 placeholder-slate-500 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                errors.location
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setIsLocationPickerOpen(true)}
              disabled={isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-400 hover:text-blue-400 transition-colors disabled:opacity-50"
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
                  <div className="px-4 py-3 text-sm text-blue-200">
                    Načítání...
                  </div>
                ) : (
                  <ul className="py-2 text-sm">
                    {suggestions.map((suggestion) => (
                      <li key={`${suggestion.place_id}-${suggestion.osm_type}`}>
                        <button
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="flex flex-col items-start cursor-pointer w-full px-4 py-2 text-left hover:bg-blue-700/40 transition-colors"
                        >
                          <span className="text-sm font-medium text-blue-100">
                            {getShortLocationName(suggestion)}
                          </span>
                          <span className="text-xs text-blue-200 mt-0.5 truncate w-full">
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

        {/* Business Type */}
        <BusinessTypeSelect
          value={formData.businessType || null}
          onChange={(businessType) => updateField("businessType", businessType)}
          disabled={isLoading}
          error={errors.businessType}
        />

        {/* Operating Days */}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label
              htmlFor="operatingDays"
              className="block mb-2 text-sm font-medium text-white"
            >
              Plánované dny otevření
              <FieldHelp
                title="Plánované dny otevření"
                description="Vyberte dny, kdy bude provozovna otevřená a nastavte počet hodin pro každý den. Celkové hodiny za týden se vypočtou z vybraných dnů."
              />
              {/* <span className="ml-3 inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-xs bg-gradient-to-r from-blue-700/40 to-blue-700/20 text-blue-100 border border-blue-700/30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 text-blue-100"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 20a8 8 0 100-16 8 8 0 000 16z"
                  />
                </svg>
                <span>Plánováno</span>
              </span> */}
            </label>
            <div className="space-y-3 relative">
              {/* Keep component in DOM but visually disabled (planned feature) */}
              <div className="pointer-events-none opacity-40">
                <OperatingDays
                  disabled={true}
                  onChange={handleOperatingDaysChange}
                  error={errors.operatingHours}
                />
              </div>

              {/* Small overlay label indicating planned feature */}
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                {/* <span className="text-lg text-blue-100 bg-gradient-to-r from-blue-700/20 to-blue-700/10 px-3 py-1 rounded-full border border-blue-700/30"> */}
                Dostupné brzy...
                {/* </span> */}
              </div>

              {/* Badge moved next to the label; kept OperatingDays in DOM but non-interactive */}

              {/* Keep validation text hidden while the section is planned */}
              {/* If you want to show validation in future, remove the comment tags below */}
              {/* {errors.operatingHours && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.operatingHours}
                </p>
              )} */}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          {showCancelButton && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="cursor-pointer flex-1 px-5 py-2.5 text-sm font-medium text-white bg-slate-800 border border-blue-600/20 rounded-lg hover:bg-blue-800/10 focus:ring-2 focus:outline-none focus:ring-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Zrušit
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="group relative cursor-pointer flex-1 px-5 py-2.5 text-sm font-medium text-white rounded-full overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600/100 to-blue-800 border border-blue-600/20 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10">
              {isLoading ? loadingTexts[loadingTextIndex] : "Analyzovat"}
            </span>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-600 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent opacity-40" />
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
