/**
 * Mapping between business types and commercial property categories
 * for Sreality.cz and Bezrealitky.cz integrations
 */

export interface PropertyTypeMapping {
  sreality: {
    main: number; // category_main_cb
    sub: number; // category_sub_cb
  };
  keywords: string[];
  minSize?: number;
  maxSize?: number;
  requiresGroundFloor?: boolean;
}

/**
 * Sreality.cz category codes:
 * category_main_cb:
 * - 4 = Commercial properties (Komerční prostory)
 *
 * category_sub_cb:
 * - 35 = Restaurant/Gastro spaces (Restaurace/Gastro)
 * - 36 = Retail spaces (Obchod/Prodejna)
 * - 37 = Office spaces (Kanceláře)
 * - 38 = Storage/Warehouse (Sklady)
 * - 39 = Land (Pozemky)
 * - 40 = Other commercial (Jiné komerční)
 *
 * category_type_cb:
 * - 2 = Rent (Pronájem)
 */

export const BUSINESS_TYPE_TO_COMMERCIAL_CATEGORY: Record<
  string,
  PropertyTypeMapping
> = {
  // ==================== GASTRO CATEGORIES ====================
  "Káva s sebou": {
    sreality: { main: 4, sub: 35 },
    keywords: ["kavárna", "café", "bistro", "gastro", "restaurace"],
    minSize: 20,
    maxSize: 80,
  },
  "Street food stánek": {
    sreality: { main: 4, sub: 36 },
    keywords: ["stánek", "food", "gastro", "prodejna", "kiosk"],
    minSize: 10,
    maxSize: 40,
  },
  "Pojízdný bar / káva truck": {
    sreality: { main: 4, sub: 39 },
    keywords: ["pozemek", "parking", "stání", "plocha"],
    minSize: 15,
    maxSize: 50,
  },
  "Bistro / polévkárna": {
    sreality: { main: 4, sub: 35 },
    keywords: ["bistro", "restaurace", "gastro", "stravování"],
    minSize: 40,
    maxSize: 120,
  },

  // ==================== MALOOBCHOD (RETAIL) ====================
  "Kiosk s potravinami": {
    sreality: { main: 4, sub: 36 },
    keywords: ["kiosk", "prodejna", "retail", "obchod"],
    minSize: 15,
    maxSize: 50,
    requiresGroundFloor: true,
  },
  Trafika: {
    sreality: { main: 4, sub: 36 },
    keywords: ["trafika", "prodejna", "kiosk", "obchod"],
    minSize: 10,
    maxSize: 30,
    requiresGroundFloor: true,
  },
  Květinářství: {
    sreality: { main: 4, sub: 36 },
    keywords: ["prodejna", "retail", "obchod", "květiny"],
    minSize: 20,
    maxSize: 60,
    requiresGroundFloor: true,
  },
  Pekárna: {
    sreality: { main: 4, sub: 35 },
    keywords: ["pekárna", "prodejna", "gastro", "obchod"],
    minSize: 30,
    maxSize: 80,
  },
  "Second hand obchod": {
    sreality: { main: 4, sub: 36 },
    keywords: ["prodejna", "obchod", "retail", "bazar"],
    minSize: 40,
    maxSize: 150,
  },
  "Fruit & veg stand": {
    sreality: { main: 4, sub: 36 },
    keywords: ["stánek", "prodejna", "ovoce", "zelenina"],
    minSize: 15,
    maxSize: 50,
    requiresGroundFloor: true,
  },

  // ==================== AUTOMATY (VENDING) ====================
  "Automat na kávu": {
    sreality: { main: 4, sub: 37 },
    keywords: ["kancelář", "průchod", "vestibul", "hala", "přízemí"],
    minSize: 2,
    maxSize: 10,
    requiresGroundFloor: true,
  },
  "Automat na nápoje": {
    sreality: { main: 4, sub: 37 },
    keywords: ["kancelář", "průchod", "vestibul", "hala"],
    minSize: 2,
    maxSize: 10,
    requiresGroundFloor: true,
  },
  "Automat na svačiny": {
    sreality: { main: 4, sub: 37 },
    keywords: ["kancelář", "průchod", "vestibul", "hala"],
    minSize: 2,
    maxSize: 10,
    requiresGroundFloor: true,
  },
  "Automat na cigarety": {
    sreality: { main: 4, sub: 37 },
    keywords: ["kancelář", "průchod", "vestibul", "hala", "bar"],
    minSize: 1,
    maxSize: 5,
    requiresGroundFloor: true,
  },
  "Automat na zmrzlinu": {
    sreality: { main: 4, sub: 37 },
    keywords: ["kancelář", "průchod", "vestibul", "obchod"],
    minSize: 2,
    maxSize: 10,
    requiresGroundFloor: true,
  },
  Bankomat: {
    sreality: { main: 4, sub: 37 },
    keywords: ["vstup", "průchod", "vestibul", "přízemí"],
    minSize: 1,
    maxSize: 5,
    requiresGroundFloor: true,
  },
  "Dobíjecí stanice (elektro)": {
    sreality: { main: 4, sub: 39 },
    keywords: ["parking", "stání", "garáž", "pozemek"],
    minSize: 10,
    maxSize: 30,
  },
  "Automat na nářadí": {
    sreality: { main: 4, sub: 38 },
    keywords: ["sklad", "garáž", "dílna", "hala"],
    minSize: 5,
    maxSize: 20,
  },
  "Automat na elektroniku": {
    sreality: { main: 4, sub: 37 },
    keywords: ["kancelář", "průchod", "obchod"],
    minSize: 3,
    maxSize: 15,
  },

  // ==================== OSOBNÍ SLUŽBY (PERSONAL SERVICES) ====================
  Kadeřnictví: {
    sreality: { main: 4, sub: 37 },
    keywords: ["salon", "služby", "kadeřnictví", "kancelář"],
    minSize: 25,
    maxSize: 70,
  },
  "Barber shop": {
    sreality: { main: 4, sub: 37 },
    keywords: ["salon", "barber", "kadeřnictví", "služby"],
    minSize: 20,
    maxSize: 50,
  },
  "Nehtové studio": {
    sreality: { main: 4, sub: 37 },
    keywords: ["salon", "studio", "služby", "kosmetika"],
    minSize: 15,
    maxSize: 40,
  },
  "Masáže / wellness": {
    sreality: { main: 4, sub: 37 },
    keywords: ["wellness", "masáže", "salon", "studio"],
    minSize: 30,
    maxSize: 80,
  },

  // ==================== SLUŽBY (SERVICES) ====================
  "Prádelna / čistírna": {
    sreality: { main: 4, sub: 36 },
    keywords: ["prádelna", "čistírna", "služby", "prodejna"],
    minSize: 25,
    maxSize: 70,
  },
  "Opravna obuvi": {
    sreality: { main: 4, sub: 36 },
    keywords: ["opravna", "obuvník", "služby", "dílna"],
    minSize: 15,
    maxSize: 40,
  },
  "Opravna mobilů": {
    sreality: { main: 4, sub: 36 },
    keywords: ["opravna", "servis", "služby", "prodejna"],
    minSize: 15,
    maxSize: 40,
  },
  "Kurýrní služba / výdejní místo": {
    sreality: { main: 4, sub: 38 },
    keywords: ["sklad", "výdejní", "logistics", "kurýr"],
    minSize: 30,
    maxSize: 100,
  },

  // ==================== KOMUNITNÍ (COMMUNITY) ====================
  "Dětský koutek": {
    sreality: { main: 4, sub: 37 },
    keywords: ["herna", "dětský", "komunitní", "prostor"],
    minSize: 50,
    maxSize: 150,
  },
  "Co-working": {
    sreality: { main: 4, sub: 37 },
    keywords: ["kancelář", "coworking", "office", "prostor"],
    minSize: 80,
    maxSize: 300,
  },
  "Knihovna / čítárna": {
    sreality: { main: 4, sub: 37 },
    keywords: ["knihovna", "komunitní", "prostor", "kulturní"],
    minSize: 60,
    maxSize: 200,
  },
  "Galerie / výstavní prostor": {
    sreality: { main: 4, sub: 37 },
    keywords: ["galerie", "výstavní", "kulturní", "prostor"],
    minSize: 50,
    maxSize: 200,
  },
};

/**
 * Get relevant property filters for a given business type
 */
export function getRelevantPropertyFilters(
  businessType: string
): PropertyTypeMapping {
  const mapping = BUSINESS_TYPE_TO_COMMERCIAL_CATEGORY[businessType];

  if (!mapping) {
    // Default to general commercial/retail if business type not found
    return {
      sreality: { main: 4, sub: 36 },
      keywords: ["prodejna", "obchod", "komerční"],
      minSize: 20,
      maxSize: 100,
    };
  }

  return mapping;
}

/**
 * Filter properties by relevance to the business type
 */
export function filterPropertiesByRelevance(
  properties: Array<{
    title?: string;
    category?: string;
    size?: number;
  }>,
  businessType: string
): Array<{
  title?: string;
  category?: string;
  size?: number;
}> {
  const filters = getRelevantPropertyFilters(businessType);

  return properties.filter((property) => {
    // Size filter (if size is available)
    if (property.size && filters.minSize && filters.maxSize) {
      if (property.size < filters.minSize || property.size > filters.maxSize) {
        return false;
      }
    }

    // Ground floor requirement
    if (filters.requiresGroundFloor && property.title) {
      const text = property.title.toLowerCase();
      // Check if listing mentions ground floor or is likely ground floor
      const hasGroundFloorMention =
        text.includes("přízemí") ||
        text.includes("ground") ||
        text.includes("parter") ||
        text.includes("1. np") ||
        text.includes("street level");

      // If ground floor is required but not mentioned, be lenient for small spaces
      if (!hasGroundFloorMention && property.size && property.size > 20) {
        return false;
      }
    }

    // Keyword matching in title and category
    const searchText = `${property.title || ""} ${
      property.category || ""
    }`.toLowerCase();
    const hasRelevantKeyword = filters.keywords.some((keyword) =>
      searchText.includes(keyword.toLowerCase())
    );

    // Be more lenient - if no keywords match but size is good, still include it
    if (
      !hasRelevantKeyword &&
      property.size &&
      filters.minSize &&
      filters.maxSize
    ) {
      return (
        property.size >= filters.minSize && property.size <= filters.maxSize
      );
    }

    return hasRelevantKeyword;
  });
}

/**
 * Get business category name for display
 */
export function getBusinessCategoryName(businessType: string): string {
  const mapping = BUSINESS_TYPE_TO_COMMERCIAL_CATEGORY[businessType];
  if (!mapping) return "Komerční prostor";

  const { sub } = mapping.sreality;

  switch (sub) {
    case 35:
      return "Restaurace/Gastro";
    case 36:
      return "Obchod/Prodejna";
    case 37:
      return "Kanceláře/Služby";
    case 38:
      return "Sklady";
    case 39:
      return "Pozemky";
    case 40:
      return "Jiné komerční";
    default:
      return "Komerční prostor";
  }
}
