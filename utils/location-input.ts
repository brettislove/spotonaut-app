import { LocationSuggestion } from "@/lib/types/analysis";

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
  setLocationInput: React.Dispatch<React.SetStateAction<string>>,
  setFullLocationData: React.Dispatch<
    React.SetStateAction<{
      displayName: string;
      coordinates: { lat: number; lon: number };
    } | null>
  >,
  setFormData: React.Dispatch<React.SetStateAction<string>>,
  setShowSuggestions: React.Dispatch<React.SetStateAction<boolean>>,
  setSuggestions: React.Dispatch<React.SetStateAction<LocationSuggestion[]>>,
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
};

// Handle location picker selection
const handleLocationPickerSelect = (
  location: {
    address: string;
    lat: number;
    lon: number;
  },
  setLocationInput: React.Dispatch<React.SetStateAction<string>>,
  setFullLocationData: React.Dispatch<
    React.SetStateAction<{
      displayName: string;
      coordinates: { lat: number; lon: number };
    } | null>
  >,
  setFormData: React.Dispatch<React.SetStateAction<string>>,
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
};

const handleConfirmLocation = async (
  setIsLoadingAddress: React.Dispatch<React.SetStateAction<boolean>>,
  currentCenter: [number, number],
  setLocationInput: React.Dispatch<React.SetStateAction<string>>,
  setFullLocationData: React.Dispatch<
    React.SetStateAction<{
      displayName: string;
      coordinates: { lat: number; lon: number };
    } | null>
  >,
  setFormField: React.Dispatch<React.SetStateAction<string>>,
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
      );
    }
  } catch (error) {
    console.error("Error fetching address:", error);
  } finally {
    setIsLoadingAddress(false);
  }
};

export {
  getShortLocationName,
  handleConfirmLocation,
  handleLocationChange,
  handleLocationPickerSelect,
  handleSuggestionClick,
};
