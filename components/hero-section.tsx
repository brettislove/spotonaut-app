"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { TextEffect } from "@/components/ui/text-effect";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { Variants } from "framer-motion";
import ButtonHeartbeat from "./button/button-heartbeat";
import AnalysisFormNew from "./analysis-form-new";
import React, { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { AnalysisFormData } from "@/lib/types/analysis";
import {
  checkIfUsedFreeAnalysis,
  handleFallbackAnalysisResponse,
  handleResponseErrors,
  handleStreamingResponse,
} from "@/utils/analysis";
import { useRateLimit } from "@/lib/hooks/useRateLimit";
import type { MessageType } from "@/lib/types/chat";
import { useAnalysis } from "@/lib/contexts/analysis-context";
import { tooManyRequestsMessage } from "@/utils/chat";
import { useChat } from "@/lib/hooks/useChat";
import type { ProgressStep } from "@/lib/types/analysis";
import { useRouter } from "next/navigation";

const transitionVariants: { item: Variants } = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

export default function HeroSection() {
  const {
    setMessages,
    setAnalysisData,
    setHasCompletedAnalysis,
    setIsAnalyzing,
    setShowMapView,
    setShowAnalysisForm,
    fingerprint,
    setShowLoginModal,
    setShowSignupModal,
  } = useAnalysis();
  const { setIsLoading } = useChat();
  const { checkRateLimit } = useRateLimit();
  const { data: session } = useSession();
  const router = useRouter();

  const [progressStep, setProgressStep] = useState<ProgressStep>("geocoding");
  const formRef = useRef<HTMLDivElement>(null);

  const handleAnalysisSubmit = React.useCallback(
    async (data: AnalysisFormData) => {
      // Check if user has already used free analysis and is not authenticated
      if (!session && checkIfUsedFreeAnalysis(data, setShowLoginModal)) return;

      // Check rate limit
      if (!checkRateLimit()) {
        tooManyRequestsMessage(setMessages);
        return;
      }

      setIsLoading(true);
      setIsAnalyzing(true);
      setProgressStep("geocoding");

      try {
        const response = await fetch("/api/analysis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            fingerprint,
            coordinates: data.coordinates,
          }),
        });

        if (!response.ok)
          handleResponseErrors(
            response,
            setShowSignupModal,
            setShowAnalysisForm,
            setIsLoading,
          );

        // Check if response is streaming (text/event-stream)
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("text/event-stream")) {
          await handleStreamingResponse(
            response,
            setMessages,
            setProgressStep,
            setAnalysisData,
            setShowMapView,
            setHasCompletedAnalysis,
            setIsAnalyzing,
            router,
            session,
          );
        } else {
          // Fallback to non-streaming response (for backward compatibility)
          const result = await response.json();

          // Mark that free analysis has been used (for anonymous users)
          if (!session) {
            localStorage.setItem("hasUsedFreeAnalysis", "true");
          }

          handleFallbackAnalysisResponse(
            result,
            setMessages,
            setAnalysisData,
            setShowMapView,
            setHasCompletedAnalysis,
            setShowAnalysisForm,
            setIsAnalyzing,
            router,
          );
        }
      } catch (error) {
        console.error("Error getting analysis:", error);
        const errorMessage: MessageType = {
          id: Date.now().toString(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Omlouváme se, při analýze došlo k chybě. Zkuste to prosím znovu.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setProgressStep("geocoding");
        setIsAnalyzing(false);
      } finally {
        setIsLoading(false);
      }
    },
    [
      session,
      fingerprint,
      checkRateLimit,
      setMessages,
      setShowLoginModal,
      setShowSignupModal,
      setIsLoading,
      setAnalysisData,
      setIsAnalyzing,
      setShowMapView,
      setHasCompletedAnalysis,
      setShowAnalysisForm,
      router,
    ],
  );

  return (
    <>
      <main className="overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block"
        >
          <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
          <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
        </div>
        <section>
          <div className="relative pt-24 md:pt-36">
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      delayChildren: 1,
                    },
                  },
                },
                item: {
                  hidden: {
                    opacity: 0,
                    y: 20,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      type: "spring",
                      bounce: 0.3,
                      duration: 2,
                    },
                  },
                },
              }}
              className="mask-b-from-35% mask-b-to-90% absolute inset-0 top-56 -z-20 lg:top-32"
            >
              <Image
                src="/Moon.png"
                alt="background"
                className="hidden size-full dark:block"
                width="3276"
                height="4095"
              />
            </AnimatedGroup>

            <div
              aria-hidden
              className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"
            />

            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                <AnimatedGroup variants={transitionVariants}>
                  <Link
                    href="/blog"
                    className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950"
                  >
                    <span className="text-foreground text-sm">
                      Novinka: zobrazení konkurence v mapě!
                    </span>
                    <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>

                    <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                      <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" />
                        </span>
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </AnimatedGroup>

                <TextEffect
                  preset="fade-in-blur"
                  speedSegment={0.3}
                  as="h1"
                  className="font-inter mx-auto mt-8 max-w-4xl text-balance text-5xl font-bold md:text-7xl lg:mt-16 xl:text-[5.25rem]"
                >
                  Zjisti kde otevřít svůj další podnik
                </TextEffect>
                <TextEffect
                  per="line"
                  preset="fade-in-blur"
                  speedSegment={0.3}
                  delay={0.5}
                  as="p"
                  className="mx-auto mt-8 max-w-2xl text-balance text-lg"
                >
                  Spotonaut využívá pokročilou AI analýzu k vyhodnocení
                  potenciálu vaší lokality. Zaregistrujte se zdarma a využijte
                  tak možnost zhodnotit výsledná data s naším AI asistentem!
                </TextEffect>

                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: 0.75,
                        },
                      },
                    },
                    ...transitionVariants,
                  }}
                  className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row"
                >
                  <div
                    key={1}
                    className="bg-foreground/10 rounded-[calc(var(--radius-xl)+0.125rem)] border p-0.5"
                  >
                    <ButtonHeartbeat
                      size="lg"
                      className="rounded-xl px-5 text-base"
                      InnerText="Vyzkoušet zdarma"
                      onClick={() =>
                        formRef.current?.scrollIntoView({
                          behavior: "smooth",
                        })
                      }
                    />
                  </div>
                  <Button
                    key={2}
                    asChild
                    size="lg"
                    variant="ghost"
                    className="group h-10.5 rounded-xl px-5"
                  >
                    <Link href="/how-it-works">
                      <span className="text-nowrap">Jak to funguje?</span>
                      <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                </AnimatedGroup>
              </div>
            </div>

            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.75,
                    },
                  },
                },
                ...transitionVariants,
              }}
            >
              <div className="relative mt-8 overflow-auto px-2 sm:mr-0 sm:mt-12 md:mt-20">
                <div
                  ref={formRef}
                  id="analysis-form"
                  className="scroll-mt-[100px]"
                >
                  <AnalysisFormNew
                    handleAnalysisSubmit={handleAnalysisSubmit}
                    progressStep={progressStep}
                  />
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </section>
      </main>
    </>
  );
}
