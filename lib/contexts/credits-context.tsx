"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

interface CreditsContextType {
  usedCredits: number;
  maxCredits: number | null;
  unlimited: boolean;
  //   loading: boolean;
  //   error: boolean;
  //   errorMessage: string | null;
  refetchCredits: () => Promise<void>;
  updateCredits: (remaining: number) => void;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export function useCredits() {
  const context = useContext(CreditsContext);
  if (!context) {
    throw new Error("useCredits must be used within CreditsProvider");
  }
  return context;
}

interface CreditsProviderProps {
  children: ReactNode;
}

export function CreditsProvider({ children }: CreditsProviderProps) {
  const [usedCredits, setUsedCredits] = useState(0);
  const [maxCredits, setMaxCredits] = useState<number | null>(3);
  const [unlimited, setUnlimited] = useState(false);
  //   const [loading, setLoading] = useState(true);
  //   const [error, setError] = useState(false);
  //   const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchCredits = useCallback(async () => {
    //   try {
    //     setLoading(true);
    //     setError(false);
    //     setErrorMessage(null);
    //     const response = await fetch("/api/chat/usage/current");
    //     if (!response.ok) {
    //       throw new Error("Failed to fetch credits");
    //     }
    //     const data = await response.json();
    //     setUsedCredits(data.promptCount);
    //     setMaxCredits(data.quota);
    //     setUnlimited(data.unlimited);
    //     setLoading(false);
    //   } catch (err) {
    //     console.error("Error fetching credits:", err);
    //     setError(true);
    //     setErrorMessage("Nepodařilo se načíst kredity");
    //     setLoading(false);
    //   }
  }, []);

  const updateCredits = useCallback((remaining: number) => {
    setMaxCredits((currentMax) => {
      setUnlimited((currentUnlimited) => {
        if (currentUnlimited || currentMax === null) {
          return currentUnlimited;
        }

        const newUsedCredits = currentMax - remaining;
        setUsedCredits(newUsedCredits);
        return currentUnlimited;
      });
      return currentMax;
    });
  }, []);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const value: CreditsContextType = {
    usedCredits,
    maxCredits,
    unlimited,
    // loading,
    // error,
    // errorMessage,
    refetchCredits: fetchCredits,
    updateCredits,
  };

  return (
    <CreditsContext.Provider value={value}>{children}</CreditsContext.Provider>
  );
}
