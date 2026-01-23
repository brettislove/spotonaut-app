"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/auth-modal";
import FeedbackModal from "@/components/feedback-modal";
import Toast from "@/components/toast";
import RequestMorePromptsModal from "@/components/request-more-prompts-modal";
import AnalysisResultsMobile from "@/components/analysis-results-mobile";
import MapView from "@/components/map-view";
import { useAnalysis } from "@/lib/contexts/analysis-context";
import Image from "next/image";
import { renderSourceLink } from "@/components/grounding-sources";
import { FiThumbsUp, FiThumbsDown } from "react-icons/fi";
import { MAX_MESSAGE_LENGTH } from "@/lib/constants/chat";
import { useChat } from "@/lib/hooks/useChat";
import ConfirmationDialog from "@/components/chat/ConfirmationDialog";
import { handleFeedback, showAuthModalAction } from "@/utils/chat";

export default function AnalysisPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const {
    messages,
    analysisData,
    hasCompletedAnalysis,
    showFeedbackModal,
    toastMessage,
    triggerFeedbackIfEligible,
    dismissFeedback,
    submitFeedback,
    showToast,
    navigateHome,
  } = useAnalysis();

  const {
    input,
    setInput,
    isLoading,
    showAuthModal,
    setShowAuthModal,
    authModalMode,
    setAuthModalMode,
    showRequestModal,
    setShowRequestModal,
    sendMessage,
    requestPending,
  } = useChat();

  const [isMobile, setIsMobile] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingNewAnalysis, setPendingNewAnalysis] = useState(false);
  const [expandedSources, setExpandedSources] = useState<
    Record<string, boolean>
  >({});
  const [feedbackMap, setFeedbackMap] = useState<Record<string, "up" | "down">>(
    {},
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect to home if no analysis data
  useEffect(() => {
    if (!hasCompletedAnalysis || !analysisData) {
      router.replace("/");
    }
  }, [hasCompletedAnalysis, analysisData, router]);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewAnalysis = () => {
    const feedbackShown = triggerFeedbackIfEligible();

    if (feedbackShown) {
      setPendingNewAnalysis(true);
      return;
    }

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

  // Don't render anything while redirecting
  if (!hasCompletedAnalysis || !analysisData) {
    return null;
  }

  // Mobile Results View
  if (isMobile) {
    return (
      <>
        <AnalysisResultsMobile
          session={session}
          analysisData={analysisData}
          messages={messages}
          input={input}
          isLoading={isLoading}
          onStartChat={() =>
            showAuthModalAction(setAuthModalMode, setShowAuthModal)
          }
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
              if (pendingNewAnalysis) {
                setPendingNewAnalysis(false);
                if (hasCompletedAnalysis) {
                  setShowConfirmDialog(true);
                } else {
                  navigateHome();
                }
              }
            } catch (error) {
              throw error;
            }
          }}
        />
        <ConfirmationDialog
          isOpen={showConfirmDialog}
          setShowConfirmDialog={setShowConfirmDialog}
          confirmNewAnalysis={confirmNewAnalysis}
        />
        <Toast message={toastMessage} onDismiss={() => showToast("")} />
      </>
    );
  }

  // Desktop/Tablet View
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

      {/* Persistent AI disclaimer */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-slate-300 px-3 py-1 z-50 max-w-[90%] text-center pointer-events-none">
        Výsledky jsou založeny na AI a slouží pouze pro informační účely —
        nemusí být přesné ani úplné.
      </div>

      <div className="flex items-center justify-center h-[calc(100vh-4rem)] p-4 lg:p-8">
        <div className="w-full max-w-6xl h-full flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Map View with Chat Sidebar */}
          <div className="flex-1 flex flex-col lg:flex-row bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden">
            {/* Map Content */}
            <div className="w-full lg:w-1/2 p-4 lg:p-6 overflow-hidden">
              <MapView data={analysisData} />
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
                            __html: message.content
                              .replace(/```[\s\S]*?```/g, "")
                              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                              .replace(/\n/g, "<br>"),
                          }}
                        />
                      </div>
                    ) : (
                      <div className="mx-3 text-slate-200 text-sm leading-relaxed prose-invert">
                        <div
                          className="mt-2"
                          dangerouslySetInnerHTML={{
                            __html: message.content
                              .replace(/```[\s\S]*?```/g, "")
                              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
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
                            onClick={() =>
                              handleFeedback(message.id, "up", setFeedbackMap)
                            }
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
                            onClick={() =>
                              handleFeedback(message.id, "down", setFeedbackMap)
                            }
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
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        setShowConfirmDialog={setShowConfirmDialog}
        confirmNewAnalysis={confirmNewAnalysis}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => {
          dismissFeedback();
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
            if (pendingNewAnalysis) {
              setPendingNewAnalysis(false);
              if (hasCompletedAnalysis) {
                setShowConfirmDialog(true);
              } else {
                navigateHome();
              }
            }
          } catch (error) {
            throw error;
          }
        }}
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} onDismiss={() => showToast("")} />
    </div>
  );
}
