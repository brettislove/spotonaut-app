import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import {
  generateProChatWithGrounding,
  type GroundedLocationData,
} from "@/lib/google-ai/location-analysis";

// Character limit for messages (same as frontend)
const MAX_MESSAGE_LENGTH = 2000;

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        {
          error: "Pro pokračování v konverzaci se musíte přihlásit",
          requiresAuth: true,
        },
        { status: 401 }
      );
    }

    const { messages, groundedLocationData } = await request.json();

    console.log("Received messages:", messages);
    console.log("Grounded location data provided:", !!groundedLocationData);

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Require grounded location data
    if (!groundedLocationData) {
      return NextResponse.json(
        {
          error:
            "Grounded location data is required. Please complete an analysis first.",
        },
        { status: 400 }
      );
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage || !lastMessage.content) {
      return NextResponse.json(
        { error: "Invalid message format" },
        { status: 400 }
      );
    }

    // Validate message length
    if (lastMessage.content.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        {
          error: `Zpráva je příliš dlouhá (${lastMessage.content.length} znaků). Maximální délka je ${MAX_MESSAGE_LENGTH} znaků.`,
        },
        { status: 400 }
      );
    }

    console.log("Generating response for:", lastMessage.content);

    // Use Pro model with stored grounded location data
    // This prevents hallucinations and doesn't require additional Maps API calls
    try {
      console.log("Using Pro model with stored grounded location data");
      const proResult = await generateProChatWithGrounding({
        messages: messages.map((msg: { role: string; content: string }) => ({
          role: msg.role === "user" ? "user" : "model",
          content: msg.content,
        })),
        groundedLocation: groundedLocationData as GroundedLocationData,
      });

      const text = proResult.text;
      // Extract sources from the grounded location data if available
      const groundingSources: Array<{ title: string; uri: string }> = [];
      if (groundedLocationData.primaryMapsUrl) {
        groundingSources.push({
          title:
            groundedLocationData.resolvedAddress ||
            groundedLocationData.locationQuery,
          uri: groundedLocationData.primaryMapsUrl,
        });
      }

      return NextResponse.json({
        message: text || "Omlouváme se, nepodařilo se vygenerovat odpověď.",
        sources: groundingSources,
      });
    } catch (proError) {
      console.error("Pro chat with grounding failed:", proError);
      return NextResponse.json(
        {
          error: "Nepodařilo se vygenerovat odpověď",
          details:
            proError instanceof Error
              ? proError.message
              : "Unknown error occurred",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Chat API Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to process message";
    return NextResponse.json(
      {
        error: "Failed to process message",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
