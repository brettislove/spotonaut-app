export interface BusinessType {
  type: string;
  category: string;
  avgSpend: number;
  conversionRate: number;
  competitorTypes?: string[]; // Places API types for competitor search
}

// Footfall proxy types - locations that indicate foot traffic
// These are searched for ALL business types to assess location viability
export const FOOTFALL_PROXY_TYPES = [
  "subway_station",
  "train_station",
  "bus_station",
  "light_rail_station",
  "transit_station",
  "shopping_mall",
  "department_store",
  "school",
  "university",
  "hospital",
  "tourist_attraction",
  "park",
];

export const BUSINESS_TYPES: BusinessType[] = [
  {
    type: "Automat na kávu",
    category: "Automaty",
    avgSpend: 35,
    conversionRate: 0.05,
    competitorTypes: ["cafe", "coffee_shop", "bakery"],
  },
  {
    type: "Automat na snacky a nápoje",
    category: "Automaty",
    avgSpend: 40,
    conversionRate: 0.03,
    competitorTypes: ["convenience_store", "supermarket", "gas_station"],
  },
  {
    type: "Automat na květiny",
    category: "Automaty",
    avgSpend: 200,
    conversionRate: 0.01,
    competitorTypes: ["florist"],
  },
  {
    type: "Automat na drogerii",
    category: "Automaty",
    avgSpend: 80,
    conversionRate: 0.01,
    competitorTypes: ["drugstore", "pharmacy"],
  },
  {
    type: "Automat na jídlo",
    category: "Automaty",
    avgSpend: 120,
    conversionRate: 0.04,
    competitorTypes: ["restaurant", "meal_takeaway", "fast_food_restaurant"],
  },
  {
    type: "Automat na mléko / vejce",
    category: "Automaty",
    avgSpend: 60,
    conversionRate: 0.015,
    competitorTypes: ["supermarket", "grocery_store"],
  },
  {
    type: "Automat na maso / sýry / med",
    category: "Automaty",
    avgSpend: 180,
    conversionRate: 0.01,
    competitorTypes: ["supermarket", "grocery_store"],
  },
  {
    type: "Automat na fitness doplňky",
    category: "Automaty",
    avgSpend: 90,
    conversionRate: 0.02,
    competitorTypes: ["gym", "health_club", "sports_nutrition_store"],
  },
  {
    type: "Automat na elektroniku",
    category: "Automaty",
    avgSpend: 250,
    conversionRate: 0.005,
    competitorTypes: ["electronics_store"],
  },
  {
    type: "Káva s sebou",
    category: "Gastro",
    avgSpend: 70,
    conversionRate: 0.06,
    competitorTypes: ["cafe", "coffee_shop"],
  },
  {
    type: "Street food stánek",
    category: "Gastro",
    avgSpend: 120,
    conversionRate: 0.08,
    competitorTypes: ["restaurant", "meal_takeaway", "fast_food_restaurant"],
  },
  {
    type: "Pojízdný bar / káva truck",
    category: "Gastro",
    avgSpend: 90,
    conversionRate: 0.05,
    competitorTypes: ["bar", "cafe", "coffee_shop"],
  },
  {
    type: "Bistro / polévkárna",
    category: "Gastro",
    avgSpend: 140,
    conversionRate: 0.07,
    competitorTypes: ["restaurant", "meal_takeaway"],
  },
  {
    type: "Kiosk s potravinami",
    category: "Maloobchod",
    avgSpend: 90,
    conversionRate: 0.04,
    competitorTypes: ["convenience_store", "supermarket"],
  },
  {
    type: "Trafika",
    category: "Maloobchod",
    avgSpend: 60,
    conversionRate: 0.03,
    competitorTypes: ["convenience_store"],
  },
  {
    type: "Květinářství",
    category: "Maloobchod",
    avgSpend: 250,
    conversionRate: 0.02,
    competitorTypes: ["florist"],
  },
  {
    type: "Pekárna",
    category: "Maloobchod",
    avgSpend: 80,
    conversionRate: 0.05,
    competitorTypes: ["bakery"],
  },
  {
    type: "Zmrzlinový stánek",
    category: "Maloobchod",
    avgSpend: 50,
    conversionRate: 0.06,
    competitorTypes: ["ice_cream_shop"],
  },
  {
    type: "Dárkové zboží",
    category: "Maloobchod",
    avgSpend: 300,
    conversionRate: 0.01,
    competitorTypes: ["gift_shop", "souvenir_store"],
  },
  {
    type: "Kadeřnictví",
    category: "Osobní služby",
    avgSpend: 400,
    conversionRate: 0.02,
    competitorTypes: ["hair_salon", "beauty_salon"],
  },
  {
    type: "Barber shop",
    category: "Osobní služby",
    avgSpend: 450,
    conversionRate: 0.025,
    competitorTypes: ["hair_salon", "barber_shop"],
  },
  {
    type: "Nehtové studio",
    category: "Osobní služby",
    avgSpend: 500,
    conversionRate: 0.015,
    competitorTypes: ["beauty_salon", "nail_salon"],
  },
  {
    type: "Masážní studio",
    category: "Osobní služby",
    avgSpend: 600,
    conversionRate: 0.01,
    competitorTypes: ["spa"],
  },
  {
    type: "Výdejní box",
    category: "Služby",
    avgSpend: 0,
    conversionRate: 0.0,
    competitorTypes: ["post_office"],
  },
  {
    type: "Recyklační box",
    category: "Služby",
    avgSpend: 0,
    conversionRate: 0.0,
    competitorTypes: [],
  },
  {
    type: "Nabíjecí stanice",
    category: "Služby",
    avgSpend: 0,
    conversionRate: 0.0,
    competitorTypes: ["electric_vehicle_charging_station"],
  },
  {
    type: "Sdílená kola / koloběžky",
    category: "Služby",
    avgSpend: 0,
    conversionRate: 0.0,
    competitorTypes: [],
  },
  {
    type: "Automat na knihy",
    category: "Komunitní",
    avgSpend: 0,
    conversionRate: 0.0,
    competitorTypes: ["book_store", "library"],
  },
  {
    type: "Výměnný box",
    category: "Komunitní",
    avgSpend: 0,
    conversionRate: 0.0,
    competitorTypes: [],
  },
  {
    type: "Stánek s kasičkou",
    category: "Komunitní",
    avgSpend: 70,
    conversionRate: 0.02,
    competitorTypes: [],
  },
  {
    type: "Pop-up stánek",
    category: "Komunitní",
    avgSpend: 100,
    conversionRate: 0.03,
    competitorTypes: ["store"],
  },
];

// Group business types by category
export const BUSINESS_TYPES_BY_CATEGORY = BUSINESS_TYPES.reduce(
  (acc, business) => {
    if (!acc[business.category]) {
      acc[business.category] = [];
    }
    acc[business.category].push(business);
    return acc;
  },
  {} as Record<string, BusinessType[]>
);

export const CATEGORIES = Object.keys(BUSINESS_TYPES_BY_CATEGORY);
