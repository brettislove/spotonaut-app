// Utility to handle feedback on messages
export const handleFeedback = (
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
export const scrollToBottom = (
  messagesEndRef: React.RefObject<HTMLDivElement | null>,
) => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
};

// Utility to show authentication modal
export const showAuthModalAction = (
  setAuthModalMode: React.Dispatch<React.SetStateAction<"login" | "signup">>,
  setShowAuthModal: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  setAuthModalMode("login");
  setShowAuthModal(true);
};
