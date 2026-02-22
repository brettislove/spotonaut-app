"use client";

import AnalysisFormNew from "@/components/analysis-form-new";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAnalysis } from "@/lib/contexts/analysis-context";
import { useChat } from "@/lib/hooks/useChat";
import { useRateLimit } from "@/lib/hooks/useRateLimit";
import { AnalysisFormData, ProgressStep } from "@/lib/types/analysis";
import { MessageType } from "@/lib/types/chat";
import {
  handleFallbackAnalysisResponse,
  handleResponseErrors,
  handleStreamingResponse,
} from "@/utils/analysis";
import { tooManyRequestsMessage } from "@/utils/chat";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export default function Page() {
  const {
    fingerprint,
    setMessages,
    setIsAnalyzing,
    setShowSignupModal,
    setShowAnalysisForm,
    setAnalysisData,
    setShowMapView,
    setHasCompletedAnalysis,
  } = useAnalysis();
  const { checkRateLimit } = useRateLimit();
  const { setIsLoading } = useChat();
  const { data: session } = useSession();
  const router = useRouter();

  const [progressStep, setProgressStep] = useState<ProgressStep>("geocoding");

  const handleAnalysisSubmit = useCallback(
    async (formData: AnalysisFormData) => {
      // Check rate limit
      if (!checkRateLimit()) {
        tooManyRequestsMessage(setMessages);
        return;
      }

      setIsLoading(true);
      setIsAnalyzing(true);
      setProgressStep("geocoding");

      try {
        const response = await fetch("/api/analysis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            fingerprint,
            coordinates: formData.coordinates,
          }),
        });

        if (!response.ok) {
          handleResponseErrors(
            response,
            setShowSignupModal,
            setShowAnalysisForm,
            setIsLoading,
          );
        }

        // Check if response is streaming (text/event-stream)
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("text/event-stream")) {
          await handleStreamingResponse(
            response,
            setMessages,
            setProgressStep,
            setAnalysisData,
            setShowMapView,
            setHasCompletedAnalysis,
            setIsAnalyzing,
            router,
            session,
          );
        } else {
          // Fallback to non-streaming response (for backward compatibility)
          const result = await response.json();

          // Mark that free analysis has been used (for anonymous users)
          if (!session) {
            localStorage.setItem("hasUsedFreeAnalysis", "true");
          }

          handleFallbackAnalysisResponse(
            result,
            setMessages,
            setAnalysisData,
            setShowMapView,
            setHasCompletedAnalysis,
            setShowAnalysisForm,
            setIsAnalyzing,
            router,
          );
        }
      } catch (error) {
        console.error("Error during analysis:", error);
        const errorMessage: MessageType = {
          id: Date.now().toString(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Omlouváme se, při analýze došlo k chybě. Zkuste to prosím znovu.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
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
      setShowSignupModal,
      setIsLoading,
      setAnalysisData,
      setIsAnalyzing,
      setShowMapView,
      setHasCompletedAnalysis,
      setShowAnalysisForm,
      router,
    ],
  );

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader pageName="Nová analýza" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Dashboard Header */}
              <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">
                    Nová analýza
                  </h1>
                  <AnalysisFormNew
                    handleAnalysisSubmit={handleAnalysisSubmit}
                    progressStep={progressStep}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
