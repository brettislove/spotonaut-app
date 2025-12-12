export interface BusinessType {
  type: string;
  category: string;
  avgSpend: number;
  conversionRate: number;
}

export const BUSINESS_TYPES: BusinessType[] = [
  {
    type: "Automat na kávu",
    category: "Automaty",
    avgSpend: 35,
    conversionRate: 0.05,
  },
  {
    type: "Automat na snacky a nápoje",
    category: "Automaty",
    avgSpend: 40,
    conversionRate: 0.03,
  },
  {
    type: "Automat na květiny",
    category: "Automaty",
    avgSpend: 200,
    conversionRate: 0.01,
  },
  {
    type: "Automat na drogerii",
    category: "Automaty",
    avgSpend: 80,
    conversionRate: 0.01,
  },
  {
    type: "Automat na jídlo",
    category: "Automaty",
    avgSpend: 120,
    conversionRate: 0.04,
  },
  {
    type: "Automat na mléko / vejce",
    category: "Automaty",
    avgSpend: 60,
    conversionRate: 0.015,
  },
  {
    type: "Automat na maso / sýry / med",
    category: "Automaty",
    avgSpend: 180,
    conversionRate: 0.01,
  },
  {
    type: "Automat na fitness doplňky",
    category: "Automaty",
    avgSpend: 90,
    conversionRate: 0.02,
  },
  {
    type: "Automat na elektroniku",
    category: "Automaty",
    avgSpend: 250,
    conversionRate: 0.005,
  },
  {
    type: "Kavárna s sebou",
    category: "Gastro",
    avgSpend: 70,
    conversionRate: 0.06,
  },
  {
    type: "Street food stánek",
    category: "Gastro",
    avgSpend: 120,
    conversionRate: 0.08,
  },
  {
    type: "Pojízdný bar / káva truck",
    category: "Gastro",
    avgSpend: 90,
    conversionRate: 0.05,
  },
  {
    type: "Bistro / polévkárna",
    category: "Gastro",
    avgSpend: 140,
    conversionRate: 0.07,
  },
  {
    type: "Kiosk s potravinami",
    category: "Maloobchod",
    avgSpend: 90,
    conversionRate: 0.04,
  },
  {
    type: "Trafika",
    category: "Maloobchod",
    avgSpend: 60,
    conversionRate: 0.03,
  },
  {
    type: "Květinářství",
    category: "Maloobchod",
    avgSpend: 250,
    conversionRate: 0.02,
  },
  {
    type: "Pekárna",
    category: "Maloobchod",
    avgSpend: 80,
    conversionRate: 0.05,
  },
  {
    type: "Zmrzlinový stánek",
    category: "Maloobchod",
    avgSpend: 50,
    conversionRate: 0.06,
  },
  {
    type: "Dárkové zboží",
    category: "Maloobchod",
    avgSpend: 300,
    conversionRate: 0.01,
  },
  {
    type: "Kadeřnictví",
    category: "Osobní služby",
    avgSpend: 400,
    conversionRate: 0.02,
  },
  {
    type: "Barber shop",
    category: "Osobní služby",
    avgSpend: 450,
    conversionRate: 0.025,
  },
  {
    type: "Nehtové studio",
    category: "Osobní služby",
    avgSpend: 500,
    conversionRate: 0.015,
  },
  {
    type: "Masážní studio",
    category: "Osobní služby",
    avgSpend: 600,
    conversionRate: 0.01,
  },
  {
    type: "Výdejní box",
    category: "Služby",
    avgSpend: 0,
    conversionRate: 0.0,
  },
  {
    type: "Recyklační box",
    category: "Služby",
    avgSpend: 0,
    conversionRate: 0.0,
  },
  {
    type: "Nabíjecí stanice",
    category: "Služby",
    avgSpend: 0,
    conversionRate: 0.0,
  },
  {
    type: "Sdílená kola / koloběžky",
    category: "Služby",
    avgSpend: 0,
    conversionRate: 0.0,
  },
  {
    type: "Automat na knihy",
    category: "Komunitní",
    avgSpend: 0,
    conversionRate: 0.0,
  },
  {
    type: "Výměnný box",
    category: "Komunitní",
    avgSpend: 0,
    conversionRate: 0.0,
  },
  {
    type: "Stánek s kasičkou",
    category: "Komunitní",
    avgSpend: 70,
    conversionRate: 0.02,
  },
  {
    type: "Pop-up stánek",
    category: "Komunitní",
    avgSpend: 100,
    conversionRate: 0.03,
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
