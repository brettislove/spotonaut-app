"use client";

import { useState, useRef, useEffect } from "react";
import MapView from "./map-view";
import { GroundingSources } from "./grounding-sources";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: Array<{ title: string; uri: string }>;
}

interface AnalysisData {
  location: string;
  locationName: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  metrics?: {
    localityScore: number;
    footfallScore: number;
    recommendedHours: string;
  };
  sources?: Array<{ title: string; uri: string }>;
}

interface AnalysisResultsMobileProps {
  analysisData: AnalysisData;
  messages: Message[];
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  onNewAnalysis?: () => void;
}

export default function AnalysisResultsMobile({
  analysisData,
  messages,
  input,
  isLoading,
  onInputChange,
  onSendMessage,
  onNewAnalysis,
}: AnalysisResultsMobileProps) {
  const [activeTab, setActiveTab] = useState<"metrics" | "chat">("metrics");
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputFocus = () => setIsExpanded(true);

  // Handle tab change and expand for chat
  const handleTabChange = (tab: "metrics" | "chat") => {
    setActiveTab(tab);
    // When switching to chat, collapse the map and hide it
    if (tab === "chat") {
      setIsExpanded(false);
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (activeTab === "chat" && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, activeTab]);

  const formatMessage = (content: string) => {
    let formatted = content.replace(/```[\s\S]*?```/g, "");
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    formatted = formatted.replace(/\n/g, "<br>");
    return formatted;
  };

  return (
    <div className="fixed inset-0 top-16 flex flex-col bg-slate-950 overflow-hidden">
      {/* Fixed Map Area - only render for Metrics tab */}
      {activeTab === "metrics" && (
        <div className="absolute inset-0 h-[35vh] transition-all duration-300 ease-out relative flex-shrink-0">
          <MapView data={analysisData} />
        </div>
      )}

      {/* Bottom Panel - No Vaul, just a simple fixed panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab Content - Single Scrollable Region */}
        <div className="relative flex-1 overflow-y-auto overscroll-contain pb-28 lg:pb-0">
          {activeTab === "metrics" ? (
            <MetricsTab data={analysisData} />
          ) : (
            <ChatTab
              messages={messages}
              input={input}
              isLoading={isLoading}
              onInputChange={onInputChange}
              onSendMessage={onSendMessage}
              messagesEndRef={messagesEndRef}
              formatMessage={formatMessage}
              onInputFocus={() => setIsExpanded(true)}
            />
          )}

          {/* Gradient overlay so messages fade behind the mobile bottom bar */}
          {activeTab === "chat" && (
            <div className="fixed pointer-events-none absolute left-0 right-0 bottom-20 h-18 z-40 lg:hidden bg-gradient-to-t from-slate-900 to-transparent" />
          )}
        </div>

        {/* Mobile fixed bottom bar with centered toggle (visible on small screens) */}
        <div className="fixed left-0 right-0 bottom-0 lg:hidden z-50">
          <div className="bg-slate-900/95 backdrop-blur-sm px-4 py-3">
            <div className="flex flex-col items-center gap-3 w-full">
              {/* Chat input shown here on mobile when Chat tab is active */}
              {activeTab === "chat" && (
                <form
                  onSubmit={onSendMessage}
                  className="w-full max-w-xl flex items-center gap-2 px-1"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => onInputChange(e.target.value)}
                    onFocus={handleInputFocus}
                    placeholder="Napište zprávu..."
                    disabled={isLoading}
                    className="flex-1 bg-slate-800 border border-slate-600 text-white placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="px-3 py-2.5 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px]"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </form>
              )}

              <div>
                {onNewAnalysis && (
                  <button
                    onClick={onNewAnalysis}
                    className="absolute left-1/12 translate-y-1/6 px-3 py-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 hover:border-blue-500/50 rounded-lg transition-all flex items-center gap-1.5"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="white"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                )}

                <div
                  role="tablist"
                  aria-label="Přepnout mezi metrikami a chatem"
                  className="relative w-44 h-11 bg-slate-800/80 border border-slate-700 rounded-full p-1 flex items-center"
                >
                  <button
                    type="button"
                    onClick={() => handleTabChange("metrics")}
                    aria-pressed={activeTab === "metrics"}
                    className={`z-20 flex-1 text-sm font-medium text-center transition-colors ${
                      activeTab === "metrics" ? "text-white" : "text-slate-300"
                    }`}
                  >
                    Metriky
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange("chat")}
                    aria-pressed={activeTab === "chat"}
                    className={`z-20 flex-1 text-sm font-medium text-center transition-colors ${
                      activeTab === "chat" ? "text-white" : "text-slate-300"
                    }`}
                  >
                    Chat
                  </button>

                  {/* Sliding knob (half width) */}
                  <div
                    aria-hidden
                    className={`absolute inset-y-1 left-1 w-[calc(50%_-_0.25rem)] rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 opacity-80 shadow-lg transform transition-transform duration-300 pointer-events-none ${
                      activeTab === "chat"
                        ? "translate-x-full"
                        : "translate-x-0"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Metrics Tab Component
function MetricsTab({ data }: { data: AnalysisData }) {
  if (!data.metrics) return null;

  return (
    <div className="p-4 space-y-4">
      {/* Location Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-white font-semibold text-lg mb-1 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-400 flex-shrink-0"
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
            {data.locationName || data.location}
          </h2>
          {/* <p className="text-slate-400 text-sm">Analýza lokality</p> */}
        </div>
        {/* {onNewAnalysis && (
          <button
            onClick={onNewAnalysis}
            className="px-3 py-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500/50 rounded-lg transition-all flex items-center gap-1.5"
          >
            <svg
              className="w-3.5 h-3.5"
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
            Nová
          </button>
        )} */}
      </div>

      {/* Metrics Cards */}
      <div className="space-y-3">
        {/* Locality Score - Blue */}
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-blue-300 text-sm font-medium">
              Hodnocení lokality
            </div>
            <div className="flex items-center gap-2">
              <div className="text-white font-bold text-3xl">
                {data.metrics.localityScore}
              </div>
              <div className="text-blue-400 text-lg">/ 100</div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-700"
              style={{ width: `${data.metrics.localityScore}%` }}
            />
          </div>
          <p className="mt-2 text-blue-200/70 text-xs">
            Celkové hodnocení vhodnosti lokality pro podnikání
          </p>
        </div>

        {/* Footfall Score - Purple */}
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-purple-300 text-sm font-medium">
              Průchodnost
            </div>
            <div className="flex items-center gap-2">
              <div className="text-white font-bold text-3xl">
                {data.metrics.footfallScore}
              </div>
              <div className="text-purple-400 text-lg">/ 100</div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-700"
              style={{ width: `${data.metrics.footfallScore}%` }}
            />
          </div>
          <p className="mt-2 text-purple-200/70 text-xs">
            Odhad průměrné denní průchodnosti v oblasti
          </p>
        </div>

        {/* Recommended Hours - Pink */}
        <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 rounded-xl p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="text-pink-300 text-sm font-medium">
              Doporučené hodiny
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-7 h-7 text-pink-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-white font-bold text-3xl">
                {data.metrics.recommendedHours}
              </div>
            </div>
          </div>
          <p className="mt-2 text-pink-200/70 text-xs">
            Optimální provozní doba pro maximalizaci tržeb
          </p>
        </div>
      </div>

      {/* Grounding Sources */}
      {data.sources && data.sources.length > 0 && (
        <GroundingSources sources={data.sources} />
      )}

      {/* Additional Info */}
      {/* <div className="pt-2 pb-4">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h4 className="text-white text-sm font-medium mb-1">
                Potřebujete detailnější informace?
              </h4>
              <p className="text-slate-400 text-xs">
                Přejděte do chatu a zeptejte se na konkurenci, demografii, nebo
                doporučení pro konkrétní typ podnikání.
              </p>
            </div>
          </div>
        </div>
      </div> */}
      {/* Mobile-only AI disclaimer (non-interactive) */}
      <div className=" bottom-20 transform text-xs text-slate-300 px-3 py-1 z-50 text-center pointer-events-none lg:hidden">
        Výsledky jsou založeny na AI a slouží pouze pro informační účely —
        nemusí být přesné ani úplné.
      </div>
    </div>
  );
}

// Chat Tab Component
function ChatTab({
  messages,
  input,
  isLoading,
  onInputChange,
  onSendMessage,
  messagesEndRef,
  formatMessage,
  onInputFocus,
}: {
  messages: Message[];
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  formatMessage: (content: string) => string;
  onInputFocus?: () => void;
}) {
  return (
    <div className="flex flex-col min-h-0 bg-slate-900">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-blue-400"
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
            <h3 className="text-white font-semibold text-base mb-2">
              Začněte konverzaci
            </h3>
            <p className="text-slate-400 text-sm">
              Zeptejte se na detaily o lokalitě, konkurenci, nebo získejte
              doporučení pro váš typ podnikání.
            </p>
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
                {message.role === "user" ? (
                  <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-gradient-to-b from-purple-500 via-purple-600 to-purple-700 text-white">
                    <div
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: formatMessage(message.content),
                      }}
                    />
                  </div>
                ) : (
                  // Assistant messages: render as plain text on the app background (no bubble)
                  <div className="mx-3 text-slate-200 text-sm leading-relaxed prose-invert">
                    <b>Asistent:</b>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: formatMessage(message.content),
                      }}
                    />
                    {/* <div className="text-xs mt-2 text-slate-500">
                      {message.timestamp.toLocaleTimeString("cs-CZ", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div> */}
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
                    <span className="text-slate-400 text-sm">Přemýšlím...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Chat Input - Fixed at bottom (desktop only). Hidden on mobile because mobile input is rendered inside the fixed bottom bar */}
      <div className="hidden lg:flex-shrink-0 lg:flex lg:border-t lg:border-slate-700/50 lg:p-3 lg:bg-slate-900">
        <form onSubmit={onSendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onFocus={onInputFocus}
            placeholder="Napište zprávu..."
            disabled={isLoading}
            className="flex-1 bg-slate-800 border border-slate-600 text-white placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px]"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
