"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AnalysisForm from "./analysis-form";
import AuthModal from "./auth-modal";
import Toast from "./toast";
import RotatingText from "./ui/rotating-text";
import AnalysisProgress, { type ProgressStep } from "./analysis-progress";
import { useAnalysis } from "@/lib/contexts/analysis-context";
import Image from "next/image";
import type { BusinessType } from "@/lib/constants/business-types";
import { useRateLimit } from "@/lib/hooks/useRateLimit";
import { useChat } from "@/lib/hooks/useChat";

export interface Message {
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

export default function ChatInterface() {
  const { data: session } = useSession();
  const router = useRouter();
  const {
    messages,
    setMessages,
    setAnalysisData,
    hasCompletedAnalysis,
    setHasCompletedAnalysis,
    setIsAnalyzing,
    setShowMapView,
    showAnalysisForm,
    setShowAnalysisForm,
    fingerprint,
    clearRestoredState,
    toastMessage,
    showToast,
  } = useAnalysis();
  const {
    setInput,
    isLoading,
    setIsLoading,
    showAuthModal,
    setShowAuthModal,
    authModalMode,
    setAuthModalMode,
  } = useChat();
  const { checkRateLimit } = useRateLimit();
  const [isMobile, setIsMobile] = useState(false);
  const [pendingAnalysisData, setPendingAnalysisData] =
    useState<AnalysisFormData | null>(null);
  const [progressStep, setProgressStep] = useState<ProgressStep>("geocoding");
  const [streamingText, setStreamingText] = useState("");
  const [, setStreamingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Ensure form is shown when component mounts on home page
  useEffect(() => {
    setShowAnalysisForm(true);
  }, [setShowAnalysisForm]);

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
    setInput,
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      setIsAnalyzing(true);
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
                          : msg,
                      ),
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
                          : msg,
                      ),
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
                      // Navigate to analysis page
                      router.push("/analysis");
                    }

                    setStreamingText("");
                    setStreamingMessageId(null);
                    setProgressStep("complete");
                    setIsAnalyzing(false);
                  } else if (data.type === "error") {
                    throw new Error(
                      data.error || data.details || "Analysis failed",
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
            setIsAnalyzing(false);
            // Navigate to analysis page
            router.push("/analysis");
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
        setIsAnalyzing(false);
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
      setAuthModalMode,
      setIsLoading,
      setIsAnalyzing,
      setShowMapView,
      setShowAuthModal,
      setHasCompletedAnalysis,
      setShowAnalysisForm,
      router,
    ],
  );

  // Homepage: Form-only view
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 font-sans relative overflow-hidden">
      {/* Moon background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="w-full h-full relative">
          <Image
            src="/Moon.png"
            alt="Moon"
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>
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
                Spotonaut využívá pokročilou AI analýzu k vyhodnocení potenciálu
                vaší lokality.{" "}
                <b className="text-white">Zaregistrujte se zdarma</b> a využijte
                tak možnost zhodnotit výsledná data s naším{" "}
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
                ) : (
                  <AnalysisForm
                    onSubmit={handleAnalysisSubmit}
                    isLoading={isLoading}
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
                    <h3 className="text-white font-semibold mb-1">Lokalita</h3>
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
                    <h3 className="text-white font-semibold mb-1">Rychlost</h3>
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
                  ) : (
                    <AnalysisForm
                      onSubmit={handleAnalysisSubmit}
                      isLoading={isLoading}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authModalMode}
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} onDismiss={() => showToast("")} />
    </div>
  );
}
