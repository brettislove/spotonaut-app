"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  startTransition,
  useRef,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { getOrCreateFingerprint } from "@/lib/fingerprint";
import type { AnalysisData } from "@/lib/types/analysis";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: Array<{ title: string; uri: string }>;
  suggestions?: string[];
}

interface AnalysisContextType {
  // State
  messages: Message[];
  analysisData: AnalysisData | null;
  hasCompletedAnalysis: boolean;
  isAnalyzing: boolean;
  showMapView: boolean;
  showAnalysisForm: boolean;
  fingerprint: string | null;
  showFeedbackModal: boolean;
  toastMessage: string;
  showLoginModal: boolean;
  showSignupModal: boolean;
  showForgotPasswordModal: boolean;
  showAccountSettingsModal: boolean;
  isSavedToDatabase: boolean;
  isLoadingFromDatabase: boolean;
  showMigrationDialog: boolean;
  showOverwriteDialog: boolean;
  hasExistingDatabaseAnalysis: boolean;

  // Actions
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setAnalysisData: React.Dispatch<React.SetStateAction<AnalysisData | null>>;
  setHasCompletedAnalysis: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAnalyzing: React.Dispatch<React.SetStateAction<boolean>>;
  setShowMapView: React.Dispatch<React.SetStateAction<boolean>>;
  setShowAnalysisForm: React.Dispatch<React.SetStateAction<boolean>>;
  setShowLoginModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSignupModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowForgotPasswordModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowAccountSettingsModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowMigrationDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setShowOverwriteDialog: React.Dispatch<React.SetStateAction<boolean>>;
  resetAnalysis: () => void;
  navigateHome: () => void;
  clearRestoredState: () => void;
  triggerFeedbackIfEligible: () => boolean;
  dismissFeedback: () => void;
  submitFeedback: (
    rating: number,
    comment: string,
    feedbackType: string,
  ) => Promise<boolean>;
  showToast: (message: string) => void;
  saveToDatabase: () => Promise<boolean>;
  loadFromDatabase: () => Promise<boolean>;
  migrateLocalStorageToDatabase: () => Promise<boolean>;
  checkExistingDatabaseAnalysis: () => Promise<boolean>;
  confirmOverwriteAndSave: () => Promise<boolean>;
  dismissOverwriteDialog: () => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(
  undefined,
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

export function AnalysisProvider({
  children,
  skipRestore = false,
}: {
  children: ReactNode;
  skipRestore?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status: sessionStatus } = useSession();
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [restoredState, setRestoredState] = useState<PersistedState | null>(
    null,
  );

  // Track previous session for login detection
  const prevSessionRef = useRef<typeof session>(null);
  const hasCheckedDatabaseOnLogin = useRef(false);
  const isLoadingFromDatabaseRef = useRef(false);
  const isNewlyCompletedAnalysis = useRef(false);
  const prevIsAnalyzingRef = useRef(false);
  const hasUserConfirmedOverwrite = useRef(false);
  const hasMigrationBeenHandled = useRef(false);

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [hasCompletedAnalysis, setHasCompletedAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [showAnalysisForm, setShowAnalysisForm] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showAccountSettingsModal, setShowAccountSettingsModal] =
    useState(false);

  // New state for database saving
  const [isSavedToDatabase, setIsSavedToDatabase] = useState(false);
  const [isLoadingFromDatabase, setIsLoadingFromDatabase] = useState(false);
  const [showMigrationDialog, setShowMigrationDialog] = useState(false);
  const [showOverwriteDialog, setShowOverwriteDialog] = useState(false);
  const [hasExistingDatabaseAnalysis, setHasExistingDatabaseAnalysis] =
    useState(false);
  const pendingSaveData = useRef<PersistedState | null>(null);

  // Generate fingerprint on mount
  useEffect(() => {
    getOrCreateFingerprint().then(setFingerprint);
  }, []);

  // Get storage key based on user authentication
  // Only anonymous users use localStorage - authenticated users use database exclusively
  const getStorageKey = useCallback(() => {
    if (session?.user?.email) {
      // Authenticated users should never read/write localStorage for analysis data
      return null;
    }
    if (fingerprint) {
      return `analysis_${fingerprint}`;
    }
    return null;
  }, [session, fingerprint]);

  // Load persisted state on mount (ONLY for non-authenticated users)
  useEffect(() => {
    if (skipRestore) return; // Skip restoration when viewing a specific analysis
    // Authenticated users get data from the database, not localStorage
    if (session?.user?.email) return;
    if (!fingerprint) return;
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

      // Check if user explicitly wants to start fresh (e.g., clicked logo)
      const shouldSkipRestore = sessionStorage.getItem("skipAnalysisRestore");
      if (shouldSkipRestore === "true") {
        sessionStorage.removeItem("skipAnalysisRestore");
        return;
      }

      const stored = localStorage.getItem(storageKey);

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
  }, [
    fingerprint,
    session?.user?.email,
    getStorageKey,
    restoredState,
    skipRestore,
  ]);

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
      // Mark as not newly completed since it was restored
      isNewlyCompletedAnalysis.current = false;
    });
  }, [restoredState, pathname]);

  // Persist state changes to localStorage (only for non-authenticated users)
  useEffect(() => {
    if (skipRestore) return; // Don't persist when viewing a specific analysis
    // Skip localStorage persistence for authenticated users - they use database
    if (session?.user?.email) return;
    if (!fingerprint) return;
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

  // Track when analysis transitions from analyzing to completed (newly completed)
  useEffect(() => {
    // If was analyzing and now completed -> mark as newly completed
    if (prevIsAnalyzingRef.current && !isAnalyzing && hasCompletedAnalysis) {
      isNewlyCompletedAnalysis.current = true;
    }
    prevIsAnalyzingRef.current = isAnalyzing;
  }, [isAnalyzing, hasCompletedAnalysis]);

  // Check if user has existing analysis in database
  const checkExistingDatabaseAnalysis =
    useCallback(async (): Promise<boolean> => {
      if (!session?.user?.email) return false;

      try {
        const response = await fetch("/api/analysis/saved", {
          method: "HEAD",
        });

        if (response.ok) {
          const hasAnalysis =
            response.headers.get("X-Has-Saved-Analysis") === "true";
          setHasExistingDatabaseAnalysis(hasAnalysis);
          return hasAnalysis;
        }
        return false;
      } catch (error) {
        console.error("Failed to check existing analysis:", error);
        return false;
      }
    }, [session?.user?.email]);

  // Save analysis to database (for authenticated users)
  const saveToDatabase = useCallback(async (): Promise<boolean> => {
    if (!session?.user?.email) return false;
    if (!hasCompletedAnalysis || !analysisData) return false;

    try {
      const dataToSave = {
        locationName: analysisData.locationName || analysisData.location,
        location: analysisData.location,
        coordinates: analysisData.coordinates,
        metrics: analysisData.metrics,
        groundingSources: analysisData.sources,
        groundedLocationData: analysisData.groundedLocationData,
        chatMessages: messages.map((msg) => ({
          ...msg,
          timestamp: msg.timestamp.toISOString(),
        })),
        usedMapsGrounding: !!analysisData.groundedLocationData,
      };

      const response = await fetch("/api/analysis/saved", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSave),
      });

      if (response.ok) {
        setIsSavedToDatabase(true);
        setHasExistingDatabaseAnalysis(true);
        isNewlyCompletedAnalysis.current = false; // Reset flag after successful save
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to save analysis to database:", error);
      return false;
    }
  }, [session?.user?.email, hasCompletedAnalysis, analysisData, messages]);

  // Load analysis from database (for authenticated users)
  const loadFromDatabase = useCallback(async (): Promise<boolean> => {
    if (!session?.user?.email) return false;

    setIsLoadingFromDatabase(true);
    isLoadingFromDatabaseRef.current = true;
    try {
      const response = await fetch("/api/analysis/saved");

      if (response.ok) {
        const data = await response.json();

        if (data.analysis) {
          const { analysis } = data;

          // Restore messages with Date objects
          const restoredMessages = (analysis.chatMessages || []).map(
            (msg: {
              id: string;
              role: "user" | "assistant";
              content: string;
              timestamp: string;
              sources?: Array<{ title: string; uri: string }>;
              suggestions?: string[];
            }) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }),
          );

          startTransition(() => {
            setMessages(restoredMessages);
            setAnalysisData({
              id: analysis.id,
              location: analysis.location,
              locationName: analysis.locationName,
              coordinates: analysis.coordinates,
              metrics: analysis.metrics,
              sources: analysis.groundingSources,
              groundedLocationData: analysis.groundedLocationData,
            });
            setHasCompletedAnalysis(true);
            setShowMapView(false);
            setShowAnalysisForm(false);
            setIsSavedToDatabase(true);
            setHasExistingDatabaseAnalysis(true);
            // Mark as not newly completed since it was loaded from DB
            isNewlyCompletedAnalysis.current = false;
          });

          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Failed to load analysis from database:", error);
      return false;
    } finally {
      setIsLoadingFromDatabase(false);
      // Keep the ref true briefly to prevent auto-save from triggering
      setTimeout(() => {
        isLoadingFromDatabaseRef.current = false;
      }, 1000);
    }
  }, [session?.user?.email]);

  // Migrate localStorage data to database after login/signup
  const migrateLocalStorageToDatabase =
    useCallback(async (): Promise<boolean> => {
      if (!session?.user?.email || !fingerprint) return false;

      const fingerprintKey = `analysis_${fingerprint}`;
      const stored = localStorage.getItem(fingerprintKey);

      if (!stored) return false;

      try {
        const parsed: PersistedState = JSON.parse(stored);

        if (!parsed.hasCompletedAnalysis || !parsed.analysisData) return false;

        const dataToSave = {
          locationName:
            parsed.analysisData.locationName || parsed.analysisData.location,
          location: parsed.analysisData.location,
          coordinates: parsed.analysisData.coordinates,
          metrics: parsed.analysisData.metrics,
          groundingSources: parsed.analysisData.sources,
          groundedLocationData: parsed.analysisData.groundedLocationData,
          chatMessages: parsed.messages,
          usedMapsGrounding: !!parsed.analysisData.groundedLocationData,
          businessType: parsed.analysisData.businessType || null,
        };

        const response = await fetch("/api/analysis/saved", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSave),
        });

        if (response.ok) {
          // Clean up localStorage after successful migration
          localStorage.removeItem(fingerprintKey);
          setIsSavedToDatabase(true);
          setHasExistingDatabaseAnalysis(true);
          setToastMessage("Analýza byla úspěšně uložena do vašeho účtu! 🎉");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Failed to migrate analysis to database:", error);
        return false;
      }
    }, [session?.user?.email, fingerprint]);

  // Confirm overwrite and save (called from dialog)
  const confirmOverwriteAndSave = useCallback(async (): Promise<boolean> => {
    setShowOverwriteDialog(false);

    if (pendingSaveData.current) {
      // We have pending migration data
      const result = await migrateLocalStorageToDatabase();
      pendingSaveData.current = null;
      isNewlyCompletedAnalysis.current = false; // Reset flag after migration
      return result;
    } else {
      // Regular save
      const result = await saveToDatabase();
      // Flag is already reset in saveToDatabase
      return result;
    }
  }, [migrateLocalStorageToDatabase, saveToDatabase]);

  // Dismiss overwrite dialog and suppress further auto-save attempts for this analysis
  const dismissOverwriteDialog = useCallback(() => {
    setShowOverwriteDialog(false);
    // Reset the flag so auto-save doesn't re-fire
    isNewlyCompletedAnalysis.current = false;
    // Mark as "saved" to fully suppress future auto-save attempts
    setIsSavedToDatabase(true);
  }, []);

  // Auto-save to database when analysis completes (for authenticated users)
  useEffect(() => {
    if (skipRestore) return; // Don't auto-save when viewing a specific analysis
    if (!session?.user?.email) return;
    if (!hasCompletedAnalysis || !analysisData) return;
    if (isSavedToDatabase) return; // Already saved
    if (isAnalyzing) return; // Still analyzing
    if (isLoadingFromDatabaseRef.current) return; // Don't auto-save when loading from DB
    if (!isNewlyCompletedAnalysis.current) return; // Only auto-save newly completed analyses, not restored ones
    if (showOverwriteDialog) return; // Don't re-fire while dialog is already shown

    // Check if there's an existing analysis and show overwrite dialog
    const autoSave = async () => {
      const hasExisting = await checkExistingDatabaseAnalysis();
      if (hasExisting && !hasUserConfirmedOverwrite.current) {
        // Only show dialog if user hasn't already confirmed before starting analysis
        setShowOverwriteDialog(true);
        // Don't reset flag yet - will be reset after dialog confirmation
      } else {
        // Either no existing analysis, or user already confirmed overwrite
        await saveToDatabase();
        hasUserConfirmedOverwrite.current = false; // Reset for next time
        // Flag is reset in saveToDatabase
      }
    };

    // Small delay to ensure analysis is fully complete
    const timeoutId = setTimeout(autoSave, 500);
    return () => clearTimeout(timeoutId);
  }, [
    session?.user?.email,
    hasCompletedAnalysis,
    analysisData,
    isSavedToDatabase,
    isAnalyzing,
    showOverwriteDialog,
    checkExistingDatabaseAnalysis,
    saveToDatabase,
    skipRestore,
  ]);

  // Handle login/signup: check for LocalStorage data to migrate or load from DB
  useEffect(() => {
    if (skipRestore) return; // Don't migrate/load when viewing a specific analysis
    // Only run when session changes from unauthenticated to authenticated
    if (sessionStatus !== "authenticated") return;
    if (!session?.user?.email) return;
    if (prevSessionRef.current?.user?.email === session.user.email) return;
    if (hasCheckedDatabaseOnLogin.current) return;

    hasCheckedDatabaseOnLogin.current = true;
    prevSessionRef.current = session;

    const handleLoginMigration = async () => {
      // Clean up any stale email-based localStorage keys from previous implementation
      if (session?.user?.email) {
        try {
          localStorage.removeItem(`analysis_${session.user.email}`);
        } catch {
          // Ignore cleanup errors
        }
      }

      // Check if there's LocalStorage data from fingerprint to migrate
      if (fingerprint) {
        const fingerprintKey = `analysis_${fingerprint}`;
        const localData = localStorage.getItem(fingerprintKey);

        if (localData) {
          try {
            const parsed: PersistedState = JSON.parse(localData);
            if (parsed.hasCompletedAnalysis && parsed.analysisData) {
              // migrate directly
              await migrateLocalStorageToDatabase();
              return;
            }
          } catch {
            // Invalid localStorage data, clean it up
            localStorage.removeItem(fingerprintKey);
          }
        }
      }

      // No local data to migrate, load from database
      await loadFromDatabase();
    };

    handleLoginMigration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email, sessionStatus, fingerprint, skipRestore]);

  // Reset the login check flag when user logs out
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      hasCheckedDatabaseOnLogin.current = false;
      hasMigrationBeenHandled.current = false;
      prevSessionRef.current = null;
      setIsSavedToDatabase(false);
      setHasExistingDatabaseAnalysis(false);
    }
  }, [sessionStatus]);

  // Reset analysis state
  const resetAnalysis = useCallback(() => {
    setMessages([]);
    setAnalysisData(null);
    setHasCompletedAnalysis(false);
    setShowMapView(false);
    setShowAnalysisForm(true);
    setIsSavedToDatabase(false);
    isNewlyCompletedAnalysis.current = false;

    // Clear from localStorage (for non-authenticated users)
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
    // Set flag to skip restoration on next page load
    sessionStorage.setItem("skipAnalysisRestore", "true");
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
  const triggerFeedbackIfEligible = useCallback((): boolean => {
    if (hasCompletedAnalysis && shouldShowFeedback()) {
      setShowFeedbackModal(true);
      return true;
    }
    return false;
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

        // Return true to indicate successful submission
        return true;
      } catch (error) {
        console.error("Failed to submit feedback:", error);
        throw error;
      }
    },
    [fingerprint, dismissFeedback],
  );

  // Show toast notification
  const showToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  const value: AnalysisContextType = {
    messages,
    analysisData,
    hasCompletedAnalysis,
    isAnalyzing,
    showMapView,
    showAnalysisForm,
    fingerprint,
    showFeedbackModal,
    toastMessage,
    showLoginModal,
    showSignupModal,
    showForgotPasswordModal,
    showAccountSettingsModal,
    isSavedToDatabase,
    isLoadingFromDatabase,
    showMigrationDialog,
    showOverwriteDialog,
    hasExistingDatabaseAnalysis,
    setMessages,
    setAnalysisData,
    setHasCompletedAnalysis,
    setIsAnalyzing,
    setShowMapView,
    setShowAnalysisForm,
    setShowLoginModal,
    setShowSignupModal,
    setShowForgotPasswordModal,
    setShowAccountSettingsModal,
    setShowMigrationDialog,
    setShowOverwriteDialog,
    resetAnalysis,
    navigateHome,
    clearRestoredState,
    triggerFeedbackIfEligible,
    dismissFeedback,
    submitFeedback,
    showToast,
    saveToDatabase,
    loadFromDatabase,
    migrateLocalStorageToDatabase,
    checkExistingDatabaseAnalysis,
    confirmOverwriteAndSave,
    dismissOverwriteDialog,
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
