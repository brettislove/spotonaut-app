"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconClock, IconMapPin, IconTrendingUp } from "@tabler/icons-react";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import { Button } from "./ui/button";
import type { Analysis } from "@/lib/types/analysis";

const MapThumbnail = dynamic(() => import("./map-thumbnail"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted">
      <Skeleton className="h-full w-full" />
    </div>
  ),
});

function getRelativeTime(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffInMs = now.getTime() - then.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return "Právě teď";
  if (diffInMinutes < 60) return `Před ${diffInMinutes} min`;
  if (diffInHours < 24) return `Před ${diffInHours} h`;
  if (diffInDays === 1) return "Včera";
  if (diffInDays < 7) return `Před ${diffInDays} dny`;

  return then.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "short",
  });
}

function getPotentialScore(metrics: Analysis["metrics"]): number {
  const localityScore = metrics.localityScore || 0;
  const footfallScore = metrics.footfallScore || 0;
  // Calculate average potential score
  return Math.round((localityScore + footfallScore) / 2);
}

function AnalysisCardSkeleton() {
  return (
    <Card className="@container/card cursor-pointer transition-all hover:shadow-md">
      <div className="relative h-40 w-full overflow-hidden rounded-t-lg bg-muted">
        <Skeleton className="h-full w-full" />
      </div>
      <CardHeader>
        <CardDescription>
          <Skeleton className="h-4 w-24" />
        </CardDescription>
        <CardTitle className="text-lg font-semibold">
          <Skeleton className="h-6 w-full" />
        </CardTitle>
        <CardAction>
          <Skeleton className="h-6 w-20" />
        </CardAction>
      </CardHeader>
      <CardFooter className="flex items-center gap-2 text-sm text-muted-foreground">
        <Skeleton className="h-4 w-24" />
      </CardFooter>
    </Card>
  );
}

function AnalysisCard({ analysis }: { analysis: Analysis }) {
  const router = useRouter();
  const potentialScore = getPotentialScore(analysis.metrics);
  const relativeTime = getRelativeTime(analysis.createdAt);

  const handleClick = () => {
    router.push(`/app/analysis/${analysis.id}`);
  };

  return (
    <Card
      className="group @container/card overflow-hidden hover:shadow-lg pb-4 pt-0"
      //   onClick={handleClick}
    >
      <div className="relative h-40 w-full overflow-hidden bg-muted">
        {analysis.coordinates ? (
          <MapThumbnail
            coordinates={analysis.coordinates}
            locationName={analysis.locationName}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
            <IconMapPin className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>
      <CardHeader className="px-4">
        <CardDescription className="text-xs">
          <div className="grid grid-cols-2">
            {analysis.businessType || "Analýza lokality"}
            <div className="flex gap-2">
              <IconClock className="h-3.5 w-3.5" />
              {relativeTime}
            </div>
          </div>
        </CardDescription>
        <Badge variant="outline" className="gap-1">
          <IconTrendingUp className="h-3 w-3" />
          Potenciál: {potentialScore}/100
        </Badge>
        <CardTitle className="text-base font-semibold line-clamp-1">
          {analysis.locationName}
        </CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardFooter className="flex items-center px-4 text-xs text-muted-foreground">
        <Button className="w-full" onClick={handleClick}>
          Zobrazit analýzu
        </Button>
      </CardFooter>
    </Card>
  );
}

export function RecentAnalyses() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentAnalyses() {
      try {
        const response = await fetch("/api/analyses/recent");
        if (response.ok) {
          const data = await response.json();
          setAnalyses(data);
        }
      } catch (error) {
        console.error("Error fetching recent analyses:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentAnalyses();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <AnalysisCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="mx-4 rounded-lg border border-dashed border-muted-foreground/25 bg-muted/5 px-4 py-12 text-center lg:mx-6">
        <IconMapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">Žádné analýzy</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Začněte vytvořením vaší první analýzy lokality
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 ">
      {analyses.map((analysis) => (
        <AnalysisCard key={analysis.id} analysis={analysis} />
      ))}
    </div>
  );
}
