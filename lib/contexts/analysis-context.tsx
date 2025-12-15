"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  startTransition,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { getOrCreateFingerprint } from "@/lib/fingerprint";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: Array<{ title: string; uri: string }>;
}

interface AnalysisData {
  id?: string;
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

interface AnalysisContextType {
  // State
  messages: Message[];
  analysisData: AnalysisData | null;
  hasCompletedAnalysis: boolean;
  showMapView: boolean;
  showAnalysisForm: boolean;
  fingerprint: string | null;
  showFeedbackModal: boolean;
  toastMessage: string;

  // Actions
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setAnalysisData: React.Dispatch<React.SetStateAction<AnalysisData | null>>;
  setHasCompletedAnalysis: React.Dispatch<React.SetStateAction<boolean>>;
  setShowMapView: React.Dispatch<React.SetStateAction<boolean>>;
  setShowAnalysisForm: React.Dispatch<React.SetStateAction<boolean>>;
  resetAnalysis: () => void;
  navigateHome: () => void;
  clearRestoredState: () => void;
  triggerFeedbackIfEligible: () => void;
  dismissFeedback: () => void;
  submitFeedback: (
    rating: number,
    comment: string,
    feedbackType: string
  ) => Promise<void>;
  showToast: (message: string) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(
  undefined
);

interface PersistedState {
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>;
  analysisData: AnalysisData | null;
  hasCompletedAnalysis: boolean;
  showMapView: boolean;
}

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [restoredState, setRestoredState] = useState<PersistedState | null>(
    null
  );

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [hasCompletedAnalysis, setHasCompletedAnalysis] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [showAnalysisForm, setShowAnalysisForm] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Generate fingerprint on mount
  useEffect(() => {
    getOrCreateFingerprint().then(setFingerprint);
  }, []);

  // Get storage key based on user authentication
  const getStorageKey = useCallback(() => {
    if (session?.user?.email) {
      return `analysis_${session.user.email}`;
    }
    if (fingerprint) {
      return `analysis_${fingerprint}`;
    }
    return null;
  }, [session, fingerprint]);

  // Load persisted state on mount
  useEffect(() => {
    if (!fingerprint && !session?.user?.email) return;
    if (restoredState) return; // Already loaded

    const storageKey = getStorageKey();
    if (!storageKey) return;

    try {
      // Check for pending analysis first - it takes priority
      const pendingAnalysis = localStorage.getItem("pendingAnalysis");

      // If there's a pending analysis, don't restore old state
      if (pendingAnalysis) {
        // The pending analysis will be handled by ChatInterface
        return;
      }

      let stored = localStorage.getItem(storageKey);

      // If user just authenticated, try to find data from fingerprint storage
      if (!stored && session?.user?.email && fingerprint) {
        const fingerprintKey = `analysis_${fingerprint}`;
        stored = localStorage.getItem(fingerprintKey);

        // If found, migrate to email-based key and clean up old one
        if (stored) {
          localStorage.setItem(storageKey, stored);
          localStorage.removeItem(fingerprintKey);
        }
      }

      if (stored) {
        const parsed: PersistedState = JSON.parse(stored);
        // Use startTransition to indicate this is an intentional state update from external source
        startTransition(() => {
          setRestoredState(parsed);
        });
      }
    } catch (error) {
      console.error("Failed to restore analysis state:", error);
    }
  }, [fingerprint, session?.user?.email, getStorageKey, restoredState]);

  // Apply restored state once available
  useEffect(() => {
    if (!restoredState) return;

    // Restore messages with Date objects
    const restoredMessages = restoredState.messages.map((msg) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));

    // Use startTransition to indicate these are intentional state updates from restored data
    startTransition(() => {
      setMessages(restoredMessages);
      setAnalysisData(restoredState.analysisData);
      setHasCompletedAnalysis(restoredState.hasCompletedAnalysis);
      setShowMapView(restoredState.showMapView);
      setShowAnalysisForm(!restoredState.hasCompletedAnalysis);
    });
  }, [restoredState]);

  // Persist state changes to localStorage
  useEffect(() => {
    if (!fingerprint && !session?.user?.email) return;
    if (!hasCompletedAnalysis) return; // Only persist completed analyses

    const storageKey = getStorageKey();
    if (!storageKey) return;

    const stateToPersist: PersistedState = {
      messages: messages.map((msg) => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(),
      })),
      analysisData,
      hasCompletedAnalysis,
      showMapView,
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(stateToPersist));
    } catch (error) {
      console.error("Failed to persist analysis state:", error);
    }
  }, [
    messages,
    analysisData,
    hasCompletedAnalysis,
    showMapView,
    getStorageKey,
    fingerprint,
    session?.user?.email,
  ]);

  // Reset analysis state
  const resetAnalysis = useCallback(() => {
    setMessages([]);
    setAnalysisData(null);
    setHasCompletedAnalysis(false);
    setShowMapView(false);
    setShowAnalysisForm(true);

    // Clear from localStorage
    const storageKey = getStorageKey();
    if (storageKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.error("Failed to clear analysis state:", error);
      }
    }
  }, [getStorageKey]);

  // Clear restored state to prevent it from being applied
  const clearRestoredState = useCallback(() => {
    setRestoredState(null);
  }, []);

  // Navigate to home and reset
  const navigateHome = useCallback(() => {
    resetAnalysis();
    router.push("/");
  }, [resetAnalysis, router]);

  // Track pathname changes (for potential future use)
  useEffect(() => {
    // Pathname effect - currently just monitoring
    // State management handled by user actions (resetAnalysis, navigateHome)
  }, [pathname]);

  // Check if user is eligible for feedback prompt
  const shouldShowFeedback = useCallback((): boolean => {
    try {
      const lastFeedbackDate = localStorage.getItem("lastFeedbackDate");
      if (!lastFeedbackDate) return true;

      const daysSinceLastFeedback =
        (Date.now() - new Date(lastFeedbackDate).getTime()) /
        (1000 * 60 * 60 * 24);
      return daysSinceLastFeedback >= 7;
    } catch {
      return true;
    }
  }, []);

  // Trigger feedback modal if eligible
  const triggerFeedbackIfEligible = useCallback(() => {
    if (hasCompletedAnalysis && shouldShowFeedback()) {
      setShowFeedbackModal(true);
    }
  }, [hasCompletedAnalysis, shouldShowFeedback]);

  // Dismiss feedback modal and update localStorage
  const dismissFeedback = useCallback(() => {
    setShowFeedbackModal(false);
    try {
      localStorage.setItem("lastFeedbackDate", new Date().toISOString());
    } catch (error) {
      console.error("Failed to save feedback date:", error);
    }
  }, []);

  // Submit feedback to API
  const submitFeedback = useCallback(
    async (rating: number, comment: string, feedbackType: string) => {
      try {
        const response = await fetch("/api/feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(fingerprint ? { "x-fingerprint": fingerprint } : {}),
          },
          body: JSON.stringify({
            rating,
            comment,
            feedbackType,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to submit feedback");
        }

        // Show success toast
        setToastMessage("Signál úspěšně přijat, díky za pomoc! 📡");
        // Dismiss modal
        dismissFeedback();
      } catch (error) {
        console.error("Failed to submit feedback:", error);
        throw error;
      }
    },
    [fingerprint, dismissFeedback]
  );

  // Show toast notification
  const showToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  const value: AnalysisContextType = {
    messages,
    analysisData,
    hasCompletedAnalysis,
    showMapView,
    showAnalysisForm,
    fingerprint,
    showFeedbackModal,
    toastMessage,
    setMessages,
    setAnalysisData,
    setHasCompletedAnalysis,
    setShowMapView,
    setShowAnalysisForm,
    resetAnalysis,
    navigateHome,
    clearRestoredState,
    triggerFeedbackIfEligible,
    dismissFeedback,
    submitFeedback,
    showToast,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }
  return context;
}
