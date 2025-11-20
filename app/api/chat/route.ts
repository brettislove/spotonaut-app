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

    // Generate response using Mastra agent
    const response = await chatAgent.generate(lastMessage.content);

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
