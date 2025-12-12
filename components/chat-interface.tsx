"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import AnalysisForm from "./analysis-form";
import AuthModal from "./auth-modal";
import AnalysisResultsMobile from "./analysis-results-mobile";
import MapView from "./map-view";
import RotatingText from "./ui/rotating-text";
import SwitchingText from "./ui/switching-text";
import { useAnalysis } from "@/lib/contexts/analysis-context";
import Image from "next/image";
import type { BusinessType } from "@/lib/constants/business-types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AnalysisFormData {
  location: string;
  businessType: BusinessType;
  operatingHours: number;
  timeframe: "day" | "week" | "month" | "year";
}

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
    if (requestTimestamps.current.length >= 5) {
      return false;
    }

    // Add current timestamp
    requestTimestamps.current.push(now);
    return true;
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !hasCompletedAnalysis) return;

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
      setAuthModalMode("login");
      setShowAuthModal(true);
      return;
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

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to get response");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
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

      try {
        const response = await fetch("/api/analysis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            fingerprint,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          // Check if it's a usage limit error
          if (response.status === 403 && result.requiresAuth) {
            setAuthModalMode("signup");
            setShowAuthModal(true);
            setShowAnalysisForm(true);
            return;
          }
          throw new Error(result.error || "Failed to get analysis");
        }

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
          });
          setShowMapView(true);
          setHasCompletedAnalysis(true);
          // Hide form only after successful analysis
          setShowAnalysisForm(false);
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
    navigateHome();
  };

  // Mobile Results View
  if (showMapView && isMobile && analysisData) {
    return (
      <>
        <AnalysisResultsMobile
          analysisData={analysisData}
          messages={messages}
          input={input}
          isLoading={isLoading}
          onInputChange={setInput}
          onSendMessage={sendMessage}
          onNewAnalysis={handleNewAnalysis}
        />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authModalMode}
        />
      </>
    );
  }

  // Desktop/Tablet View
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 font-sans relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

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
                    className="relative cursor-pointer px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 overflow-hidden group"
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
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                            : "bg-slate-800 text-slate-100 border border-slate-700"
                        }`}
                      >
                        <div
                          className="text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: message.content
                              .replace(/```[\s\S]*?```/g, "")
                              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                              .replace(/\n/g, "<br>"),
                          }}
                        />
                        <div
                          className={`text-xs mt-2 ${
                            message.role === "user"
                              ? "text-blue-100/70"
                              : "text-slate-500"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString("cs-CZ", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
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
                        disabled={isLoading}
                        maxLength={MAX_MESSAGE_LENGTH}
                        className="flex-1 bg-slate-800/50 border border-slate-600 text-white placeholder-slate-400 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all disabled:opacity-50"
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                  potenciálu vaší lokality. Získejte data o návštěvnosti,
                  konkurenci a odhadovaných tržbách během několika sekund.
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
                      <div className="text-center space-y-4">
                        <h3 className="text-2xl font-bold text-white">
                          <SwitchingText
                            words={[
                              "Analyzuji lokalitu...",
                              "Zjišťuji hustotu provozu...",
                              "Mapuji konkurenci...",
                              "Počítám potenciální tržby...",
                              "Vyhodnocuji data...",
                            ]}
                            className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600"
                            interval={3000}
                          />
                        </h3>
                        <p className="text-slate-400 text-sm max-w-md">
                          Náš AI agent zpracovává vaše data a připravuje
                          komplexní analýzu lokality.
                        </p>
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
                            <div className="text-sm">
                              {message.content.substring(0, 150)}
                              {message.content.length > 150 ? "..." : ""}
                            </div>
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
                      potenciálu vaší lokality. Získejte data o návštěvnosti,
                      konkurenci a odhadovaných tržbách během několika sekund.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
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
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-white font-semibold mb-1">
                        AI Analýza
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Pokročilé algoritmy pro přesné výsledky
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
                        Hodnocení potenciálu vybrané oblasti
                      </p>
                    </div>

                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 text-left">
                      <div className="w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center mb-3">
                        <svg
                          className="w-6 h-6 text-pink-400"
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
                      <h3 className="text-white font-semibold mb-1">Tržby</h3>
                      <p className="text-slate-400 text-sm">
                        Odhad potenciálních příjmů
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
                        Výsledky během několika sekund
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
                        <div className="text-center space-y-4">
                          <h3 className="text-3xl font-bold text-white">
                            <SwitchingText
                              words={[
                                "Analyzuji lokalitu...",
                                "Zjišťuji hustotu provozu...",
                                "Mapuji konkurenci...",
                                "Počítám potenciální tržby...",
                                "Vyhodnocuji data...",
                              ]}
                              className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600"
                              interval={3000}
                            />
                          </h3>
                          <p className="text-slate-400 max-w-md">
                            Náš AI agent zpracovává vaše data a připravuje
                            komplexní analýzu lokality.
                          </p>
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
    </div>
  );
}
