"use client";

import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { createContext, useContext } from "react";

const PERCENT_MAX = 100;
const ICON_RADIUS = 10;
const ICON_VIEWBOX = 24;
const ICON_CENTER = 12;
const ICON_STROKE_WIDTH = 4;

interface ContextSchema {
  usedCredits: number;
  maxCredits: number | null;
  unlimited: boolean;
}

const ContextContext = createContext<ContextSchema | null>(null);

const useContextValue = () => {
  const context = useContext(ContextContext);

  if (!context) {
    throw new Error("Context components must be used within Context");
  }

  return context;
};

export type ContextProps = ComponentProps<typeof HoverCard> & ContextSchema;

export const Context = ({
  usedCredits,
  maxCredits,
  unlimited,
  ...props
}: ContextProps) => (
  <ContextContext.Provider
    value={{
      maxCredits,
      unlimited,
      usedCredits,
    }}
  >
    <HoverCard closeDelay={0} openDelay={0} {...props} />
  </ContextContext.Provider>
);

const CreditsIcon = () => {
  const { usedCredits, maxCredits, unlimited } = useContextValue();

  const circumference = 2 * Math.PI * ICON_RADIUS;
  const remainingPercent = unlimited
    ? 1
    : ((maxCredits ?? 0) - usedCredits) / (maxCredits ?? 1);
  const dashOffset = circumference * (1 - remainingPercent);

  return (
    <svg
      aria-label="Využití kreditů"
      height="20"
      role="img"
      style={{ color: "currentcolor" }}
      viewBox={`0 0 ${ICON_VIEWBOX} ${ICON_VIEWBOX}`}
      width="20"
    >
      <circle
        cx={ICON_CENTER}
        cy={ICON_CENTER}
        fill="none"
        opacity="0.25"
        r={ICON_RADIUS}
        stroke="currentColor"
        strokeWidth={ICON_STROKE_WIDTH}
      />
      <circle
        cx={ICON_CENTER}
        cy={ICON_CENTER}
        fill="none"
        opacity="1.0"
        r={ICON_RADIUS}
        stroke="#A43BFE"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        strokeWidth={ICON_STROKE_WIDTH}
        style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
      />
    </svg>
  );
};

export type ContextTriggerProps = ComponentProps<typeof Button>;

export const ContextTrigger = ({ children, ...props }: ContextTriggerProps) => {
  const { usedCredits, maxCredits, unlimited } = useContextValue();
  const remaining = unlimited
    ? "∞"
    : ((maxCredits ?? 0) - usedCredits).toString();

  return (
    <HoverCardTrigger asChild>
      {children ?? (
        <Button type="button" variant="ghost" {...props}>
          <CreditsIcon />
          <span className="font-bold text-primary">{remaining}</span>
        </Button>
      )}
    </HoverCardTrigger>
  );
};

export type ContextContentProps = ComponentProps<typeof HoverCardContent>;

export const ContextContent = ({
  className,
  ...props
}: ContextContentProps) => (
  <HoverCardContent
    className={cn("min-w-60 divide-y overflow-hidden p-0", className)}
    {...props}
  />
);

export type ContextContentHeaderProps = ComponentProps<"div">;

export const ContextContentHeader = ({
  children,
  className,
  ...props
}: ContextContentHeaderProps) => {
  const { usedCredits, maxCredits, unlimited } = useContextValue();

  if (unlimited) {
    return (
      <div className={cn("w-full space-y-2 p-3", className)} {...props}>
        {children ?? (
          <div className="flex items-center justify-center gap-3 text-sm">
            <p className="font-medium">Neomezené kredity</p>
          </div>
        )}
      </div>
    );
  }

  const usedPercent = usedCredits / (maxCredits ?? 1);
  const used = new Intl.NumberFormat("cs-CZ", {
    notation: "compact",
  }).format(usedCredits);
  const total = new Intl.NumberFormat("cs-CZ", {
    notation: "compact",
  }).format(maxCredits ?? 0);
  const percentDisplay = Math.round(usedPercent * PERCENT_MAX);

  const isLowCredits = usedPercent > 0.8;

  return (
    <div className={cn("w-full space-y-2 p-3", className)} {...props}>
      {children ?? (
        <>
          <p className="text-xs text-muted-foreground mb-1">Využito:</p>
          <div className="flex items-center justify-between gap-3 text-xs mb-1">
            <p className="font-medium">{percentDisplay}%</p>
            <p className="font-mono text-muted-foreground">
              {used} / {total}
            </p>
          </div>
          <div className="space-y-2">
            <Progress
              className={cn(
                "bg-muted",
                isLowCredits && "bg-red-200 [&>div]:bg-red-500",
              )}
              value={usedPercent * PERCENT_MAX}
            />
          </div>
        </>
      )}
    </div>
  );
};

export type ContextContentBodyProps = ComponentProps<"div">;

export const ContextContentBody = ({
  children,
  className,
  ...props
}: ContextContentBodyProps) => (
  <div className={cn("w-full p-3", className)} {...props}>
    {children}
  </div>
);
