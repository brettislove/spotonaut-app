"use client";

import { useState, useRef, useEffect } from "react";
import AnalysisForm from "./analysis-form";
import MapView from "./map-view";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AnalysisFormData {
  location: string;
  productType: "coffee" | "snacks" | "cold_drinks";
  operatingHours: number;
  avgSpend: number;
  timeframe: "day" | "week" | "month" | "year";
}

interface AnalysisData {
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  metrics?: {
    dailyRevenue: number;
    weeklyRevenue: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    dailyFootTraffic: number;
    conversionRate: number;
    competitorCount: number;
  };
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAnalysisForm, setShowAnalysisForm] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Check if user is requesting analysis
    const analysisKeywords = [
      "analýza",
      "analyzuj",
      "vyhodnoť",
      "spočítej",
      "projekce",
      "odhad",
      "příjem",
      "výnos",
    ];

    const isAnalysisRequest = analysisKeywords.some((keyword) =>
      input.toLowerCase().includes(keyword)
    );

    if (isAnalysisRequest) {
      // Show the form instead of sending to chat
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setShowAnalysisForm(true);
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

  const handleAnalysisSubmit = async (data: AnalysisFormData) => {
    setShowAnalysisForm(false);
    setIsLoading(true);

    try {
      const response = await fetch("/api/analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to get analysis");
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
        setAnalysisData(result.data);
        setShowMapView(true);
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
  };

  const handleAnalysisCancel = () => {
    setShowAnalysisForm(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Map View - Left Side */}
      <div
        className={`h-screen p-8 transition-all duration-700 ease-in-out relative z-10 ${
          showMapView ? "w-1/2 opacity-100" : "w-0 opacity-0 overflow-hidden"
        }`}
      >
        {showMapView && analysisData && (
          <div className="h-full">
            <MapView data={analysisData} />
          </div>
        )}
      </div>

      {/* Chat Interface - Right Side */}
      <main
        className={`flex flex-col h-screen py-8 px-4 relative z-10 transition-all duration-700 ease-in-out ${
          showMapView ? "w-1/2" : "w-full max-w-4xl mx-auto"
        }`}
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Spotonaut Assistant
            </span>
          </h1>
          <p className="text-slate-400">Váš inteligentní AI společník</p>
        </div>

        {/* Chat container */}
        <div className="flex-1 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {showAnalysisForm ? (
              <AnalysisForm
                onSubmit={handleAnalysisSubmit}
                onCancel={handleAnalysisCancel}
                isLoading={isLoading}
              />
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-2xl">
                  <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-7 h-7 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <p className="text-slate-300 font-semibold mb-2">
                    Začněte konverzaci
                  </p>
                  <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                    Pošlete zprávu a začněte chatovat s naším AI asistentem
                  </p>

                  {/* Hints section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 text-left">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg
                            className="w-4 h-4 text-blue-400"
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
                        <div>
                          <h3 className="text-slate-200 font-medium text-sm mb-1">
                            Analýza lokality
                          </h3>
                          <p className="text-slate-500 text-xs">
                            Zadejte adresu nebo místo pro získání podrobné
                            analýzy návštěvnosti a potenciálu
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 text-left">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg
                            className="w-4 h-4 text-purple-400"
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
                        <div>
                          <h3 className="text-slate-200 font-medium text-sm mb-1">
                            Projekce příjmů
                          </h3>
                          <p className="text-slate-500 text-xs">
                            Získejte odhady denních, týdenních a měsíčních
                            příjmů pro váš podnik
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 text-left">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-pink-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg
                            className="w-4 h-4 text-pink-400"
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
                        <div>
                          <h3 className="text-slate-200 font-medium text-sm mb-1">
                            Analýza konkurence
                          </h3>
                          <p className="text-slate-500 text-xs">
                            Zjistěte počet, blízkost a dopad konkurence v okolí
                            vaší lokality
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 text-left">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg
                            className="w-4 h-4 text-cyan-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-slate-200 font-medium text-sm mb-1">
                            Cenová strategie
                          </h3>
                          <p className="text-slate-500 text-xs">
                            Doporučení optimálních cen a strategie pro
                            maximalizaci zisku
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl px-6 py-4 ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                          : "bg-slate-800/50 border border-slate-700 text-slate-300"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl px-6 py-4">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        <div
                          className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        />
                        <div
                          className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"
                          style={{ animationDelay: "0.4s" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input form */}
          <form onSubmit={sendMessage} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 bg-slate-900/50 border border-slate-700 text-white placeholder-slate-400 rounded-xl px-6 py-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold px-8 py-4 rounded-xl hover:from-blue-600 hover:to-purple-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Odeslat
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
