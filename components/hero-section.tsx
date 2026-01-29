"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { TextEffect } from "@/components/ui/text-effect";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { HeroHeader } from "./header";
import ButtonHeartbeat from "./button/button-heartbeat";
import AnalysisFormNew from "./analysis-form-new";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { AnalysisFormData } from "@/lib/types/analysis";
import {
  checkIfUsedFreeAnalysis,
  handleFallbackAnalysisResponse,
  handleResponseErrors,
  handleStreamingResponse,
} from "@/utils/analysis";
import { useRateLimit } from "@/lib/hooks/useRateLimit";
import { Message } from "./chat-interface";
import { useAnalysis } from "@/lib/contexts/analysis-context";
import { tooManyRequestsMessage } from "@/utils/chat";
import { useChat } from "@/lib/hooks/useChat";
import { ProgressStep } from "./analysis-progress";
import { useRouter } from "next/navigation";

const transitionVariants = {
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

export default function HeroSection({
  setLoginModalOpen,
  setSignupModalOpen,
}: {
  setLoginModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSignupModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const {
    messages,
    setMessages,
    setAnalysisData,
    hasCompletedAnalysis,
    setHasCompletedAnalysis,
    setIsAnalyzing,
    setShowMapView,
    showAnalysisForm,
    setShowAnalysisForm,
    fingerprint,
    clearRestoredState,
    toastMessage,
    showToast,
  } = useAnalysis();
  const {
    setInput,
    isLoading,
    setIsLoading,
    showAuthModal,
    setShowAuthModal,
    authModalMode,
    setAuthModalMode,
  } = useChat();
  const { checkRateLimit } = useRateLimit();
  const { data: session } = useSession();
  const router = useRouter();

  const [progressStep, setProgressStep] = useState<ProgressStep>("geocoding");
  const [streamingText, setStreamingText] = useState("");
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null,
  );

  const handleAnalysisSubmit = React.useCallback(
    async (data: AnalysisFormData) => {
      // Check if user has already used free analysis and is not authenticated
      if (!session && checkIfUsedFreeAnalysis(data, setSignupModalOpen)) return;

      // Check rate limit
      if (!checkRateLimit()) {
        tooManyRequestsMessage(setMessages);
        return;
      }

      setIsLoading(true);
      setIsAnalyzing(true);
      setProgressStep("geocoding");
      setStreamingText("");
      setStreamingMessageId(null);

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
            setAuthModalMode,
            setShowAuthModal,
            setShowAnalysisForm,
            setIsLoading,
          );

        // Check if response is streaming (text/event-stream)
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("text/event-stream")) {
          await handleStreamingResponse(
            response,
            setStreamingMessageId,
            setMessages,
            setProgressStep,
            setStreamingText,
            setAnalysisData,
            setShowMapView,
            setHasCompletedAnalysis,
            setShowAnalysisForm,
            setIsAnalyzing,
            router,
            session,
          );
          // // Handle streaming response
          // const reader = response.body?.getReader();
          // const decoder = new TextDecoder();

          // if (!reader) {
          //   throw new Error("No response body");
          // }

          // // Create streaming message
          // const messageId = Date.now().toString();
          // setStreamingMessageId(messageId);
          // const assistantMessage: Message = {
          //   id: messageId,
          //   role: "assistant",
          //   content: "",
          //   timestamp: new Date(),
          // };
          // setMessages((prev) => [...prev, assistantMessage]);

          // let buffer = "";
          // let fullAnalysisText = "";

          // while (true) {
          //   const { done, value } = await reader.read();
          //   if (done) break;

          //   buffer += decoder.decode(value, { stream: true });
          //   const lines = buffer.split("\n\n");
          //   buffer = lines.pop() || "";

          //   for (const line of lines) {
          //     if (line.startsWith("data: ")) {
          //       try {
          //         const data = JSON.parse(line.slice(6));

          //         if (data.type === "progress") {
          //           setProgressStep(data.step);
          //         } else if (data.type === "chunk") {
          //           fullAnalysisText += data.text;
          //           setStreamingText(fullAnalysisText);
          //           // Update message content
          //           setMessages((prev) =>
          //             prev.map((msg) =>
          //               msg.id === messageId
          //                 ? { ...msg, content: fullAnalysisText }
          //                 : msg,
          //             ),
          //           );
          //         } else if (data.type === "done") {
          //           // Mark that free analysis has been used (for anonymous users)
          //           if (!session) {
          //             localStorage.setItem("hasUsedFreeAnalysis", "true");
          //           }

          //           // Update final message
          //           setMessages((prev) =>
          //             prev.map((msg) =>
          //               msg.id === messageId
          //                 ? {
          //                     ...msg,
          //                     content: data.analysis,
          //                     sources: data.sources || [],
          //                   }
          //                 : msg,
          //             ),
          //           );

          //           // Show map view with analysis data
          //           if (data.data) {
          //             setAnalysisData({
          //               ...data.data,
          //               sources: data.sources || [],
          //               groundedLocationData: data.groundedLocationData,
          //             });
          //             setShowMapView(true);
          //             setHasCompletedAnalysis(true);
          //             setShowAnalysisForm(false);
          //             // Navigate to analysis page
          //             router.push("/analysis");
          //           }

          //           setStreamingText("");
          //           setStreamingMessageId(null);
          //           setProgressStep("complete");
          //           setIsAnalyzing(false);
          //         } else if (data.type === "error") {
          //           throw new Error(
          //             data.error || data.details || "Analysis failed",
          //           );
          //         }
          //       } catch (parseError) {
          //         console.error("Error parsing SSE data:", parseError);
          //       }
          //     }
          //   }
          // }
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

          // const assistantMessage: Message = {
          //   id: Date.now().toString(),
          //   role: "assistant",
          //   content: result.analysis,
          //   timestamp: new Date(),
          // };

          // setMessages((prev) => [...prev, assistantMessage]);

          // // Show map view with analysis data
          // if (result.data) {
          //   setAnalysisData({
          //     ...result.data,
          //     sources: result.sources || [],
          //     groundedLocationData: result.groundedLocationData,
          //   });
          //   setShowMapView(true);
          //   setHasCompletedAnalysis(true);
          //   setShowAnalysisForm(false);
          //   setIsAnalyzing(false);
          //   // Navigate to analysis page
          //   router.push("/analysis");
          // }
        }
      } catch (error) {
        console.error("Error getting analysis:", error);
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Omlouváme se, při analýze došlo k chybě. Zkuste to prosím znovu.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setStreamingText("");
        setStreamingMessageId(null);
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
      setAuthModalMode,
      setShowAuthModal,
      setIsLoading,
      setSignupModalOpen,
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
      <HeroHeader
        setLoginModalOpen={setLoginModalOpen}
        setSignupModalOpen={setSignupModalOpen}
      />
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
                    href="#link"
                    className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950"
                  >
                    <span className="text-foreground text-sm">
                      Nově zobrazení konkurence v mapě!
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
                    />
                  </div>
                  <Button
                    key={2}
                    asChild
                    size="lg"
                    variant="ghost"
                    className="group h-10.5 rounded-xl px-5"
                  >
                    <Link href="#link">
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
                <AnalysisFormNew
                  handleAnalysisSubmit={handleAnalysisSubmit}
                  progressStep={progressStep}
                />
                {/* <AnalysisForm
                  onSubmit={(data) => {
                    console.log("Analysis form submitted:", data);
                    // Navigate to analysis page or handle submission
                  }}
                  onCancel={() => {}}
                  showCancelButton={false}
                /> */}
              </div>
            </AnimatedGroup>
          </div>
        </section>
      </main>
    </>
  );
}
