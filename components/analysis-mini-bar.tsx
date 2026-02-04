"use client";

import {
  useEffect,
  useState,
  useRef,
  useCallback,
  useSyncExternalStore,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAnalysis } from "@/lib/contexts/analysis-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  MapPin,
  AlertTriangle,
  Check,
  UserPlus,
} from "lucide-react";

// Custom hook for hydration-safe mounting
function useHasMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function AnalysisMiniBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const {
    hasCompletedAnalysis,
    analysisData,
    isAnalyzing,
    isSavedToDatabase,
    setShowSignupModal,
  } = useAnalysis();
  const isMounted = useHasMounted();

  // Scroll-aware visibility
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollThreshold = 10;

  // Scroll detection with threshold
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const diff = currentScrollY - lastScrollY.current;

    if (diff > scrollThreshold) {
      // Scrolling down - hide
      setIsVisible(false);
      lastScrollY.current = currentScrollY;
    } else if (diff < -scrollThreshold) {
      // Scrolling up - show
      setIsVisible(true);
      lastScrollY.current = currentScrollY;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Reset visibility when pathname changes
  useEffect(() => {
    // Use requestAnimationFrame to defer state update
    const rafId = requestAnimationFrame(() => {
      setIsVisible(true);
      lastScrollY.current = window.scrollY;
    });
    return () => cancelAnimationFrame(rafId);
  }, [pathname]);

  // Don't render if conditions not met
  // Show for authenticated users OR for non-authenticated users with completed analysis (to show warning)
  const shouldShow =
    hasCompletedAnalysis &&
    !isAnalyzing &&
    analysisData &&
    pathname !== "/analysis";

  if (!shouldShow) {
    return null;
  }

  const score = analysisData.metrics?.localityScore ?? 0;
  const locationName =
    analysisData.locationName || analysisData.location || "Analýza";

  // Score color based on value
  const getScoreGradient = (score: number) => {
    if (score >= 70) return "from-emerald-500 to-green-400";
    if (score >= 50) return "from-yellow-500 to-amber-400";
    return "from-red-500 to-orange-400";
  };

  const handleNavigateToAnalysis = () => {
    router.push("/analysis");
  };

  const handleSignUp = () => {
    setShowSignupModal(true);
  };

  // Non-authenticated user view with warning
  if (!session) {
    return (
      <div
        className={`fixed bottom-4 left-0 right-0 z-40 px-4 transition-all duration-300 ease-out ${
          isMounted && isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8 pointer-events-none"
        }`}
      >
        <div className="max-w-lg mx-auto">
          <div className="bg-card/95 backdrop-blur-lg border border-amber-500/50 rounded-xl shadow-2xl">
            <div className="flex flex-col gap-2 p-3">
              {/* Warning banner */}
              <div className="flex items-center gap-2 px-2 py-1.5 bg-amber-500/10 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  Neuloženo. Zaregistrujte se, abyste o tuto analýzu nepřišli.
                </p>
              </div>

              {/* Location info and actions */}
              <div className="flex items-center justify-between gap-3">
                {/* Location info */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate max-w-[100px] sm:max-w-[140px]">
                      {locationName}
                    </p>
                  </div>
                </div>

                {/* Score badge */}
                <Badge
                  className={`bg-gradient-to-r ${getScoreGradient(score)} text-white border-0 px-2.5 py-1 text-sm font-semibold flex-shrink-0`}
                >
                  {score}/100
                </Badge>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleNavigateToAnalysis}
                    className="gap-1"
                  >
                    <span className="hidden sm:inline">Zpět</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSignUp}
                    className="gap-1.5 bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Uložit</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated user view with saved status
  return (
    <div
      className={`fixed bottom-4 left-0 right-0 z-40 px-4 transition-all duration-300 ease-out ${
        isMounted && isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8 pointer-events-none"
      }`}
    >
      <div className="max-w-md mx-auto">
        <div className="bg-card/95 backdrop-blur-lg border border-border rounded-xl shadow-2xl">
          <div className="flex items-center justify-between gap-3 p-3">
            {/* Location info */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate max-w-[120px] sm:max-w-[180px]">
                  {locationName}
                </p>
                <div className="flex items-center gap-1">
                  {isSavedToDatabase ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        Uloženo
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">Ukládání...</p>
                  )}
                </div>
              </div>
            </div>

            {/* Score badge */}
            <Badge
              className={`bg-gradient-to-r ${getScoreGradient(score)} text-white border-0 px-2.5 py-1 text-sm font-semibold flex-shrink-0`}
            >
              {score}/100
            </Badge>

            {/* Back to analysis button */}
            <Button
              size="sm"
              onClick={handleNavigateToAnalysis}
              className="flex-shrink-0 gap-1.5"
            >
              <span className="hidden sm:inline">Zpět k analýze</span>
              <span className="sm:hidden">Zpět</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
