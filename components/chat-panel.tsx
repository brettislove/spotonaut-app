import {
  CopyIcon,
  MessageSquareIcon,
  RefreshCcwIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "./ai-elements/conversation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageToolbar,
} from "./ai-elements/message";
import { toast } from "sonner";
import { Shimmer } from "./ai-elements/shimmer";
import { Suggestion, Suggestions } from "./ai-elements/suggestion";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputMessage,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputController,
} from "./ai-elements/prompt-input";
import { useEffect, useState } from "react";
import { useAnalysis } from "@/lib/contexts/analysis-context";
import { useRateLimit } from "@/lib/hooks/useRateLimit";
import { MessageType } from "./chat-interface";
import { AnalysisData } from "@/lib/types/analysis";

export default function ChatPanel({
  analysisData,
  className,
}: {
  analysisData: AnalysisData;
  className?: string;
}) {
  const { messages, setMessages } = useAnalysis();
  const { checkRateLimit } = useRateLimit();
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [disliked, setDisliked] = useState<Record<string, boolean>>({});
  const [promptInputText, setPromptInputText] = useState("");
  const [status, setStatus] = useState<
    "submitted" | "streaming" | "ready" | "error"
  >("ready");

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  // Get suggestions from the last assistant message - to show only the latest ones
  const lastAssistantMessage = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");
  const currentSuggestions = lastAssistantMessage?.suggestions || [];

  const handleSubmit = async (message: PromptInputMessage) => {
    setStatus("submitted");

    const { text } = message;

    if (!text || !text.trim()) {
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
      // Append rate limit message to conversation
      setMessages((prev) => [...prev, rateLimitMessage]);
      return;
    }

    const userMessage: MessageType = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    // Append user message to conversation
    // setMessages((prev) => [...prev, userMessage]);

    try {
      // Claim a prompt for this user (server-side lifetime quota) BEFORE appending the user's message
      const claimRes = await fetch("/api/chat/usage/claim", { method: "POST" });
      if (!claimRes.ok) {
        const claimData = await claimRes.json().catch(() => ({}));
        if (claimRes.status === 403 && claimData.limitExceeded) {
          if (claimData.requestPending) {
            toast.info("Žádost o další prompty je v procesu schválení.");
          }
          // Show request modal
          setStatus("ready");
          return;
        }
        throw new Error(claimData.error || "Failed to claim prompt");
      }
      // Claim succeeded: append user's message and clear input
      setMessages((prev) => [...prev, userMessage]);
      setStatus("streaming");
      // Build the full conversation history including the new message
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          coordinates: analysisData?.coordinates,
          groundedLocationData: analysisData?.groundedLocationData,
        }),
      });
      if (!response.ok) {
        const errorMessage: MessageType = {
          id: Date.now().toString(),
          role: "assistant",
          content: "Došlo k chybě při získávání odpovědi od AI.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setStatus("error");
        throw new Error("Failed to get response from AI");
      }
      const data = await response.json();
      const assistantMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        suggestions: data.suggestions || [],
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setStatus("ready");
    } catch (error) {
      console.error("Error during message submission:", error);
      setStatus("error");
    }
  };

  return (
    <>
      <Card className={`h-full flex flex-col py-4 ${className}`}>
        <CardHeader>
          <CardTitle>AI Asistent</CardTitle>
          <CardDescription>
            Chatujte s naším AI asistentem pro analýzu lokality
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 flex flex-col">
          <Conversation className="flex-1">
            <ConversationContent>
              {messages.length === 0 ? (
                <ConversationEmptyState
                  description="Zde můžete začít klást otázky týkající se vaší analýzy."
                  icon={<MessageSquareIcon className="size-6" />}
                  title="Začněte konverzaci"
                />
              ) : (
                <>
                  {messages.map(({ id, role, content }) => {
                    // Clean the first message by removing JSON code blocks

                    return (
                      <Message from={role} key={id}>
                        <MessageContent>{content}</MessageContent>
                        {role === "assistant" && (
                          <MessageToolbar>
                            <MessageActions>
                              <MessageAction
                                label="Retry"
                                onClick={() =>
                                  toast.info(
                                    "Opětovný dotaz zatím není implementován.",
                                  )
                                }
                                tooltip="Zkusit znovu"
                              >
                                <RefreshCcwIcon className="size-4" />
                              </MessageAction>
                              <MessageAction
                                label="Like"
                                onClick={() =>
                                  setLiked((prev) => ({
                                    ...prev,
                                    [id]: !prev[id],
                                  }))
                                }
                                tooltip="Dobrá odpověď"
                              >
                                <ThumbsUpIcon
                                  className="size-4"
                                  fill={liked[id] ? "currentColor" : "none"}
                                />
                              </MessageAction>
                              <MessageAction
                                label="Dislike"
                                onClick={() =>
                                  setDisliked((prev) => ({
                                    ...prev,
                                    [id]: !prev[id],
                                  }))
                                }
                                tooltip="Špatná odpověď"
                              >
                                <ThumbsDownIcon
                                  className="size-4"
                                  fill={disliked[id] ? "currentColor" : "none"}
                                />
                              </MessageAction>
                              <MessageAction
                                label="Copy"
                                onClick={() => handleCopy(content)}
                                tooltip="Zkopírovat"
                              >
                                <CopyIcon className="size-4" />
                              </MessageAction>
                            </MessageActions>
                          </MessageToolbar>
                        )}
                      </Message>
                    );
                  })}
                  {status === "streaming" && (
                    <Message from="assistant" key="loading">
                      <MessageContent>
                        <Shimmer>Přemýšlím</Shimmer>
                      </MessageContent>
                    </Message>
                  )}
                </>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
          {/* Suggestions */}
          {currentSuggestions.length > 0 && status === "ready" && (
            <div className="px-2 py-2">
              <Suggestions>
                {currentSuggestions.map((suggestion) => (
                  <Suggestion
                    key={suggestion}
                    suggestion={suggestion}
                    onClick={() => setPromptInputText(suggestion)}
                  />
                ))}
              </Suggestions>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <PromptInputProvider>
            <PromptInputWrapper
              status={status}
              onSubmit={handleSubmit}
              suggestionText={promptInputText}
              onSuggestionTextConsumed={() => setPromptInputText("")}
            />
          </PromptInputProvider>
        </CardFooter>
      </Card>
    </>
  );
}

function PromptInputWrapper({
  status,
  onSubmit,
  suggestionText,
  onSuggestionTextConsumed,
}: {
  status: "submitted" | "streaming" | "ready" | "error";
  onSubmit: (message: PromptInputMessage) => void;
  suggestionText?: string;
  onSuggestionTextConsumed?: () => void;
}) {
  const controller = usePromptInputController();

  // When suggestionText changes, insert it into the input
  useEffect(() => {
    if (suggestionText) {
      controller.textInput.setInput(suggestionText);
      onSuggestionTextConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestionText]);

  const handleSubmit = (message: PromptInputMessage) => {
    onSubmit(message);
  };

  return (
    <div className="size-full">
      <PromptInput globalDrop multiple onSubmit={handleSubmit}>
        <PromptInputBody>
          <PromptInputTextarea
            onChange={(e) => controller.textInput.setInput(e.target.value)}
            placeholder="Zeptejte se mě na cokoli..."
            value={controller.textInput.value}
          />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools></PromptInputTools>
          <PromptInputSubmit status={status} />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
