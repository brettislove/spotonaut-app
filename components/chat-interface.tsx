"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import AnalysisForm from "./analysis-form";
import AuthModal from "./auth-modal";
import FeedbackModal from "./feedback-modal";
import Toast from "./toast";
import RequestMorePromptsModal from "./request-more-prompts-modal";
import AnalysisResultsMobile from "./analysis-results-mobile";
import MapView from "./map-view";
import RotatingText from "./ui/rotating-text";
import AnalysisProgress, { type ProgressStep } from "./analysis-progress";
import { useAnalysis } from "@/lib/contexts/analysis-context";
import Image from "next/image";
import type { BusinessType } from "@/lib/constants/business-types";
import { renderSourceLink } from "./grounding-sources";
import { FiThumbsUp, FiThumbsDown } from "react-icons/fi";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: Array<{ title: string; uri: string }>;
}

interface AnalysisFormData {
  location: string;
  businessType: BusinessType;
  operatingHours: number;
  timeframe: "day" | "week" | "month" | "year";
  coordinates?: {
    lat: number;
    lon: number;
  };
}

// Rate limit for RPM (requests per minute) - 2.5-pro allows 150 RPM
const MAX_REQUESTS_PER_MINUTE = 149;

// Character limit for chat messages
const MAX_MESSAGE_LENGTH = 2000;

export default function ChatInterface() {
  const { data: session } = useSession();
  const {
    messages,
    setMessages,
    analysisData,
    setAnalysisData,
    hasCompletedAnalysis,
    setHasCompletedAnalysis,
    showMapView,
    setShowMapView,
    showAnalysisForm,
    setShowAnalysisForm,
    fingerprint,
    navigateHome,
    clearRestoredState,
    showFeedbackModal,
    toastMessage,
    triggerFeedbackIfEligible,
    dismissFeedback,
    submitFeedback,
    showToast,
  } = useAnalysis();

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">(
    "signup"
  );
  const [isMobile, setIsMobile] = useState(false);
  const [pendingAnalysisData, setPendingAnalysisData] =
    useState<AnalysisFormData | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingNewAnalysis, setPendingNewAnalysis] = useState(false);
  const [progressStep, setProgressStep] = useState<ProgressStep>("geocoding");
  const [streamingText, setStreamingText] = useState("");
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null
  );
  const [expandedSources, setExpandedSources] = useState<
    Record<string, boolean>
  >({});
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestPending, setRequestPending] = useState(false);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, "up" | "down">>(
    {}
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const requestTimestamps = useRef<number[]>([]);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle pending actions after authentication
  useEffect(() => {
    if (session) {
      // Check for pending chat message immediately (doesn't need fingerprint)
      const storedMessage = localStorage.getItem("pendingChatMessage");
      if (storedMessage) {
        localStorage.removeItem("pendingChatMessage");
        setInput(storedMessage);
      }

      // Check for pending analysis (needs fingerprint for submission)
      if (fingerprint) {
        const pendingAnalysis = localStorage.getItem("pendingAnalysis");
        if (pendingAnalysis) {
          try {
            const data: AnalysisFormData = JSON.parse(pendingAnalysis);
            localStorage.removeItem("pendingAnalysis");

            // Clear any old persisted state now that we're about to submit new one
            if (session?.user?.email) {
              localStorage.removeItem(`analysis_${session.user.email}`);
            }
            localStorage.removeItem(`analysis_${fingerprint}`);

            // Clear restored state to prevent context from applying old data
            clearRestoredState();

            // Reset UI state for new analysis
            setShowAnalysisForm(true);
            setShowMapView(false);
            setHasCompletedAnalysis(false);
            setMessages([]);
            setAnalysisData(null);

            // Set pending data to trigger auto-submit
            setPendingAnalysisData(data);
          } catch (error) {
            console.error("Failed to restore pending analysis:", error);
          }
        }
      }
    }
  }, [
    session,
    fingerprint,
    setShowAnalysisForm,
    setShowMapView,
    setHasCompletedAnalysis,
    setMessages,
    setAnalysisData,
    clearRestoredState,
  ]);

  // Auto-submit pending analysis when it's set
  useEffect(() => {
    if (pendingAnalysisData && session && fingerprint && !isLoading) {
      handleAnalysisSubmit(pendingAnalysisData);
      setPendingAnalysisData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAnalysisData, session, fingerprint]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkRateLimit = React.useCallback((): boolean => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Remove timestamps older than 1 minute
    requestTimestamps.current = requestTimestamps.current.filter(
      (timestamp) => timestamp > oneMinuteAgo
    );

    // Check if we've hit the limit
    if (requestTimestamps.current.length >= MAX_REQUESTS_PER_MINUTE) {
      return false;
    }

    // Add current timestamp
    requestTimestamps.current.push(now);
    return true;
  }, []);

  const showAuthModalAction = () => {
    setAuthModalMode("login");
    setShowAuthModal(true);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !hasCompletedAnalysis) return;

    if (requestPending) {
      // Inform the user their request for more prompts is pending
      showToast(
        "Žádost o další prompty je v procesu schválení. Prosím vyčkejte na potvrzení."
      );
      return;
    }

    // Validate message length
    if (input.length > MAX_MESSAGE_LENGTH) {
      const errorMessage: Message = {
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
      // Store the message before showing auth modal
      localStorage.setItem("pendingChatMessage", input);
      showAuthModalAction();
      return;
    }

    // Check rate limit
    if (!checkRateLimit()) {
      const rateLimitMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Příliš mnoho požadavků. Prosím, zkuste to znovu za chvíli.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, rateLimitMessage]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setIsLoading(true);

    try {
      // Claim a prompt for this user (server-side lifetime quota) BEFORE
      // appending the user's message to avoid a 'ghost' message when claim fails.
      const claimRes = await fetch("/api/chat/usage/claim", { method: "POST" });
      const claimData = await claimRes.json().catch(() => ({}));
      if (!claimRes.ok) {
        // If over quota, open request modal or mark pending state
        if (claimRes.status === 403 && claimData.limitExceeded) {
          if (claimData.requestPending) {
            // User already requested more; set pending state and show a toast.
            setRequestPending(true);
            showToast("Žádost o další prompty je v procesu schválení.");
            setIsLoading(false);
            return;
          }
          setShowRequestModal(true);
          setIsLoading(false);
          return;
        }
        // other errors — show generic message
        throw new Error(claimData.error || "Failed to claim prompt");
      }

      // Claim succeeded: append user's message and clear input
      setMessages((prev) => [...prev, userMessage]);
      setInput("");

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

      const data = await response.json();

      if (!response.ok) {
        // If server enforces limit, open request modal
        if (response.status === 403 && data.limitExceeded) {
          setShowRequestModal(true);
          setIsLoading(false);
          return;
        }

        throw new Error(data.error || data.details || "Failed to get response");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        sources: data.sources || [], // Include sources in the message
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
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

  const handleAnalysisSubmit = React.useCallback(
    async (data: AnalysisFormData) => {
      // Check if user has already used free analysis and is not authenticated
      if (!session) {
        const hasUsedFree = localStorage.getItem("hasUsedFreeAnalysis");
        if (hasUsedFree === "true") {
          // Store the analysis data before showing auth modal
          localStorage.setItem("pendingAnalysis", JSON.stringify(data));
          setAuthModalMode("signup");
          setShowAuthModal(true);
          return;
        }
      }

      // Check rate limit
      if (!checkRateLimit()) {
        const rateLimitMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content:
            "Příliš mnoho požadavků. Prosím, zkuste to znovu za chvíli. Maximální počet dotazů je 5 za minutu.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, rateLimitMessage]);
        return;
      }

      setIsLoading(true);
      setProgressStep("geocoding");
      setStreamingText("");
      setStreamingMessageId(null);

      try {
        const response = await fetch("/api/analysis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            fingerprint,
            coordinates: data.coordinates,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 403 && errorData.requiresAuth) {
            setAuthModalMode("signup");
            setShowAuthModal(true);
            setShowAnalysisForm(true);
            setIsLoading(false);
            return;
          }
          throw new Error(errorData.error || "Failed to get analysis");
        }

        // Check if response is streaming (text/event-stream)
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("text/event-stream")) {
          // Handle streaming response
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) {
            throw new Error("No response body");
          }

          // Create streaming message
          const messageId = Date.now().toString();
          setStreamingMessageId(messageId);
          const assistantMessage: Message = {
            id: messageId,
            role: "assistant",
            content: "",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);

          let buffer = "";
          let fullAnalysisText = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));

                  if (data.type === "progress") {
                    setProgressStep(data.step);
                  } else if (data.type === "chunk") {
                    fullAnalysisText += data.text;
                    setStreamingText(fullAnalysisText);
                    // Update message content
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === messageId
                          ? { ...msg, content: fullAnalysisText }
                          : msg
                      )
                    );
                  } else if (data.type === "done") {
                    // Mark that free analysis has been used (for anonymous users)
                    if (!session) {
                      localStorage.setItem("hasUsedFreeAnalysis", "true");
                    }

                    // Update final message
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === messageId
                          ? {
                              ...msg,
                              content: data.analysis,
                              sources: data.sources || [],
                            }
                          : msg
                      )
                    );

                    // Show map view with analysis data
                    if (data.data) {
                      setAnalysisData({
                        ...data.data,
                        sources: data.sources || [],
                        groundedLocationData: data.groundedLocationData,
                      });
                      setShowMapView(true);
                      setHasCompletedAnalysis(true);
                      setShowAnalysisForm(false);
                    }

                    setStreamingText("");
                    setStreamingMessageId(null);
                    setProgressStep("complete");
                  } else if (data.type === "error") {
                    throw new Error(
                      data.error || data.details || "Analysis failed"
                    );
                  }
                } catch (parseError) {
                  console.error("Error parsing SSE data:", parseError);
                }
              }
            }
          }
        } else {
          // Fallback to non-streaming response (for backward compatibility)
          const result = await response.json();

          // Mark that free analysis has been used (for anonymous users)
          if (!session) {
            localStorage.setItem("hasUsedFreeAnalysis", "true");
          }

          const assistantMessage: Message = {
            id: Date.now().toString(),
            role: "assistant",
            content: result.analysis,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, assistantMessage]);

          // Show map view with analysis data
          if (result.data) {
            setAnalysisData({
              ...result.data,
              sources: result.sources || [],
              groundedLocationData: result.groundedLocationData,
            });
            setShowMapView(true);
            setHasCompletedAnalysis(true);
            setShowAnalysisForm(false);
          }
        }
      } catch (error) {
        console.error("Error getting analysis:", error);
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Omlouváme se, při analýze došlo k chybě. Zkuste to prosím znovu.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setStreamingText("");
        setStreamingMessageId(null);
        setProgressStep("geocoding");
      } finally {
        setIsLoading(false);
      }
    },
    [
      session,
      fingerprint,
      checkRateLimit,
      setMessages,
      setAnalysisData,
      setShowMapView,
      setHasCompletedAnalysis,
      setShowAnalysisForm,
    ]
  );

  const handleAnalysisCancel = () => {
    // Only allow canceling if analysis has been completed
    if (hasCompletedAnalysis) {
      setShowAnalysisForm(false);
    }
  };

  const handleNewAnalysis = () => {
    // Trigger feedback modal if eligible (before showing confirmation or navigating)
    const feedbackShown = triggerFeedbackIfEligible();

    // If feedback modal will be shown, mark that we have a pending new analysis
    if (feedbackShown) {
      setPendingNewAnalysis(true);
      return; // Wait for feedback to be submitted/dismissed
    }

    // If no feedback modal, proceed with new analysis
    if (hasCompletedAnalysis) {
      setShowConfirmDialog(true);
    } else {
      navigateHome();
    }
  };

  const confirmNewAnalysis = () => {
    setShowConfirmDialog(false);
    navigateHome();
  };

  const handleFeedback = (id: string, type: "up" | "down") => {
    // optimistic UI update
    setFeedbackMap((prev) => ({ ...prev, [id]: type }));
    // placeholder side-effect: replace with API call or parent callback
    console.log("feedback", { id, feedback: type });
  };

  // Mobile Results View
  if (showMapView && isMobile && analysisData) {
    return (
      <>
        <AnalysisResultsMobile
          session={session}
          analysisData={analysisData}
          messages={messages}
          input={input}
          isLoading={isLoading}
          onStartChat={showAuthModalAction}
          onInputChange={setInput}
          onSendMessage={sendMessage}
          onNewAnalysis={handleNewAnalysis}
        />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authModalMode}
        />
        <RequestMorePromptsModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
        />
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => {
            dismissFeedback();
            // If there was a pending new analysis, proceed with it
            if (pendingNewAnalysis) {
              setPendingNewAnalysis(false);
              if (hasCompletedAnalysis) {
                setShowConfirmDialog(true);
              } else {
                navigateHome();
              }
            }
          }}
          onSubmit={async (rating, comment, feedbackType) => {
            try {
              await submitFeedback(rating, comment, feedbackType);
              // If there was a pending new analysis, proceed with it after successful submission
              if (pendingNewAnalysis) {
                setPendingNewAnalysis(false);
                if (hasCompletedAnalysis) {
                  setShowConfirmDialog(true);
                } else {
                  navigateHome();
                }
              }
            } catch (error) {
              // Error handling is done in submitFeedback
              throw error;
            }
          }}
        />
        {/* Confirmation Dialog for Mobile */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-yellow-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg mb-2">
                    Zahájit novou analýzu?
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Spuštění nové analýzy smaže aktuální výsledky a historii
                    konverzace. Tato akce je nevratná.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-all border border-slate-700"
                >
                  Zrušit
                </button>
                <button
                  onClick={confirmNewAnalysis}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-lg transition-all shadow-lg"
                >
                  Pokračovat
                </button>
              </div>
            </div>
          </div>
        )}
        <Toast message={toastMessage} onDismiss={() => showToast("")} />
      </>
    );
  }

  // Desktop/Tablet View
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 font-sans relative overflow-hidden">
      {/* Moon background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="/Moon.png"
          alt="Moon"
          className="w-full h-full object-cover opacity-20"
        />
        {/* Ambient glow effects */}
        <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Persistent AI disclaimer (small and unobtrusive) */}
      {!isMobile && (
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-slate-300 px-3 py-1 z-50 max-w-[90%] text-center pointer-events-none">
          Výsledky jsou založeny na AI a slouží pouze pro informační účely —
          nemusí být přesné ani úplné.
        </div>
      )}

      {showMapView ? (
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] p-4 lg:p-8">
          <div className="w-full max-w-6xl h-full flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Map View with Chat Sidebar */}
            <div className="flex-1 flex flex-col lg:flex-row bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden">
              {/* Map Content */}
              <div className="w-full lg:w-1/2 p-4 lg:p-6 overflow-hidden">
                <MapView data={analysisData!} />
              </div>

              {/* Chat Sidebar - Attached to map */}
              <div className="w-full lg:w-1/2 border-t lg:border-t-0 lg:border-l border-slate-700 bg-slate-900/80 flex flex-col">
                {/* Chat Header with New Analysis Button */}
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                  <div className="flex items-center">
                    <Image
                      src="/spotonaut_character.svg"
                      alt="Spotonaut"
                      width={32}
                      height={32}
                      className="w-10 h-10"
                    />
                    <h2 className="text-purple-500 font-semibold text-lg">
                      AI Asistent
                    </h2>
                  </div>
                  <button
                    onClick={handleNewAnalysis}
                    className="relative cursor-pointer px-3 py-1.5 bg-gradient-to-br bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full transition-all shadow-md hover:shadow-lg flex items-center gap-2 overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
                    <svg
                      className="w-4 h-4 relative z-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span className="relative z-10">Nová analýza</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {/* Google Maps attribution styles moved to `app/globals.css` */}
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {message.role === "user" ? (
                        <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-gradient-to-b from-purple-500 via-purple-600 to-purple-700 text-white">
                          <div
                            className="text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: message.content
                                .replace(/```[\s\S]*?```/g, "")
                                .replace(
                                  /\*\*(.*?)\*\*/g,
                                  "<strong>$1</strong>"
                                )
                                .replace(/\n/g, "<br>"),
                            }}
                          />
                        </div>
                      ) : (
                        // <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-slate-800 text-slate-100 border border-slate-700">
                        <div className="mx-3 text-slate-200 text-sm leading-relaxed prose-invert">
                          <div
                            className="mt-2"
                            dangerouslySetInnerHTML={{
                              __html: message.content
                                .replace(/```[\s\S]*?```/g, "")
                                .replace(
                                  /\*\*(.*?)\*\*/g,
                                  "<strong>$1</strong>"
                                )
                                .replace(/\n/g, "<br>"),
                            }}
                          />

                          {/* Divider */}
                          <div className="border-t border-slate-700/50" />

                          {/* Sources - collapsible section */}
                          {message.sources && message.sources.length > 0 && (
                            <div className="mt-2">
                              <button
                                onClick={() =>
                                  setExpandedSources((prev) => ({
                                    ...prev,
                                    [message.id]: !prev[message.id],
                                  }))
                                }
                                aria-controls={`sources-content-${message.id}`}
                                aria-expanded={!!expandedSources[message.id]}
                                className="inline-flex items-center cursor-pointer gap-2 text-sm py-1 text-slate-400 hover:text-white transition-colors"
                              >
                                <span>
                                  {expandedSources[message.id]
                                    ? "Skrýt zdroje"
                                    : "Zobrazit zdroje"}
                                </span>
                              </button>
                              {expandedSources[message.id] && (
                                <div
                                  id={`sources-content-${message.id}`}
                                  className="mt-2 text-sm text-slate-400"
                                >
                                  <div className="flex flex-wrap gap-2">
                                    {message.sources.map((source, index) => (
                                      <div key={index}>
                                        {renderSourceLink(source)}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          {/* Feedback (thumbs up / thumbs down) */}
                          <div className="mt-3 flex items-center gap-3">
                            <span className="text-slate-400 text-xs">
                              Jak hodnotíte tuto odpověď?
                            </span>
                            <button
                              aria-label={`upvote-${message.id}`}
                              onClick={() => handleFeedback(message.id, "up")}
                              disabled={!!feedbackMap[message.id]}
                              className={`pb-1 cursor-pointer rounded-md flex items-center justify-center transition-colors text-slate-400 hover:text-white ${
                                feedbackMap[message.id] === "up"
                                  ? "text-white"
                                  : "text-slate-200"
                              }`}
                            >
                              <FiThumbsUp className="w-4 h-4" />
                            </button>
                            <button
                              aria-label={`downvote-${message.id}`}
                              onClick={() => handleFeedback(message.id, "down")}
                              disabled={!!feedbackMap[message.id]}
                              className={`cursor-pointer rounded-md flex items-center justify-center transition-colors text-slate-400 hover:text-white ${
                                feedbackMap[message.id] === "down"
                                  ? "text-white"
                                  : "text-slate-200"
                              }`}
                            >
                              <FiThumbsDown className="w-4 h-4" />
                            </button>
                            {feedbackMap[message.id] && (
                              <span className="text-xs ml-2 text-green-400">
                                Děkujeme!
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                          </div>
                          <span className="text-slate-400 text-sm">
                            Přemýšlím...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-slate-700">
                  <form onSubmit={sendMessage} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Napište svou zprávu..."
                        disabled={isLoading || requestPending}
                        maxLength={MAX_MESSAGE_LENGTH}
                        className="flex-1 bg-slate-800/50 border border-slate-600 text-white placeholder-slate-400 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all disabled:opacity-50"
                      />
                      <button
                        type="submit"
                        disabled={isLoading || requestPending || !input.trim()}
                        className="px-4 py-2 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-400 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Odeslat
                      </button>
                    </div>
                    {input.length > MAX_MESSAGE_LENGTH * 0.8 && (
                      <div
                        className={`text-xs text-right ${
                          input.length > MAX_MESSAGE_LENGTH
                            ? "text-red-400"
                            : "text-slate-400"
                        }`}
                      >
                        {input.length} / {MAX_MESSAGE_LENGTH} znaků
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <main
          className={`flex flex-col z-10 transition-all duration-700 ease-in-out ${
            showAnalysisForm
              ? "h-[calc(100vh-4rem)] w-full mx-auto overflow-y-auto"
              : "min-h-[calc(100vh-4rem)] w-full max-w-4xl mx-auto py-8 px-4"
          }`}
        >
          {showAnalysisForm ? (
            <div className="w-full max-w-7xl mx-auto px-4 py-8 lg:py-12">
              {/* Heading - visible on mobile only, at the top */}
              <div className="space-y-4 mb-8 lg:hidden">
                <h1 className="text-4xl font-bold text-white leading-tight">
                  Zjisti, kde{" "}
                  <RotatingText
                    words={["otevřít", "vydělat", "začít", "růst"]}
                    className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600"
                    typingSpeed={80}
                    deletingSpeed={40}
                    delayBetweenWords={2500}
                  />
                </h1>
                <p className="text-lg text-slate-400 leading-relaxed">
                  Spotonaut využívá pokročilou AI analýzu k vyhodnocení
                  potenciálu vaší lokality.{" "}
                  <b className="text-white">Zaregistrujte se zdarma</b> a
                  využijte tak možnost zhodnotit výsledná data s naším{" "}
                  <b className="text-white">AI asistentem!</b>
                </p>
              </div>

              {/* Form - mobile first */}
              <div className="relative mb-8 lg:hidden">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20"></div>
                <div className="relative">
                  {isLoading ? (
                    <div className="bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl p-6 min-h-[600px] flex flex-col items-center justify-center">
                      <div className="mb-8">
                        <Image
                          src="/spotonaut_character.svg"
                          alt="Spotonaut"
                          width={120}
                          height={120}
                          className="w-32 h-32 animate-pulse"
                        />
                      </div>
                      <div className="w-full max-w-md space-y-6">
                        <AnalysisProgress
                          currentStep={progressStep}
                          streamingText={streamingText}
                        />
                      </div>
                    </div>
                  ) : messages.length > 0 ? (
                    <div className="bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl p-6">
                      <div className="space-y-3">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`p-3 rounded-lg ${
                              message.role === "user"
                                ? "bg-blue-500/20 text-blue-100"
                                : "bg-slate-800 text-slate-200"
                            }`}
                          >
                            <div
                              className="text-sm"
                              dangerouslySetInnerHTML={{
                                __html: message.content
                                  .replace(/```[\s\S]*?```/g, "")
                                  .replace(
                                    /\*\*(.*?)\*\*/g,
                                    "<strong>$1</strong>"
                                  )
                                  .replace(/\n/g, "<br>"),
                              }}
                            />

                            {/* Collapsible Sources Section */}
                            {message.sources && message.sources.length > 0 && (
                              <div className="mt-2">
                                <button
                                  onClick={() =>
                                    setExpandedSources((prev) => ({
                                      ...prev,
                                      [message.id]: !prev[message.id],
                                    }))
                                  }
                                  aria-controls={`sources-content-${message.id}`}
                                  aria-expanded={!!expandedSources[message.id]}
                                  className="inline-flex items-center gap-2 text-sm px-2 py-1 bg-slate-800/30 border border-slate-700 rounded-md text-slate-200 hover:bg-slate-800/60 transition-colors"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-4 h-4 text-slate-300"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <span>
                                    {expandedSources[message.id]
                                      ? "Skrýt zdroje"
                                      : "Zobrazit zdroje"}
                                  </span>
                                </button>
                                {expandedSources[message.id] && (
                                  <div
                                    id={`sources-content-${message.id}`}
                                    className="mt-2 pl-4 text-sm text-slate-400"
                                  >
                                    <div className="flex flex-wrap gap-2">
                                      {message.sources.map((source, index) => (
                                        <div key={index}>
                                          {renderSourceLink(source)}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <AnalysisForm
                      onSubmit={handleAnalysisSubmit}
                      onCancel={handleAnalysisCancel}
                      isLoading={isLoading}
                      showCancelButton={hasCompletedAnalysis}
                    />
                  )}
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
                <div className="space-y-8 lg:pt-8">
                  {/* Heading - desktop only */}
                  <div className="space-y-4 hidden lg:block">
                    <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                      Zjisti, kde{" "}
                      <RotatingText
                        words={["otevřít", "vydělat", "začít", "růst"]}
                        className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600"
                        typingSpeed={80}
                        deletingSpeed={40}
                        delayBetweenWords={2500}
                      />
                    </h1>
                    <p className="text-lg text-slate-400 leading-relaxed">
                      Spotonaut využívá pokročilou AI analýzu k vyhodnocení
                      potenciálu vaší lokality.{" "}
                      <b className="text-white">Zaregistrujte se zdarma</b> a
                      využijte tak možnost zhodnotit výsledná data s naším{" "}
                      <b className="text-white">AI asistentem!</b>
                    </p>
                  </div>

                  {/* Features Grid */}
                  <div className="grid sm:grid-cols-2 gap-3 lg:max-h-100 lg:overflow-y-auto lg:pr-4">
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 text-left">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-3">
                        <svg
                          className="w-6 h-6 text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 10h8"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 13h5"
                          />
                        </svg>
                      </div>
                      <h3 className="text-white font-semibold mb-1">
                        AI Asistent
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Pokročilé zhodnocení výsledků pomocí chatbota.
                      </p>
                    </div>

                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 text-left">
                      <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-3">
                        <svg
                          className="w-6 h-6 text-purple-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-white font-semibold mb-1">
                        Lokalita
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Integrace reálných mapových dat.
                      </p>
                    </div>

                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 text-left">
                      <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mb-3">
                        <svg
                          className="w-6 h-6 text-green-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-white font-semibold mb-1">
                        Rychlost
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Výsledky do pár minut.
                      </p>
                    </div>

                    {/* Planned / Coming soon features */}
                    <div className="bg-slate-900/20 border border-dashed border-slate-700/30 rounded-lg p-4 text-left opacity-90">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-700/10 to-slate-600/10 rounded-lg flex items-center justify-center mb-3">
                          <svg
                            className="w-6 h-6 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 20a8 8 0 100-16 8 8 0 000 16z"
                            />
                          </svg>
                        </div>
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gradient-to-r from-slate-700/40 to-slate-700/20 text-slate-200">
                          Plánováno
                        </span>
                      </div>
                      <h3 className="text-white font-semibold mb-1">
                        Export reportů
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Export analýz do PDF/CSV pro sdílení a archivaci (brzy).
                      </p>
                    </div>

                    <div className="bg-slate-900/20 border border-dashed border-slate-700/30 rounded-lg p-4 text-left opacity-90">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-700/10 to-slate-600/10 rounded-lg flex items-center justify-center mb-3">
                          <svg
                            className="w-6 h-6 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16l-4-4m0 0l4-4M3 12h18"
                            />
                          </svg>
                        </div>
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gradient-to-r from-slate-700/40 to-slate-700/20 text-slate-200">
                          Plánováno
                        </span>
                      </div>
                      <h3 className="text-white font-semibold mb-1">
                        Porovnání lokací
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Analyzujte a porovnávejte více lokalit najednou (brzy).
                      </p>
                    </div>

                    <div className="bg-slate-900/20 border border-dashed border-slate-700/30 rounded-lg p-4 text-left opacity-90">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-700/10 to-slate-600/10 rounded-lg flex items-center justify-center mb-3">
                          <svg
                            className="w-6 h-6 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gradient-to-r from-slate-700/40 to-slate-700/20 text-slate-200">
                          Plánováno
                        </span>
                      </div>
                      <h3 className="text-white font-semibold mb-1">
                        Odhad tržeb
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Získejte odhadované tržby pro vaši lokalitu na základě
                        zvolených parametrů (brzy).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form - desktop only */}
                <div className="relative hidden lg:block">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20"></div>
                  <div className="relative">
                    {isLoading ? (
                      <div className="bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl p-8 min-h-[600px] flex flex-col items-center justify-center">
                        <div className="mb-8">
                          <Image
                            src="/spotonaut_character.svg"
                            alt="Spotonaut"
                            width={140}
                            height={140}
                            className="w-36 h-36 animate-pulse"
                          />
                        </div>
                        <div className="w-full max-w-md space-y-6">
                          <AnalysisProgress
                            currentStep={progressStep}
                            streamingText={streamingText}
                          />
                        </div>
                      </div>
                    ) : messages.length > 0 ? (
                      <div className="bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl p-6">
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={`p-3 rounded-lg ${
                                message.role === "user"
                                  ? "bg-blue-500/20 text-blue-100"
                                  : "bg-slate-800 text-slate-200"
                              }`}
                            >
                              <div
                                className="text-sm"
                                dangerouslySetInnerHTML={{
                                  __html: message.content
                                    .replace(/```[\s\S]*?```/g, "")
                                    .replace(
                                      /\*\*(.*?)\*\*/g,
                                      "<strong>$1</strong>"
                                    )
                                    .replace(/\n/g, "<br>"),
                                }}
                              />

                              {/* Collapsible Sources Section */}
                              {/* {message.sources &&
                                message.sources.length > 0 && (
                                  <div className="mt-2">
                                    <button
                                      onClick={() =>
                                        setExpandedSources((prev) => ({
                                          ...prev,
                                          [message.id]: !prev[message.id],
                                        }))
                                      }
                                      aria-controls={`sources-content-${message.id}`}
                                      aria-expanded={
                                        !!expandedSources[message.id]
                                      }
                                      className="text-blue-500 underline text-sm"
                                    >
                                      {expandedSources[message.id]
                                        ? "Skrýt zdroje"
                                        : "Zobrazit zdroje"}
                                    </button>
                                    {expandedSources[message.id] && (
                                      <div
                                        id={`sources-content-${message.id}`}
                                        className="mt-2 pl-4 text-sm text-slate-400"
                                      >
                                        <div className="flex flex-wrap gap-2">
                                          {message.sources.map(
                                            (source, index) => (
                                              <div key={index}>
                                                {renderSourceLink(source)}
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )} */}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <AnalysisForm
                        onSubmit={handleAnalysisSubmit}
                        onCancel={handleAnalysisCancel}
                        isLoading={isLoading}
                        showCancelButton={hasCompletedAnalysis}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      )}
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authModalMode}
      />
      {/* Request More Prompts Modal */}
      <RequestMorePromptsModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-2">
                  Zahájit novou analýzu?
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Spuštění nové analýzy smaže aktuální výsledky a historii
                  konverzace. Tato akce je nevratná.
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-full transition-all border border-slate-700"
              >
                Zrušit
              </button>
              <button
                onClick={confirmNewAnalysis}
                className="flex-1 px-4 py-2.5 bg-gradient-to-br from-blue-500 via-blue-600/100 to-blue-800 border border-blue-600/20 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-full transition-all shadow-lg"
              >
                Pokračovat
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-2">
                  Zahájit novou analýzu?
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Spuštění nové analýzy smaže aktuální výsledky a historii
                  konverzace. Tato akce je nevratná.
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 px-4 py-2.5 bg-slate-800 cursor-pointer hover:bg-slate-700 text-white font-medium rounded-full transition-all border border-slate-700"
              >
                Zrušit
              </button>
              <button
                onClick={confirmNewAnalysis}
                className="flex-1 px-4 py-2.5 bg-gradient-to-br from-blue-500 via-blue-600/100 to-blue-800 border border-blue-600/20 cursor-pointer hover:from-blue-400 hover:to-blue-600 text-white font-medium rounded-full transition-all shadow-lg"
              >
                Pokračovat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => {
          dismissFeedback();
          // If there was a pending new analysis, proceed with it
          if (pendingNewAnalysis) {
            setPendingNewAnalysis(false);
            if (hasCompletedAnalysis) {
              setShowConfirmDialog(true);
            } else {
              navigateHome();
            }
          }
        }}
        onSubmit={async (rating, comment, feedbackType) => {
          try {
            await submitFeedback(rating, comment, feedbackType);
            // If there was a pending new analysis, proceed with it after successful submission
            if (pendingNewAnalysis) {
              setPendingNewAnalysis(false);
              if (hasCompletedAnalysis) {
                setShowConfirmDialog(true);
              } else {
                navigateHome();
              }
            }
          } catch (error) {
            // Error handling is done in submitFeedback
            throw error;
          }
        }}
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} onDismiss={() => showToast("")} />
    </div>
  );
}
