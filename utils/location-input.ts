import { LocationSuggestion } from "@/lib/types/analysis";
import type L from "leaflet";
import "leaflet/dist/leaflet.css";

// Handle location input change with debounce
const handleLocationChange = (
  setLocationInput: React.Dispatch<React.SetStateAction<string>>,
  setShowSuggestions: React.Dispatch<React.SetStateAction<boolean>>,
  debounceTimer: React.RefObject<NodeJS.Timeout | undefined>,
  fetchLocationSuggestions: (value: string) => void,
  value: string,
) => {
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

// Format location name for display - shorter version
// #TODO: Expand for international addresses
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
          /^[A-ZŠČŘŽÝÁÍÉÚŮ][a-zščřžýáíéúů]+(?: [A-ZŠČŘŽÝÁÍÉÚŮ][a-zščřžýáíéúů]+)*$/,
        ) &&
          !p.includes("Česko") &&
          !p.includes("Čechy") &&
          !p.match(/^\d/)), // Not a postal code
    ) || "";

  if (street && city) {
    return `${street}, ${city}`;
  }

  return street || parts[0] || suggestion.display_name;
};

// Handle suggestion selection
const handleSuggestionClick = (
  suggestion: LocationSuggestion,
  setLocationInput,
  setFullLocationData,
  setFormData,
  setShowSuggestions,
  setSuggestions,
  errors,
  setErrors,
) => {
  const shortName = getShortLocationName(suggestion);
  setLocationInput(shortName);
  setFullLocationData({
    displayName: suggestion.display_name,
    coordinates: {
      lat: parseFloat(suggestion.lat),
      lon: parseFloat(suggestion.lon),
    },
  });
  setFormData(suggestion.display_name);
  setShowSuggestions(false);
  setSuggestions([]);
  // Clear error when valid location is selected
  if (errors.location) {
    setErrors((prev) => ({ ...prev, location: undefined }));
  }
};

// Handle location picker selection
const handleLocationPickerSelect = (
  location: {
    address: string;
    lat: number;
    lon: number;
  },
  setLocationInput,
  setFullLocationData,
  setFormData,
  errors,
  setErrors,
) => {
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
  setFormData(location.address);
  // Clear error when valid location is selected
  if (errors.location) {
    setErrors((prev) => ({ ...prev, location: undefined }));
  }
};

const handleConfirmLocation = async (
  setIsLoadingAddress,
  currentCenter,
  setLocationInput,
  setFullLocationData,
  setFormField,
  errors,
  setErrors,
) => {
  setIsLoadingAddress(true);
  try {
    // Reverse geocode to get address
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentCenter[0]}&lon=${currentCenter[1]}&addressdetails=1`,
      {
        headers: {
          "User-Agent": "SpotonAutApp/1.0",
        },
      },
    );

    if (response.ok) {
      const data = await response.json();
      handleLocationPickerSelect(
        {
          address: data.display_name,
          lat: currentCenter[0],
          lon: currentCenter[1],
        },
        setLocationInput,
        setFullLocationData,
        setFormField,
        errors,
        setErrors,
      );
    }
  } catch (error) {
    console.error("Error fetching address:", error);
  } finally {
    setIsLoadingAddress(false);
  }
};

// Dynamically import Leaflet only on client side
const initMap = async (
  mapContainerRef,
  mapRef,
  currentCenter,
  setCurrentCenter,
) => {
  // Wait for Dialog animation to complete and DOM to be ready
  await new Promise((resolve) => setTimeout(resolve, 50));

  if (!mapContainerRef.current) return;

  const L = (await import("leaflet")).default;

  // Initialize map only if not already initialized
  if (!mapRef.current && mapContainerRef.current) {
    const map = L.map(mapContainerRef.current, {
      center: currentCenter,
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: true,
      dragging: true,
      touchZoom: true,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      },
    ).addTo(map);

    mapRef.current = map;

    // Update center when map is moved
    map.on("moveend", () => {
      const center = map.getCenter();
      setCurrentCenter([center.lat, center.lng]);
    });
  }
};

export {
  getShortLocationName,
  handleConfirmLocation,
  handleLocationChange,
  handleLocationPickerSelect,
  handleSuggestionClick,
  initMap,
};
