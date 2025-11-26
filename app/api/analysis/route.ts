import { NextRequest, NextResponse } from "next/server";
import { chatAgent } from "@/lib/mastra/agent";

interface AnalysisRequest {
  location: string;
  productType: "coffee" | "snacks" | "cold_drinks";
  operatingHours: number;
  avgSpend: number;
  timeframe: "day" | "week" | "month" | "year";
}

const productTypeLabels = {
  coffee: "Káva / Teplé nápoje",
  snacks: "Snacky",
  cold_drinks: "Studené nápoje",
};

const timeframeLabels = {
  day: "den",
  week: "týden",
  month: "měsíc",
  year: "rok",
};

export async function POST(request: NextRequest) {
  try {
    const data: AnalysisRequest = await request.json();

    // Validate required fields
    if (
      !data.location ||
      !data.productType ||
      !data.operatingHours ||
      !data.avgSpend ||
      !data.timeframe
    ) {
      return NextResponse.json(
        { error: "Všechna pole jsou povinná" },
        { status: 400 }
      );
    }

    // Validate ranges
    if (data.operatingHours < 1 || data.operatingHours > 168) {
      return NextResponse.json(
        { error: "Provozní hodiny musí být mezi 1-168" },
        { status: 400 }
      );
    }

    if (data.avgSpend < 1) {
      return NextResponse.json(
        { error: "Průměrná útrata musí být alespoň 1 Kč" },
        { status: 400 }
      );
    }

    console.log("Processing analysis request:", data);

    // Geocode the location
    let coordinates = null;
    try {
      const geocodeResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          data.location
        )}&limit=1`,
        {
          headers: {
            "User-Agent": "Spotonaut-App/1.0",
          },
        }
      );
      const geocodeData = await geocodeResponse.json();
      if (geocodeData && geocodeData.length > 0) {
        coordinates = {
          lat: parseFloat(geocodeData[0].lat),
          lng: parseFloat(geocodeData[0].lon),
        };
        console.log("Geocoded coordinates:", coordinates);
      }
    } catch (geocodeError) {
      console.error("Geocoding error:", geocodeError);
      // Continue without coordinates
    }

    // Create structured prompt with all data and request for structured metrics
    const structuredPrompt = `
  Proveď komplexní analýzu obchodní lokality s následujícími daty:

  **VSTUPNÍ DATA:**
  - Lokalita: ${data.location}
  - Typ produktu: ${productTypeLabels[data.productType]}
  - Provozní hodiny za týden: ${data.operatingHours} hodin
  - Průměrná útrata zákazníka: ${data.avgSpend} Kč
  - Časový rámec analýzy: ${timeframeLabels[data.timeframe]}

  **POŽADOVANÁ ANALÝZA:**
  Poskytni podrobnou analýzu zahrnující:

  1. **Přehled lokality** - krátké zhodnocení lokality a jejího potenciálu
  2. **Analýza provozu** - odhad návštěvnosti, špičkové hodiny, vzorce provozu
  3. **Projekce příjmů** - konkrétní finanční odhady pro zvolený časový rámec (${
    timeframeLabels[data.timeframe]
  })
    - Optimistický scénář
    - Realistický scénář
    - Pesimistický scénář
  4. **Cenová strategie** - doporučení ohledně cen a průměrné útraty
  5. **Analýza konkurence** - odhad počtu konkurentů, jejich vliv
  6. **Klíčová doporučení** - 3-5 konkrétních praktických doporučení

  Použij reálné české tržní podmínky a sezónní faktory. Všechna čísla formátuj česky (mezera jako oddělovač tisíců, čárka jako desetinná).
  Buď konkrétní s čísly a odhady. Struktur odpověď přehledně s nadpisy a body.

  DŮLEŽITÉ: V analýze musíš uvést následující konkrétní metriky (použij realistický scénář):
  - Denní návštěvnost (počet lidí)
  - Měsíční příjem v Kč
  - Průměrná útrata na zákazníka v Kč
  - Výpočet tržeb za zvolené období
  - Konverzní poměr v %
  - Počet konkurentů v okolí

  📊 METRIKY (POVINNÉ - na samém konci odpovědi)
    Na úplný konec své odpovědi (za všechny výše uvedené sekce) přidej JSON objekt s přesnými metrikami.
    Formát JSON:
    
    - Začni s: \`\`\`json
    - Poté objekt s těmito klíči: dailyFootTraffic, monthlyRevenue, revenuePerCustomer, periodRevenue, conversionRate, competitorCount
    - Všechny hodnoty musí být čísla (ne formátované stringy)
    - Ukonči s: \`\`\`
    
    Příklad struktury (použij své vypočtené hodnoty):
    \`\`\`json
    { "dailyRevenue": 5000, "weeklyRevenue": 35000, "monthlyRevenue": 150000, "yearlyRevenue": 1800000, "dailyFootTraffic": 800, "conversionRate": 12.5, "competitorCount": 3 }
    \`\`\`
    
    KRITICKY DŮLEŽITÉ: Tento JSON blok MUSÍ být na úplném konci, až za sekci "Klíčová doporučení". Použij realistický scénář.
`;

    const response = await chatAgent.generate(structuredPrompt);

    console.log("Analysis complete");

    // Extract metrics from JSON at the end of the response
    const text = response.text || "";
    let metrics = {
      dailyFootTraffic: "neznámé",
      monthlyRevenue: "neznámé",
      revenuePerCustomer: data.avgSpend,
      periodRevenue: "neznámé",
      conversionRate: 10,
      competitorCount: 2,
    };

    // Try to extract JSON metrics from the response
    const jsonMatch = text.match(/```json\s*({[\s\S]*?})\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsedMetrics = JSON.parse(jsonMatch[1]);
        metrics = {
          dailyFootTraffic:
            parsedMetrics.dailyFootTraffic || metrics.dailyFootTraffic,
          monthlyRevenue:
            parsedMetrics.monthlyRevenue || metrics.monthlyRevenue,
          revenuePerCustomer:
            parsedMetrics.revenuePerCustomer || metrics.revenuePerCustomer,
          periodRevenue: parsedMetrics.periodRevenue || metrics.periodRevenue,
          conversionRate:
            parsedMetrics.conversionRate || metrics.conversionRate,
          competitorCount:
            parsedMetrics.competitorCount || metrics.competitorCount,
        };
        console.log("Successfully extracted metrics from JSON:", metrics);
      } catch (error) {
        console.error("Failed to parse JSON metrics:", error);
        // Keep fallback metrics
      }
    } else {
      console.warn("No JSON metrics found in response, using fallback values");
    }

    return NextResponse.json({
      analysis: text || "Omlouváme se, nepodařilo se vygenerovat analýzu.",
      data: {
        location: data.location,
        coordinates,
        metrics,
      },
    });
  } catch (error) {
    console.error("Analysis API Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to process analysis";
    return NextResponse.json(
      {
        error: "Nepodařilo se zpracovat analýzu",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
