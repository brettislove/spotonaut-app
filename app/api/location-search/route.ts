import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.length < 3) {
      return NextResponse.json(
        { error: "Query must be at least 3 characters" },
        { status: 400 }
      );
    }

    console.log("Location search for:", query);

    // Fetch from Nominatim API server-side to avoid CORS issues
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&countrycodes=cz&limit=5&addressdetails=1`,
      {
        headers: {
          "User-Agent": "Spotonaut-App/1.0 (Location Search Service)",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(
        "Nominatim API error:",
        response.status,
        response.statusText
      );
      return NextResponse.json(
        { error: "Failed to fetch location suggestions" },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error("Unexpected response format from Nominatim:", data);
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 500 }
      );
    }

    return NextResponse.json({ suggestions: data });
  } catch (error) {
    console.error("Location search API Error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to fetch location suggestions";
    return NextResponse.json(
      {
        error: "Failed to fetch location suggestions",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
