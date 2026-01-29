import { Message } from "@/components/chat-interface";

/**
 * Utility to show too many requests message
 * @param setMessages
 * @returns void
 */
const tooManyRequestsMessage = (
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
) => {
  const rateLimitMessage: Message = {
    id: Date.now().toString(),
    role: "assistant",
    content:
      "Příliš mnoho požadavků. Prosím, zkuste to znovu za chvíli. Maximální počet dotazů je 5 za minutu.",
    timestamp: new Date(),
  };
  setMessages((prev) => [...prev, rateLimitMessage]);
};

// Utility to handle feedback on messages
const handleFeedback = (
  id: string,
  type: "up" | "down",
  setFeedbackMap: React.Dispatch<
    React.SetStateAction<Record<string, "up" | "down">>
  >,
) => {
  // optimistic UI update
  setFeedbackMap((prev) => ({ ...prev, [id]: type }));
  // placeholder side-effect: replace with API call or parent callback
  console.log("feedback", { id, feedback: type });
};

// Utility to scroll to bottom of chat
const scrollToBottom = (
  messagesEndRef: React.RefObject<HTMLDivElement | null>,
) => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
};

// Utility to show authentication modal
const showAuthModalAction = (
  setAuthModalMode: React.Dispatch<React.SetStateAction<"login" | "signup">>,
  setShowAuthModal: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  setAuthModalMode("login");
  setShowAuthModal(true);
};

export {
  tooManyRequestsMessage,
  handleFeedback,
  scrollToBottom,
  showAuthModalAction,
};
