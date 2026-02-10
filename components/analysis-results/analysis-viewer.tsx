"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAnalysis } from "@/lib/contexts/analysis-context";
import AnalysisResultsDesktop from "@/components/analysis-results/analysis-results-desktop";
import AnalysisResultsMobile from "@/components/analysis-results/analysis-results-mobile";
import { Loader2 } from "lucide-react";
import type { AnalysisData } from "@/lib/types/analysis";
import type { MessageType } from "@/lib/types/chat";

interface AnalysisViewerProps {
  analysisId: string;
}

export default function AnalysisViewer({ analysisId }: AnalysisViewerProps) {
  const router = useRouter();
  const {
    setMessages,
    setAnalysisData,
    setHasCompletedAnalysis,
    analysisData,
  } = useAnalysis();

  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch analysis data
  useEffect(() => {
    // Immediately clear stale data from previous analysis
    setAnalysisData(null);
    setMessages([]);
    setHasCompletedAnalysis(false);
    setError(null);

    async function fetchAnalysis() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/analysis/${analysisId}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/");
            return;
          }
          if (response.status === 403) {
            setError("Nemáte oprávnění zobrazit tuto analýzu.");
            return;
          }
          if (response.status === 404) {
            setError("Analýza nebyla nalezena.");
            return;
          }
          throw new Error("Failed to fetch analysis");
        }

        const data = await response.json();
        const analysis = data.analysis;

        // Transform to AnalysisData format
        const transformedData: AnalysisData = {
          id: analysis.id,
          location: analysis.location,
          locationName: analysis.locationName,
          coordinates: analysis.coordinates as
            | { lat: number; lng: number }
            | undefined,
          metrics: analysis.metrics as AnalysisData["metrics"],
          groundedLocationData: analysis.groundedLocationData,
        };

        // Set the context values
        setAnalysisData(transformedData);
        setHasCompletedAnalysis(true);

        // Restore chat messages if available
        if (analysis.chatMessages && Array.isArray(analysis.chatMessages)) {
          const restoredMessages: MessageType[] = analysis.chatMessages.map(
            (msg: {
              id: string;
              role: "user" | "assistant";
              content: string;
              timestamp: string;
              suggestions?: string[];
            }) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }),
          );
          setMessages(restoredMessages);
        }
      } catch (err) {
        console.error("Error fetching analysis:", err);
        setError("Nepodařilo se načíst analýzu.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalysis();
  }, [
    analysisId,
    router,
    setAnalysisData,
    setHasCompletedAnalysis,
    setMessages,
  ]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Načítání analýzy...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-lg font-medium text-destructive">{error}</p>
          <button
            onClick={() => router.push("/app")}
            className="text-primary hover:underline"
          >
            Zpět na hlavní stránku
          </button>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      {isMobile ? (
        <AnalysisResultsMobile analysisData={analysisData} />
      ) : (
        <AnalysisResultsDesktop analysisData={analysisData} />
      )}
    </div>
  );
}
