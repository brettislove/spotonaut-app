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
- Denní příjem v Kč
- Týdenní příjem v Kč
- Měsíční příjem v Kč
- Roční příjem v Kč
- Denní návštěvnost (počet lidí)
- Konverzní poměr v %
- Počet konkurentů v okolí
`;

    const response = await chatAgent.generate(structuredPrompt);

    console.log("Analysis complete");

    // Extract metrics from the text response using regex patterns
    const text = response.text || "";

    // Helper function to extract number from Czech formatted text
    const extractNumber = (pattern: RegExp): number => {
      const match = text.match(pattern);
      if (match && match[1]) {
        // Remove spaces and replace comma with dot for parsing
        const cleanNumber = match[1].replace(/\s/g, "").replace(",", ".");
        return parseFloat(cleanNumber) || 0;
      }
      return 0;
    };

    // Extract metrics with various patterns
    const metrics = {
      dailyRevenue:
        extractNumber(/Denně:\s*([0-9\s,]+)\s*Kč/i) ||
        extractNumber(/denní příjem[:\s]*([0-9\s,]+)\s*Kč/i) ||
        data.avgSpend * 100, // Fallback estimate
      weeklyRevenue:
        extractNumber(/Týdně:\s*([0-9\s,]+)\s*Kč/i) ||
        extractNumber(/týdenní příjem[:\s]*([0-9\s,]+)\s*Kč/i) ||
        data.avgSpend * 700,
      monthlyRevenue:
        extractNumber(/Měsíčně:\s*([0-9\s,]+)\s*Kč/i) ||
        extractNumber(/měsíční příjem[:\s]*([0-9\s,]+)\s*Kč/i) ||
        data.avgSpend * 3000,
      yearlyRevenue:
        extractNumber(/Ročně:\s*([0-9\s,]+)\s*Kč/i) ||
        extractNumber(/roční příjem[:\s]*([0-9\s,]+)\s*Kč/i) ||
        data.avgSpend * 36000,
      dailyFootTraffic:
        extractNumber(/denní návštěvnost[:\s]*([0-9\s,]+)/i) ||
        extractNumber(/([0-9\s,]+)\s*lidí denně/i) ||
        500,
      conversionRate: extractNumber(/konverz[ní]*[:\s]*([0-9,]+)\s*%/i) || 10,
      competitorCount: extractNumber(/([0-9]+)[\s-]*konkurent/i) || 2,
    };

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
