// /hooks/useChat.ts
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useAnalysis } from "@/lib/contexts/analysis-context";
import { MAX_MESSAGE_LENGTH } from "@/lib/constants/chat";
import { useRateLimit } from "./useRateLimit";
import type { MessageType } from "../types/chat";

export function useChat() {
  const { data: session } = useSession();
  const {
    messages,
    setMessages,
    analysisData,
    hasCompletedAnalysis,
    showToast,
  } = useAnalysis();

  // Chat-specific states
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">(
    "signup",
  );

  const { checkRateLimit } = useRateLimit();

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !hasCompletedAnalysis) return;

    // Validate message length
    if (input.length > MAX_MESSAGE_LENGTH) {
      const errorMessage: MessageType = {
        id: Date.now().toString(),
        role: "assistant",
        content: `Vaše zpráva je příliš dlouhá (${input.length} znaků). Maximální délka je ${MAX_MESSAGE_LENGTH} znaků. Zkuste svůj dotaz zkrátit.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    // Check if user is authenticated
    if (!session) {
      localStorage.setItem("pendingChatMessage", input);
      setAuthModalMode("login");
      setShowAuthModal(true);
      return;
    }

    // Check rate limit
    if (!checkRateLimit()) {
      const rateLimitMessage: MessageType = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Příliš mnoho požadavků. Prosím, zkuste to znovu za chvíli.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, rateLimitMessage]);
      return;
    }

    const userMessage: MessageType = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setIsLoading(true);

    try {
      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          coordinates: analysisData?.coordinates,
          groundedLocationData: analysisData?.groundedLocationData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403 && data.limitExceeded) {
          showToast("Nedostatek kreditů pro AI dotaz.");
          setIsLoading(false);
          return;
        }
        throw new Error(data.error || data.details || "Failed to get response");
      }

      const assistantMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        sources: data.sources || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          error instanceof Error
            ? error.message
            : "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    input,
    setInput,
    isLoading,
    setIsLoading,
    showAuthModal,
    setShowAuthModal,
    authModalMode,
    setAuthModalMode,
    sendMessage,
  };
}
