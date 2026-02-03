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
import { ArrowRight, MapPin } from "lucide-react";

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
  const { hasCompletedAnalysis, analysisData, isAnalyzing } = useAnalysis();
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
  const shouldShow =
    session &&
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
                <p className="text-xs text-muted-foreground">Dokončeno</p>
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
