import type { BusinessType } from "@/lib/constants/business-types";
import { FOOTFALL_PROXY_TYPES } from "@/lib/constants/business-types";
import { genai, BASIC_SYSTEM_PROMPT } from "./client";
import {
  extractGroundingSources,
  hasGroundingMetadata,
  type GroundingSource,
} from "./usage";
import {
  searchPlacesWithCache,
  logPlacesApiError,
  calculateDistance,
  type PlacesSearchResult,
} from "@/lib/google-maps/places";
import { PrismaClient } from "@prisma/client";

export type GroundingStatus = "not_used" | "used" | "insufficient" | "failed";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GroundedCompetitor {
  name: string;
  category?: string | null;
  distanceMeters?: number | null;
  rating?: number | null;
  userRatingsTotal?: number | null;
  priceLevel?: number | null;
  mapsUrl?: string | null;
  openingHours?: string | null;
  coordinates?: Coordinates | null;
  address?: string | null;
}

export interface GroundedFootfallProxy {
  type: "transit" | "shopping" | "office" | "residential" | "other";
  description: string;
  distanceMeters?: number;
  coordinates?: Coordinates | null;
}

export interface GroundedRealEstateListing {
  id: string;
  source: "sreality" | "bezrealitky";
  title: string;
  price: number;
  pricePerSqm?: number;
  currency: string;
  transactionType: "rent" | "sale";
  coordinates?: Coordinates;
  address: string;
  locality?: string;
  category: string;
  size?: number;
  url: string;
  images?: string[];
  labels?: string[];
  distanceMeters?: number;
}

export interface GroundedLocationData {
  /**
   * Original user-entered location query (e.g. address or place name)
   */
  locationQuery: string;
  /**
   * Resolved human-readable address/name of the primary place
   */
  resolvedAddress?: string | null;
  coordinates?: Coordinates | null;
  primaryPlaceId?: string | null;
  primaryMapsUrl?: string | null;
  categories?: string[] | null;

  competitors: GroundedCompetitor[];
  footfallProxies: GroundedFootfallProxy[];
  availableProperties?: GroundedRealEstateListing[];

  averageRating?: number | null;
  reviewSentiment?: "positive" | "mixed" | "negative" | "unknown";

  notes?: string | null;
  groundingStatus: GroundingStatus;
}

export interface BusinessAnalysisMetrics {
  localityScore: number;
  footfallScore: number;
  recommendedHours: string;
}

export interface HybridAnalysisResult {
  analysisText: string;
  metrics: BusinessAnalysisMetrics;
  groundedLocation: GroundedLocationData;
  usedMapsGrounding: boolean;
  sources: GroundingSource[];
}

const FLASH_PLACES_ANALYSIS_PROMPT = `
Jsi asistent pro analýzu dat z Google Places API.

TVŮJ ÚKOL:
- Dostaneš strukturovaná data z Google Places API o konkurenci a bodech návštěvnosti v lokalitě.
- ANALYZUJ tato data a vrať strukturovaný výstup ve formátu JSON.
- NEPROVÁDÍŠ obchodní analýzu – pouze kategorizuješ a sumarizuješ získaná data.

VÝSTUP:
- Vrať POUZE JEDEN JSON OBJEKT ve formátu níže.
- Bez vysvětlujícího textu okolo, žádné další věty.

PŘESNÁ STRUKTURA JSON:
\`\`\`json
{
  "locationQuery": string,
  "resolvedAddress": string | null,
  "coordinates": {
    "lat": number,
    "lng": number
  } | null,
  "primaryPlaceId": string | null,
  "primaryMapsUrl": string | null,
  "categories": string[] | null,
  "competitors": [
    {
      "name": string,
      "category": string | null,
      "distanceMeters": number | null,
      "coordinates": {
        "lat": number,
        "lng": number
      } | null,
      "address": string | null
    }
  ],
  "footfallProxies": [
    {
      "type": "transit" | "shopping" | "office" | "residential" | "other",
      "description": string,
      "distanceMeters": number | null,
      "coordinates": {
        "lat": number,
        "lng": number
      } | null
    }
  ],
  "notes": string | null,
  "groundingStatus": "used" | "insufficient"
}
\`\`\`

POZNÁMKY:
- "competitors" = konkurenční podniky v okolí, seřaď je podle vzdálenosti.
- "footfallProxies" = místa naznačující návštěvnost (zastávky, obchodní centra, školy...).
- Pro každý competitor/proxy, pokud máš GPS souřadnice, zahrň je.
- "averageRating" = průměrný rating z nalezených konkurentů (pokud mají ratings).
- "groundingStatus" nastav na "used" pokud máš smysluplná data, jinak "insufficient".
`;

const FLASH_GROUNDING_SYSTEM_PROMPT = `
Jsi asistent pro získávání dat z Google Maps.

TVŮJ ÚKOL:
- Pomocí nástrojů Google Maps zjisti co nejpřesnější fakta o dané lokalitě.
- NEPROVÁDÍŠ obchodní analýzu, pouze sbíráš DATA.
- Pokud si nejsi jistý, nech pole raději null/undefined – NEHÁDEJ.

KRITICKY DŮLEŽITÉ - SOUŘADNICE:
- Dostaneš PŘESNÉ GPS souřadnice (latitude, longitude) v toolConfig.
- Tyto souřadnice jsou DŮVĚRYHODNÉ a FINÁLNÍ - byly již správně geokódovány.
- NIKDY NESMÍŠ SÁM GEOKÓDOVAT lokalitu nebo měnit poskytnuté souřadnice!
- Použij poskytnuté souřadnice jako střed vyhledávání pro Google Maps nástroje.
- Pokud najdeš místo na Google Maps, NEMĚŇ souřadnice - ponech je tak jak byly poskytnuty.

VÝSTUP:
- Vrať POUZE JEDEN JSON OBJEKT ve formátu níže.
- Bez vysvětlujícího textu okolo, žádné další věty.

PŘESNÁ STRUKTURA JSON:
\`\`\`json
{
  "locationQuery": string,
  "resolvedAddress": string | null,
  "coordinates": {
    "lat": number,
    "lng": number
  } | null,
  "primaryPlaceId": string | null,
  "primaryMapsUrl": string | null,
  "categories": string[] | null,
  "competitors": [
    {
      "name": string,
      "category": string | null,
      "distanceMeters": number | null,
      "rating": number | null,
      "userRatingsTotal": number | null,
      "priceLevel": number | null,
      "mapsUrl": string | null,
      "openingHours": string | null,
      "coordinates": {
        "lat": number,
        "lng": number
      } | null,
      "address": string | null
    }
  ],
  "footfallProxies": [
    {
      "type": "transit" | "shopping" | "office" | "residential" | "other",
      "description": string,
      "distanceMeters": number | null,
      "coordinates": {
        "lat": number,
        "lng": number
      } | null
    }
  ],
  "averageRating": number | null,
  "reviewSentiment": "positive" | "mixed" | "negative" | "unknown",
  "notes": string | null,
  "groundingStatus": "used" | "insufficient" | "failed"
}
\`\`\`

POZNÁMKY:
- "competitors" = podobné podniky v okruhu cca 500 m.
- "footfallProxies" = místa naznačující návštěvnost (zastávky, obchodní centra, školy, kanceláře…).
- "groundingStatus" nastav na "used", pokud se ti podařilo získat smysluplná data z Google Maps,
  jinak "insufficient" nebo "failed".
- COORDINATES v JSON VRAŤ TAK, JAK BYLY POSKYTNUTY V toolConfig - NEMĚŇ JE!
`;

const HYBRID_PRO_SYSTEM_PROMPT = `
${BASIC_SYSTEM_PROMPT}

DODATEČNÉ INSTRUKCE PRO PRÁCI S DATY Z GOOGLE MAPS:
- Dostaneš strukturovaný objekt "locationData" z předchozího kroku, který vychází z Google Maps.
- TATO DATA považuj za hlavní zdroj pravdy o konkrétní lokalitě (adresa, konkurence, typ místa, ratingy…).
- NEVYMÝŠLEJ si konkrétní geografická fakta, která nejsou v těchto datech zřejmá.
- Pokud využiješ obecnou znalost (např. typické chování zákazníků v obchodních centrech),
  jasně ji označ jako obecný předpoklad, ne jako fakt o konkrétní lokalitě.
- Pokud jsou data neúplná nebo nekonzistentní, výslovně na to upozorni v analýze.
`;

function safelyParseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function extractJsonBlock(raw: string): string | null {
  if (!raw) return null;
  const match = raw.match(/```json\s*([\s\S]*?)```/i);
  if (match && match[1]) {
    return match[1];
  }
  // Fallback: try to find first { ... } block
  const braceIndex = raw.indexOf("{");
  if (braceIndex === -1) return null;
  const lastBraceIndex = raw.lastIndexOf("}");
  if (lastBraceIndex === -1 || lastBraceIndex <= braceIndex) return null;
  return raw.slice(braceIndex, lastBraceIndex + 1);
}

function extractMetricsFromText(text: string): BusinessAnalysisMetrics {
  const fallback: BusinessAnalysisMetrics = {
    localityScore: 50,
    footfallScore: 50,
    recommendedHours: "8-20",
  };

  const jsonBlock = extractJsonBlock(text);
  if (!jsonBlock) {
    return fallback;
  }

  const parsed = safelyParseJson<Partial<BusinessAnalysisMetrics>>(jsonBlock);
  if (!parsed) {
    return fallback;
  }

  return {
    localityScore:
      typeof parsed.localityScore === "number"
        ? parsed.localityScore
        : fallback.localityScore,
    footfallScore:
      typeof parsed.footfallScore === "number"
        ? parsed.footfallScore
        : fallback.footfallScore,
    recommendedHours:
      typeof parsed.recommendedHours === "string"
        ? parsed.recommendedHours
        : fallback.recommendedHours,
  };
}

interface FlashGroundingParams {
  location: string;
  businessType: BusinessType;
  coordinates?: Coordinates | null;
  prisma?: PrismaClient;
}

export async function getGroundedLocationDataWithFlash(
  params: FlashGroundingParams,
): Promise<{
  groundedLocation: GroundedLocationData;
  usedMapsGrounding: boolean;
  sources: GroundingSource[];
}> {
  const { location, businessType, coordinates, prisma } = params;

  // Try Places API first if we have coordinates and Prisma client
  if (coordinates && prisma) {
    try {
      console.log("Attempting Places API search for:", businessType.type);

      const competitorTypes = businessType.competitorTypes || [];
      const footfallProxyTypes = FOOTFALL_PROXY_TYPES;

      // Search Places API with caching
      const placesResult: PlacesSearchResult = await searchPlacesWithCache(
        prisma,
        coordinates.lat,
        coordinates.lng,
        businessType.type,
        competitorTypes,
        footfallProxyTypes,
      );

      console.log("Places API search successful:", {
        competitors: placesResult.competitors.length,
        footfallProxies: placesResult.footfallProxies.length,
        usedCache: placesResult.usedCache,
        ids: placesResult.competitors.map((c) => c.id),
      });

      // Convert Places API results to prompt for Gemini Flash analysis
      const placesDataForAnalysis = {
        competitors: placesResult.competitors.map((place) => ({
          id: place.id,
          name: place.displayName,
          address: place.formattedAddress,
          location: place.location,
          types: place.types,
          distanceMeters: calculateDistance(
            coordinates.lat,
            coordinates.lng,
            place.location.latitude,
            place.location.longitude,
          ),
        })),
        footfallProxies: placesResult.footfallProxies.map((place) => ({
          id: place.id,
          name: place.displayName,
          types: place.types,
          location: place.location,
          distanceMeters: calculateDistance(
            coordinates.lat,
            coordinates.lng,
            place.location.latitude,
            place.location.longitude,
          ),
        })),
      };

      // Ask Gemini Flash to analyze the Places data
      const analysisPrompt = `
LOKALITA: "${location}"
TYP PODNIKÁNÍ: ${businessType.type} (kategorie: ${businessType.category})
SOUŘADNICE: lat=${coordinates.lat}, lng=${coordinates.lng}

DATA Z GOOGLE PLACES API:

**KONKURENCE (${placesDataForAnalysis.competitors.length} míst):**
${JSON.stringify(placesDataForAnalysis.competitors, null, 2)}

**BODY NÁVŠTĚVNOSTI (${placesDataForAnalysis.footfallProxies.length} míst):**
${JSON.stringify(placesDataForAnalysis.footfallProxies, null, 2)}

Analyzuj tato data a vrať JSON objekt podle zadaného schématu.
Zaměř se na:
- Kategorizaci konkurentů podle typu a vzdálenosti
- Identifikaci bodů návštěvnosti (transit, shopping, office, atd.)
- Celkový sentiment na základě ratingů
- Průměrný rating konkurence
`;

      const response = await genai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: analysisPrompt }],
          },
        ],
        config: {
          systemInstruction: FLASH_PLACES_ANALYSIS_PROMPT,
        },
      });

      const rawText = response.text || "";
      const jsonBlock = extractJsonBlock(rawText);
      const parsed =
        jsonBlock && safelyParseJson<GroundedLocationData>(jsonBlock);

      console.log("Flash analysis of Places data complete");

      if (parsed) {
        const groundedLocation: GroundedLocationData = {
          locationQuery: parsed.locationQuery || location,
          resolvedAddress: parsed.resolvedAddress,
          coordinates: coordinates,
          primaryPlaceId: parsed.primaryPlaceId,
          primaryMapsUrl: parsed.primaryMapsUrl,
          categories: parsed.categories,
          competitors: parsed.competitors,
          footfallProxies: parsed.footfallProxies,
          averageRating: parsed.averageRating,
          reviewSentiment: parsed.reviewSentiment,
          notes: parsed.notes,
          groundingStatus: parsed.groundingStatus || "used",
        };

        // Create sources from Places API results with proper Google Maps URLs
        const sources: GroundingSource[] = placesResult.competitors
          .slice(0, 5)
          .map((place) => ({
            placeId: place.id,
            title: place.displayName,
            // Use Google Maps URL scheme with place ID for accurate location
            // Format: https://www.google.com/maps/search/?api=1&query=NAME&query_place_id=PLACE_ID
            uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              place.displayName,
            )}&query_place_id=${place.id}`,
          }));

        return {
          groundedLocation,
          usedMapsGrounding: true,
          sources,
        };
      }

      // If parsing failed, continue to fallback
      console.warn(
        "Failed to parse Flash analysis, falling back to Gemini grounding",
      );
    } catch (error) {
      console.error("Places API search failed:", error);

      // Log the error for monitoring
      if (prisma) {
        await logPlacesApiError(
          prisma,
          coordinates.lat,
          coordinates.lng,
          businessType.type,
          error instanceof Error ? error.message : "Unknown error",
          error instanceof Error && "status" in error
            ? String(error.status)
            : undefined,
        );
      }

      console.log("Falling back to Gemini grounding with Google Maps tools");
      // Continue to fallback below
    }
  }

  // Fallback: Use Gemini's built-in Google Maps grounding (original behavior)
  console.log("Using Gemini grounding fallback for:", businessType.type);

  const userPrompt = coordinates
    ? `
PŘESNÉ GPS SOUŘADNICE (již geokódovány): lat=${coordinates.lat}, lng=${coordinates.lng}
Adresa/lokalita: "${location}"
Typ podnikání: ${businessType.type} (kategorie: ${businessType.category})

DŮLEŽITÉ: Souřadnice jsou FINÁLNÍ a SPRÁVNÉ. Negeokóduj znovu lokalitu!
Použij poskytnuté GPS souřadnice jako střed pro vyhledávání na Google Maps.
Najdi konkurenci, body návštěvnosti a další data OKOLO těchto souřadnic.

Vrať POUZE JSON objekt podle zadaného schématu.
`
    : `
Lokalita k analýze: "${location}"
Typ podnikání: ${businessType.type} (kategorie: ${businessType.category})

Použij nástroje Google Maps k získání co nejpřesnějších dat o okolí této lokality
v České republice a vrať POUZE JSON objekt podle zadaného schématu.
`;

  const config: Parameters<typeof genai.models.generateContent>[0] = {
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: userPrompt }],
      },
    ],
    config: {
      systemInstruction: FLASH_GROUNDING_SYSTEM_PROMPT,
      tools: [{ googleMaps: {} }],
    },
  };

  if (coordinates) {
    config.config = {
      ...config.config,
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude: coordinates.lat,
            longitude: coordinates.lng,
          },
        },
      },
    };
  }

  const response = await genai.models.generateContent(config);
  const rawText = response.text || "";

  const jsonBlock = extractJsonBlock(rawText);
  const parsed = jsonBlock && safelyParseJson<GroundedLocationData>(jsonBlock);

  console.log(
    "Gemini grounding fallback response:",
    parsed ? "success" : "failed",
  );

  const usedMaps = hasGroundingMetadata(response);
  const sources = extractGroundingSources(response);

  const groundedLocation: GroundedLocationData = parsed
    ? {
        locationQuery: parsed.locationQuery || location,
        resolvedAddress: parsed.resolvedAddress,
        coordinates: coordinates || parsed.coordinates || undefined,
        primaryPlaceId: parsed.primaryPlaceId,
        primaryMapsUrl: parsed.primaryMapsUrl,
        categories: parsed.categories,
        competitors: parsed.competitors,
        footfallProxies: parsed.footfallProxies,
        averageRating: parsed.averageRating,
        reviewSentiment: parsed.reviewSentiment,
        notes: parsed.notes,
        groundingStatus:
          parsed.groundingStatus || (usedMaps ? "used" : "insufficient"),
      }
    : {
        locationQuery: location,
        resolvedAddress: null,
        coordinates: coordinates || undefined,
        primaryPlaceId: null,
        primaryMapsUrl: null,
        categories: null,
        competitors: [],
        footfallProxies: [],
        averageRating: null,
        reviewSentiment: "unknown",
        notes: null,
        groundingStatus: usedMaps ? "insufficient" : "failed",
      };

  return {
    groundedLocation,
    usedMapsGrounding: usedMaps,
    sources,
  };
}

interface ProAnalysisParams {
  location: string;
  businessType: BusinessType;
  groundedLocation: GroundedLocationData;
}

export async function generateProAnalysisWithGrounding(
  params: ProAnalysisParams,
): Promise<{ text: string; metrics: BusinessAnalysisMetrics }> {
  const { location, businessType, groundedLocation } = params;

  const structuredPrompt = `
Proveď STRUČNOU analýzu obchodní lokality s následujícími daty:

**VSTUPNÍ DATA:**
- Lokalita (původní zadání): ${location}
- Typ podnikání: ${businessType.type}
- Kategorie: ${businessType.category}
- Průměrná útrata zákazníka: ${businessType.avgSpend} Kč
- Konverzní poměr: ${(businessType.conversionRate * 100).toFixed(1)}%

**DODATEČNÁ STRUKTUROVANÁ DATA Z GOOGLE MAPS (locationData):**
${JSON.stringify(groundedLocation, null, 2)}

Tato data považuj za hlavní zdroj pravdy o konkrétní lokalitě.

**POŽADOVANÁ ANALÝZA:**
Napiš pouze 2-3 věty shrnující klíčové poznatky o této lokalitě - její typ,
potenciál a hlavní doporučení. V analýze jasně rozlišuj:
- co vyplývá přímo z locationData (fakta z Google Maps)
- co je obecný předpoklad nebo odhad.

📊 METRIKY (POVINNÉ - na samém konci odpovědi)
Na konec své odpovědi přidej JSON objekt s přesnými metrikami.
Formát JSON:
- localityScore: číslo 1-100 (celkové hodnocení lokality)
- footfallScore: číslo 1-100 (hodnocení návštěvnosti)
- recommendedHours: string ve formátu "7-22" (doporučené provozní hodiny)
`;

  const proResponse = await genai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: structuredPrompt,
    config: {
      systemInstruction: HYBRID_PRO_SYSTEM_PROMPT,
    },
  });

  const text = proResponse.text || "";
  const metrics = extractMetricsFromText(text);

  // Remove the JSON block from the text after extracting metrics
  const jsonBlock = extractJsonBlock(text);
  const cleanText = jsonBlock
    ? text.replace(/```json\s*[\s\S]*?```/i, "").trim()
    : text;

  return { text: cleanText, metrics };
}

/**
 * Generate Pro analysis with streaming support
 * Returns an async generator that yields text chunks and final metrics
 */
export async function* generateProAnalysisWithGroundingStream(
  params: ProAnalysisParams,
): AsyncGenerator<
  | { type: "chunk"; text: string }
  | { type: "done"; text: string; metrics: BusinessAnalysisMetrics },
  void,
  unknown
> {
  const { location, businessType, groundedLocation } = params;

  const structuredPrompt = `
Proveď STRUČNOU analýzu obchodní lokality s následujícími daty:

**VSTUPNÍ DATA:**
- Lokalita (původní zadání): ${location}
- Typ podnikání: ${businessType.type}
- Kategorie: ${businessType.category}
- Průměrná útrata zákazníka: ${businessType.avgSpend} Kč
- Konverzní poměr: ${(businessType.conversionRate * 100).toFixed(1)}%

**DODATEČNÁ STRUKTUROVANÁ DATA Z GOOGLE MAPS (locationData):**
${JSON.stringify(groundedLocation, null, 2)}

Tato data považuj za hlavní zdroj pravdy o konkrétní lokalitě.

**POŽADOVANÁ ANALÝZA:**
Napiš pouze 2-3 věty shrnující klíčové poznatky o této lokalitě - její typ,
potenciál a hlavní doporučení. V analýze jasně rozlišuj:
- co vyplývá přímo z locationData (fakta z Google Maps)
- co je obecný předpoklad nebo odhad.

📊 METRIKY (POVINNÉ - na samém konci odpovědi)
Na konec své odpovědi přidej JSON objekt s přesnými metrikami.
Formát JSON:
- localityScore: číslo 1-100 (celkové hodnocení lokality)
- footfallScore: číslo 1-100 (hodnocení návštěvnosti)
- recommendedHours: string ve formátu "7-22" (doporučené provozní hodiny)
`;

  const stream = await genai.models.generateContentStream({
    model: "gemini-2.5-pro",
    contents: structuredPrompt,
    config: {
      systemInstruction: HYBRID_PRO_SYSTEM_PROMPT,
    },
  });

  let fullText = "";
  for await (const chunk of stream) {
    const chunkText = chunk.text || "";
    if (chunkText) {
      fullText += chunkText;
      yield { type: "chunk" as const, text: chunkText };
    }
  }

  const metrics = extractMetricsFromText(fullText);

  // Remove the JSON block from the text after extracting metrics
  const jsonBlock = extractJsonBlock(fullText);
  const cleanText = jsonBlock
    ? fullText.replace(/```json\s*[\s\S]*?```/i, "").trim()
    : fullText;

  yield { type: "done" as const, text: cleanText, metrics };
}

interface ProChatParams {
  messages: Array<{ role: string; content: string }>;
  groundedLocation: GroundedLocationData;
}

function extractSuggestionsFromText(text: string): {
  cleanText: string;
  suggestions: string[];
} {
  // Try to extract JSON suggestions block from the text
  const suggestionsMatch = text.match(/```suggestions\s*([\s\S]*?)```/i);

  if (suggestionsMatch && suggestionsMatch[1]) {
    try {
      const suggestions = JSON.parse(suggestionsMatch[1].trim());
      if (Array.isArray(suggestions)) {
        const cleanText = text
          .replace(/```suggestions\s*[\s\S]*?```/i, "")
          .trim();
        return { cleanText, suggestions };
      }
    } catch {
      // JSON parsing failed, return original text
    }
  }

  return { cleanText: text, suggestions: [] };
}

export async function generateProChatWithGrounding(
  params: ProChatParams,
): Promise<{ text: string; suggestions: string[] }> {
  const { messages, groundedLocation } = params;

  // Build conversation context
  const conversationContext = messages
    .slice(0, -1) // All messages except the last one
    .map(
      (msg) =>
        `${msg.role === "user" ? "Uživatel" : "Asistent"}: ${msg.content}`,
    )
    .join("\n\n");

  const lastMessage = messages[messages.length - 1];
  const currentQuery = lastMessage.content;

  const structuredPrompt = `
KONTEXT KONVERZACE:
${conversationContext || "(žádný předchozí kontext)"}

AKTUÁLNÍ DOTAZ:
${currentQuery}

**DODATEČNÁ STRUKTUROVANÁ DATA Z GOOGLE MAPS (locationData):**
${JSON.stringify(groundedLocation, null, 2)}

Tato data považuj za hlavní zdroj pravdy o konkrétní lokalitě. NEVYMÝŠLEJ si konkrétní geografická fakta, která nejsou v těchto datech zřejmá.

Odpověz na aktuální dotaz s ohledem na předchozí konverzaci. Pokud se dotaz týká dříve provedené analýzy, odkazuj na konkrétní data a doporučení z té analýzy. Pokud se dotaz týká konkrétní lokality nebo míst v okolí, použij výhradně data z locationData výše. Pokud data nejsou k dispozici, jasně to uveď.

📝 NÁVRHY NA DALŠÍ OTÁZKY (POVINNÉ - na samém konci odpovědi)
Na konec své odpovědi MUSÍŠ přidat JSON pole s 2-3 návrhy na další otázky, které by uživatel mohl položit.
Návrhy by měly být:
- Relevantní k právě probírané lokalitě/analýze
- Krátké a konkrétní (max 50 znaků)
- V češtině
- Formulované jako otázky nebo požadavky

Formát:
\`\`\`suggestions
["Jaká je konkurence v okolí?", "Doporučené provozní hodiny?", "Jak optimalizovat prodeje?"]
\`\`\`
`;

  const proResponse = await genai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: structuredPrompt,
    config: {
      systemInstruction: HYBRID_PRO_SYSTEM_PROMPT,
    },
  });

  const rawText = proResponse.text || "";
  const { cleanText, suggestions } = extractSuggestionsFromText(rawText);

  return { text: cleanText, suggestions };
}

interface OrchestratorParams {
  location: string;
  businessType: BusinessType;
  coordinates?: Coordinates | null;
  useMapsGrounding: boolean;
}

export async function analyzeLocationBusinessPotential(
  params: OrchestratorParams,
): Promise<HybridAnalysisResult> {
  const { location, businessType, coordinates, useMapsGrounding } = params;

  let groundedLocation: GroundedLocationData;
  let usedMapsGrounding = false;
  let sources: GroundingSource[] = [];

  if (useMapsGrounding && coordinates) {
    try {
      const flashResult = await getGroundedLocationDataWithFlash({
        location,
        businessType,
        coordinates,
      });
      groundedLocation = flashResult.groundedLocation;
      usedMapsGrounding = flashResult.usedMapsGrounding;
      sources = flashResult.sources;
    } catch {
      groundedLocation = {
        locationQuery: location,
        resolvedAddress: null,
        coordinates: coordinates || undefined,
        primaryPlaceId: null,
        primaryMapsUrl: null,
        categories: null,
        competitors: [],
        footfallProxies: [],
        averageRating: null,
        reviewSentiment: "unknown",
        notes: null,
        groundingStatus: "failed",
      };
      usedMapsGrounding = false;
      sources = [];
    }
  } else {
    groundedLocation = {
      locationQuery: location,
      resolvedAddress: null,
      coordinates: coordinates || undefined,
      primaryPlaceId: null,
      primaryMapsUrl: null,
      categories: null,
      competitors: [],
      footfallProxies: [],
      averageRating: null,
      reviewSentiment: "unknown",
      notes: null,
      groundingStatus: "not_used",
    };
  }

  const { text, metrics } = await generateProAnalysisWithGrounding({
    location,
    businessType,
    groundedLocation,
  });

  const analysisText =
    text || "Omlouváme se, nepodařilo se vygenerovat analýzu.";

  return {
    analysisText,
    metrics,
    groundedLocation,
    usedMapsGrounding,
    sources,
  };
}
