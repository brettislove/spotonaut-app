"use client";

import { useState, useEffect } from "react";

interface SwitchingTextProps {
  words: string[];
  className?: string;
  interval?: number;
}

export default function SwitchingText({
  words,
  className = "",
  interval = 3000,
}: SwitchingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fadeOutTimer = setTimeout(() => {
      setIsVisible(false);
    }, interval - 300);

    const switchTimer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
      setIsVisible(true);
    }, interval);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(switchTimer);
    };
  }, [currentIndex, words.length, interval]);

  return (
    <span
      className={`inline-block transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      } ${className}`}
    >
      {words[currentIndex]}
    </span>
  );
}
