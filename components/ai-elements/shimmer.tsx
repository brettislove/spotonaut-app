"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import {
  type CSSProperties,
  type ElementType,
  type JSX,
  memo,
  useMemo,
} from "react";

export interface TextShimmerProps {
  children: string;
  as?: ElementType;
  className?: string;
  duration?: number;
  spread?: number;
}

// map common intrinsic elements to their motion counterparts (created at module scope)
const MotionMap: Partial<Record<keyof JSX.IntrinsicElements, ElementType>> = {
  p: motion.p,
  span: motion.span,
  div: motion.div,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  h5: motion.h5,
  h6: motion.h6,
  a: motion.a,
  button: motion.button,
  li: motion.li,
  small: motion.small,
  strong: motion.strong,
  label: motion.label,
};

const ShimmerComponent = ({
  children,
  as: Component = "p",
  className,
  duration = 2,
  spread = 2,
}: TextShimmerProps) => {
  // select a pre-created motion intrinsic component when possible; fall back to motion.span
  const MotionComponent: ElementType =
    typeof Component === "string" &&
    MotionMap[Component as keyof JSX.IntrinsicElements]
      ? MotionMap[Component as keyof JSX.IntrinsicElements]!
      : motion.span;

  const dynamicSpread = useMemo(
    () => (children?.length ?? 0) * spread,
    [children, spread],
  );

  return (
    <MotionComponent
      animate={{ backgroundPosition: "0% center" }}
      className={cn(
        "relative inline-block bg-[length:250%_100%,auto] bg-clip-text text-transparent",
        "[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--color-background),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]",
        className,
      )}
      initial={{ backgroundPosition: "100% center" }}
      style={
        {
          "--spread": `${dynamicSpread}px`,
          backgroundImage:
            "var(--bg), linear-gradient(var(--color-muted-foreground), var(--color-muted-foreground))",
        } as CSSProperties
      }
      transition={{
        repeat: Number.POSITIVE_INFINITY,
        duration,
        ease: "linear",
      }}
    >
      {children}
    </MotionComponent>
  );
};

export const Shimmer = memo(ShimmerComponent);
