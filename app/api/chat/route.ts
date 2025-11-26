import { NextRequest, NextResponse } from "next/server";
import { chatAgent } from "@/lib/mastra/agent";

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    console.log("Received messages:", messages);

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

    // Generate response using Mastra agent
    const response = await chatAgent.generate(contextualPrompt);

    console.log("Agent response:", response);

    return NextResponse.json({
      message: response.text || "Sorry, I could not generate a response.",
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
