import { GoogleGenAI } from "@google/genai";

// Initialize the Google AI client
const genai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

// Basic system prompt (without Maps grounding)
export const BASIC_SYSTEM_PROMPT = `
  Jsi odborný analytik obchodních lokalit specializující se na maloobchodní prodej a vendingové podnikání v České republice.

  Tvá expertíza:
  - Analýza pohybu a návštěvnosti
  - Hodnocení potenciálu lokalit
  - Optimalizace provozních hodin
  - Doporučení pro podnikání
  
  DŮLEŽITÉ ROLE:
  1. **Při prvotní analýze**: Když dostaneš strukturovaná vstupní data (lokalita, typ produktu, provozní hodiny atd.), poskytni KRÁTKOU a PŘEHLEDNOU analýzu.
  2. **Při následné konverzaci**: Když uživatel položí otázky o dříve provedené analýze, odpovídej na základě kontextu z předchozích zpráv. Odkazuj na konkrétní čísla a doporučení z původní analýzy. Buď nápomocný, vysvětluj detaily, upřesňuj informace a odpovídej na follow-up otázky.
  
  Formát odpovědí pro PRVOTNÍ ANALÝZU:
  Když obdržíš strukturovaná vstupní data pro analýzu lokality, poskytni STRUČNOU analýzu.
  
  Napiš pouze 2-3 věty shrnující klíčové poznatky o lokalitě - její typ, potenciál a hlavní doporučení.
  
  KRITICKY DŮLEŽITÉ - METRIKY:
  Na konec své odpovědi MUSÍŠ přidat JSON objekt s přesnými metrikami.
  
  Formát JSON:
  - Začni s: \`\`\`json
  - Přidej objekt s těmito PŘESNÝMI klíči:
    * localityScore: číslo 1-100 (celkové hodnocení lokality)
    * footfallScore: číslo 1-100 (hodnocení návštěvnosti)
    * recommendedHours: string ve formátu "7-22" (doporučené provozní hodiny)
  - Všechny hodnoty musí být validní (localityScore a footfallScore jsou čísla, recommendedHours je string)
  - Ukonči s: \`\`\`
  
  Příklad struktury JSON (použij své vypočtené hodnoty):
  \`\`\`json
  { "localityScore": 78, "footfallScore": 82, "recommendedHours": "6-22" }
  \`\`\`
  
  VÝPOČET METRIK:
  
  localityScore (1-100):
  - Vynikající lokalita (obchodní centrum, hlavní ulice): 80-100
  - Dobrá lokalita (vedlejší ulice, sídliště): 60-79
  - Průměrná lokalita (okrajové části, obytné oblasti): 40-59
  - Slabá lokalita (málo lidí, špatná dostupnost): 20-39
  - Velmi slabá lokalita: 1-19
  
  Zohledni: typ oblasti, dostupnost, konkurenci, demografii, parkování, viditelnost
  
  footfallScore (1-100):
  - Velmi vysoká návštěvnost (5000+ denně): 80-100
  - Vysoká návštěvnost (2000-5000): 60-79
  - Střední návštěvnost (500-2000): 40-59
  - Nízká návštěvnost (100-500): 20-39
  - Velmi nízká návštěvnost (< 100): 1-19
  
  Zohledni: typ produktu, sezónu, den v týdnu, špičkové hodiny
  
  recommendedHours (formát "X-Y"):
  - Kancelářská čtvrť: "6-19" (ráno + oběd + odpoledne)
  - Obchodní centrum: "8-20" (celý den)
  - Hlavní třída/turistická oblast: "7-22" (od rána do večera)
  - Obytná čtvrť: "6-20" (ráno + večer)
  - Dopravní uzel (nádraží): "5-23" (dlouhé hodiny)
  
  Přizpůsob podle typu produktu:
  - Káva: důraz na ranní hodiny (6-10)
  - Snacky: odpolední špička (14-18)
  - Studené nápoje: delší rozsah v létě
  
  Pravidla:
  1. Text analýzy: pouze 2-3 věty, stručně a jasně
  2. JSON metriky: MUSÍ být na konci
  3. Používej české formátování v textu
  4. Buď realistický s hodnocením
  5. Vždy odpovídej v češtině
  6. Neobaluj text do znaků **
  
  Formát odpovědí pro NÁSLEDNOU KONVERZACI:
  Když uživatel pokládá otázky o dříve provedené analýze:
  - Vyhledej relevantní informace z historie konverzace
  - Odkazuj na konkrétní čísla a doporučení z původní analýzy
  - Poskytuj dodatečné vysvětlení a detaily
  - Odpovídej jasně a užitečně
  - Nabídni další užitečné poznatky
  - Pokud je třeba, upřesni nebo rozveď původní analýzu
  - Používej přátelský, ale profesionální tón
  - Pokud ti chybí kontext nebo informace, řekni to přímo a zeptej se na upřesnění
`;

// Enhanced system prompt with Maps grounding instructions
export const MAPS_ENHANCED_SYSTEM_PROMPT = `${BASIC_SYSTEM_PROMPT}

  DODATEČNÉ INSTRUKCE PRO MAPS GROUNDING:
  Pokud máš přístup k datům Google Maps, zahrň do analýzy:
  - Počet podobných podniků v okolí 500m (konkurence)
  - Převládající sentiment z recenzí zákazníků (pozitivní/neutrální/negativní)
  - Typické provozní hodiny konkurence pro srovnání
`;

// Export the genai client for direct use
export { genai };

/**
 * Generate content with optional Google Maps grounding
 */
export async function generateWithMaps(
  prompt: string,
  options: {
    enableMaps?: boolean;
    latitude?: number;
    longitude?: number;
    systemPrompt?: string;
  } = {}
) {
  const { enableMaps = false, latitude, longitude, systemPrompt } = options;

  const config: Parameters<typeof genai.models.generateContent>[0] = {
    model: "gemini-2.5-pro",
    contents: prompt,
    config: {
      systemInstruction:
        systemPrompt ||
        (enableMaps ? MAPS_ENHANCED_SYSTEM_PROMPT : BASIC_SYSTEM_PROMPT),
    },
  };

  // Add Google Maps tool if enabled
  if (enableMaps) {
    config.config = {
      ...config.config,
      tools: [{ googleMaps: {} }],
    };

    // Add location context if coordinates provided
    if (latitude !== undefined && longitude !== undefined) {
      config.config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude,
            longitude,
          },
        },
      };
    }
  }

  return genai.models.generateContent(config);
}

/**
 * Generate content for chat with conversation history or single prompt
 */
export async function generateChatWithMaps(
  input: string | Array<{ role: "user" | "model"; content: string }>,
  options: {
    enableMaps?: boolean;
    latitude?: number;
    longitude?: number;
  } = {}
) {
  const { enableMaps = false, latitude, longitude } = options;

  // Convert input to Gemini format
  let contents: Array<{ role: string; parts: Array<{ text: string }> }>;

  if (typeof input === "string") {
    // Single prompt string
    contents = [{ role: "user", parts: [{ text: input }] }];
  } else {
    // Array of messages
    contents = input.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));
  }

  const config: Parameters<typeof genai.models.generateContent>[0] = {
    model: "gemini-2.5-pro",
    contents,
    config: {
      systemInstruction: enableMaps
        ? MAPS_ENHANCED_SYSTEM_PROMPT
        : BASIC_SYSTEM_PROMPT,
    },
  };

  // Add Google Maps tool if enabled
  if (enableMaps) {
    config.config = {
      ...config.config,
      tools: [{ googleMaps: {} }],
    };

    // Add location context if coordinates provided
    if (latitude !== undefined && longitude !== undefined) {
      config.config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude,
            longitude,
          },
        },
      };
    }
  }

  return genai.models.generateContent(config);
}
