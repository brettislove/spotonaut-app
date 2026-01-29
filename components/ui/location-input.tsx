import {
  getShortLocationName,
  handleLocationChange,
  handleSuggestionClick,
} from "@/utils/location-input";
import { useCallback, useRef, useState } from "react";
import type { LocationData, LocationSuggestion } from "@/lib/types/analysis";
import { Dialog, DialogTrigger } from "./dialog";
import { LocationPickerDialogNew } from "../location-picker-dialog-new";
import { ControllerFieldState, ControllerRenderProps } from "react-hook-form";

interface LocationInputProps {
  field: ControllerRenderProps<
    {
      location: string;
      businessType: string;
      operatingHours?: string | undefined;
    },
    "location"
  >;
  fieldState: ControllerFieldState;
  locationInput: string;
  setLocationInput: React.Dispatch<React.SetStateAction<string>>;
  fullLocationData: LocationData | null;
  setFullLocationData: React.Dispatch<
    React.SetStateAction<LocationData | null>
  >;
  errors: Partial<Record<string, string>>;
  setErrors: React.Dispatch<
    React.SetStateAction<Partial<Record<string, string>>>
  >;
}

export default function LocationInput({
  field,
  fieldState,
  locationInput,
  setLocationInput,
  setFullLocationData,
  errors,
  setErrors,
}: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);

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
        `/api/location-search?q=${encodeURIComponent(query)}`,
      );

      if (!response.ok) {
        console.error(
          "Location search API error:",
          response.status,
          response.statusText,
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

  return (
    <div className="relative">
      <input
        {...field}
        id="analysis-form-location"
        data-slots="input"
        type="text"
        aria-invalid={fieldState.invalid}
        placeholder="např. Úvoz 40, Brno"
        autoComplete="off"
        value={locationInput}
        onChange={(e) =>
          handleLocationChange(
            setLocationInput,
            setShowSuggestions,
            debounceTimer,
            fetchLocationSuggestions,
            e.target.value,
          )
        }
        className={`block w-full p-2.5 pr-32 border bg-slate-800 border-slate-600 placeholder-slate-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm
        focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
        aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive ${
          errors.location
            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
            : ""
        }`}
      />
      <Dialog
        open={isLocationPickerOpen}
        onOpenChange={setIsLocationPickerOpen}
      >
        <DialogTrigger asChild>
          <button
            type="button"
            // onClick={() => setIsLocationPickerOpen(true)}
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
        </DialogTrigger>
        <LocationPickerDialogNew
          setLocationInput={setLocationInput}
          setFullLocationData={setFullLocationData}
          setFormField={field.onChange}
          errors={errors}
          setErrors={setErrors}
          isDialogOpen={isLocationPickerOpen}
          setIsDialogOpen={setIsLocationPickerOpen}
        />
      </Dialog>
      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || isLoadingSuggestions) && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {isLoadingSuggestions ? (
            <div className="px-4 py-3 text-sm text-blue-200">Načítání...</div>
          ) : (
            <ul className="py-2 text-sm">
              {suggestions.map((suggestion) => (
                <li key={`${suggestion.place_id}-${suggestion.osm_type}`}>
                  <button
                    type="button"
                    onClick={() =>
                      handleSuggestionClick(
                        suggestion,
                        setLocationInput,
                        setFullLocationData,
                        field.onChange,
                        setShowSuggestions,
                        setSuggestions,
                        errors,
                        setErrors,
                      )
                    }
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
  );
}
