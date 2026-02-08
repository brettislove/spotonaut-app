import { useSession } from "next-auth/react";
import { useState } from "react";
import ChatPanel from "../chat/chat-panel";
import { AnalysisData } from "@/lib/types/analysis";
import MetricsPanel from "../metrics-panel";

export default function AnalysisResultsMobile({
  analysisData,
}: {
  analysisData: AnalysisData;
}) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"metrics" | "chat">("metrics");
  const [, setIsExpanded] = useState(false);

  // Handle tab change and expand for chat
  const handleTabChange = (tab: "metrics" | "chat") => {
    setActiveTab(tab);
    // When switching to chat, collapse the map and hide it
    if (tab === "chat") {
      setIsExpanded(false);
    }
  };

  return (
    <div className="fixed inset-0 top-18 flex flex-col overflow-hidden">
      {/* Fixed Map Area - only render for Metrics tab */}
      {activeTab === "metrics" && null}

      {/* Bottom Panel - No Vaul, just a simple fixed panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab Content - Single Scrollable Region */}
        <div className="relative flex-1 overflow-y-auto overscroll-contain">
          {activeTab === "metrics" ? (
            <MetricsPanel
              analysisData={analysisData}
              className="h-full pb-[68px] border-none"
            />
          ) : (
            <ChatPanel
              analysisData={analysisData}
              className="h-full pb-[68px] -translate-y-2 bg-background border-none"
            />
          )}
        </div>

        {/* Mobile fixed bottom bar with centered toggle (visible on small screens) */}
        <div className="fixed left-0 right-0 bottom-0 lg:hidden z-50">
          <div className="bg-background backdrop-blur-sm px-4 py-3">
            <div className="flex flex-col items-center gap-3 w-full">
              {/* Chat input shown here on mobile when Chat tab is active */}
              {activeTab === "chat" && null}

              <div>
                {/* New Analysis Button */}

                <button
                  onClick={() => {}}
                  className="absolute left-1/12 translate-y-1/6 px-3 py-1.5 transition-all flex items-center"
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

                {/* Three-dot button for extra functions. Disabled for all users except admins. */}
                <button
                  disabled={session?.user?.email !== "crew@spotonaut.com"}
                  onClick={() => {}}
                  className="absolute right-1/12 translate-y-1/6 px-3 py-0.5 text-slate-300 disabled:text-slate-600"
                  aria-label="Open extra functions drawer"
                >
                  <svg
                    className="w-7 h-7"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <circle cx="6" cy="12" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="18" cy="12" r="1.5" />
                  </svg>
                </button>

                {/* Tab Toggle Button */}
                <div className="relative flex items-center gap-2">
                  <div
                    role="tablist"
                    aria-label="Přepnout mezi metrikami a chatem"
                    className="relative w-44 h-11 bg-card border border-border rounded-full p-1 flex items-center"
                  >
                    <button
                      type="button"
                      onClick={() => handleTabChange("metrics")}
                      aria-pressed={activeTab === "metrics"}
                      className="z-20 flex-1 text-sm font-medium text-center transition-colors text-white"
                    >
                      Metriky
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabChange("chat")}
                      aria-pressed={activeTab === "chat"}
                      className="z-20 flex-1 text-sm font-medium text-center transition-colors text-white"
                    >
                      Chat
                    </button>

                    {/* Sliding knob (half width) */}
                    <div
                      aria-hidden
                      className={`absolute inset-y-1 left-1 w-[calc(50%_-_0.25rem)] rounded-full bg-primary opacity-80 shadow-lg transform transition-transform duration-300 pointer-events-none ${
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
    </div>
  );
}
