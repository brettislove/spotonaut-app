import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getScoreGradient(score: number | undefined): string {
  if (score === undefined)
    return "bg-gray-500/10 border-gray-500 text-gray-500";
  if (score >= 70)
    return "bg-emerald-500/10 border-emerald-500 text-emerald-500";
  if (score >= 50) return "bg-yellow-500/10 border-yellow-500 text-yellow-500";
  return "bg-red-500/10 border-red-500 text-red-500";
}
