import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { generateChatWithMaps } from "@/lib/google-ai/client";
import {
  checkGlobalMapsQuota,
  incrementGlobalMapsUsage,
  archiveOldRecordsIfNeeded,
  extractGroundingSources,
} from "@/lib/google-ai/usage";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

    const { messages, coordinates } = await request.json();

    console.log("Received messages:", messages);
    console.log("Coordinates for Maps grounding:", coordinates);

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
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

    console.log("Generating response for:", lastMessage.content);

    // Build context from conversation history
    // Include all messages to provide full context about the analysis
    let contextualPrompt = lastMessage.content;

    if (messages.length > 1) {
      // Add context from previous messages
      const conversationContext = messages
        .slice(0, -1) // All messages except the last one
        .map(
          (msg: { role: string; content: string }) =>
            `${msg.role === "user" ? "Uživatel" : "Asistent"}: ${msg.content}`
        )
        .join("\n\n");

      contextualPrompt = `
KONTEXT KONVERZACE:
${conversationContext}

AKTUÁLNÍ DOTAZ:
${lastMessage.content}

Odpověz na aktuální dotaz s ohledem na předchozí konverzaci. Pokud se dotaz týká dříve provedené analýzy, odkazuj na konkrétní data a doporučení z té analýzy.
`;
    }

    // Check quota and archive old records
    await archiveOldRecordsIfNeeded(prisma);
    const canUseMaps = await checkGlobalMapsQuota(prisma);

    let text: string | undefined;
    let groundingSources: Array<{ title: string; uri: string }> = [];

    if (canUseMaps) {
      // Try with Maps grounding
      try {
        const response = await generateChatWithMaps(contextualPrompt, {
          enableMaps: true,
          latitude: coordinates?.lat,
          longitude: coordinates?.lng,
        });
        text = response.text;
        groundingSources = extractGroundingSources(response);
        await incrementGlobalMapsUsage(prisma);
      } catch (mapsError) {
        console.error(
          "Maps grounding failed, falling back to basic:",
          mapsError
        );
        // Silent fallback to basic generation
        const response = await generateChatWithMaps(contextualPrompt, {
          enableMaps: false,
        });
        text = response.text;
      }
    } else {
      // Quota exceeded, use basic generation
      const response = await generateChatWithMaps(contextualPrompt, {
        enableMaps: false,
      });
      text = response.text;
    }

    return NextResponse.json({
      message: text || "Omlouváme se, nepodařilo se vygenerovat odpověď.",
      sources: groundingSources,
    });
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
