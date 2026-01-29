import { ProgressStep } from "@/components/analysis-progress";
import { Message } from "@/components/chat-interface";
import { GroundedLocationData } from "@/lib/google-ai/location-analysis";
import { AnalysisData, AnalysisFormData } from "@/lib/types/analysis";
import { Session } from "next-auth";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const checkIfUsedFreeAnalysis = (
  data: AnalysisFormData,
  setSignupModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
): boolean => {
  const hasUsedFree = localStorage.getItem("hasUsedFreeAnalysis");
  if (hasUsedFree === "true") {
    // Store the analysis data before showing auth modal
    localStorage.setItem("pendingAnalysis", JSON.stringify(data));
    setSignupModalOpen(true);
    return true;
  }
  return false;
};

const handleResponseErrors = async (
  response: Response,
  setAuthModalMode: React.Dispatch<React.SetStateAction<"login" | "signup">>,
  setShowAuthModal: React.Dispatch<React.SetStateAction<boolean>>,
  setShowAnalysisForm: React.Dispatch<React.SetStateAction<boolean>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  const errorData = await response.json().catch(() => ({}));
  if (response.status === 403 && errorData.requiresAuth) {
    setAuthModalMode("signup");
    setShowAuthModal(true);
    setShowAnalysisForm(true);
    setIsLoading(false);
    return;
  }
  throw new Error(errorData.error || "Failed to get analysis");
};

const handleStreamingResponse = async (
  response: Response,
  setStreamingMessageId: React.Dispatch<React.SetStateAction<string | null>>,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setProgressStep: React.Dispatch<React.SetStateAction<ProgressStep>>,
  setStreamingText: React.Dispatch<React.SetStateAction<string>>,
  setAnalysisData: React.Dispatch<React.SetStateAction<AnalysisData | null>>,
  setShowMapView: React.Dispatch<React.SetStateAction<boolean>>,
  setHasCompletedAnalysis: React.Dispatch<React.SetStateAction<boolean>>,
  setShowAnalysisForm: React.Dispatch<React.SetStateAction<boolean>>,
  setIsAnalyzing: React.Dispatch<React.SetStateAction<boolean>>,
  router: AppRouterInstance,
  session: Session | null,
) => {
  // Handle streaming response
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error("No response body");
  }

  // Create streaming message
  const messageId = Date.now().toString();
  setStreamingMessageId(messageId);
  const assistantMessage: Message = {
    id: messageId,
    role: "assistant",
    content: "",
    timestamp: new Date(),
  };
  setMessages((prev) => [...prev, assistantMessage]);

  let buffer = "";
  let fullAnalysisText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.slice(6));

          if (data.type === "progress") {
            setProgressStep(data.step);
          } else if (data.type === "chunk") {
            fullAnalysisText += data.text;
            setStreamingText(fullAnalysisText);
            // Update message content
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === messageId
                  ? { ...msg, content: fullAnalysisText }
                  : msg,
              ),
            );
          } else if (data.type === "done") {
            // Mark that free analysis has been used (for anonymous users)
            if (!session) {
              localStorage.setItem("hasUsedFreeAnalysis", "true");
            }

            // Update final message
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === messageId
                  ? {
                      ...msg,
                      content: data.analysis,
                      sources: data.sources || [],
                    }
                  : msg,
              ),
            );

            // Show map view with analysis data
            if (data.data) {
              setAnalysisData({
                ...data.data,
                sources: data.sources || [],
                groundedLocationData: data.groundedLocationData,
              });
              setShowMapView(true);
              setHasCompletedAnalysis(true);
              setShowAnalysisForm(false);
              // Navigate to analysis page
              router.push("/analysis");
            }

            setStreamingText("");
            setStreamingMessageId(null);
            setProgressStep("complete");
            setIsAnalyzing(false);
          } else if (data.type === "error") {
            throw new Error(data.error || data.details || "Analysis failed");
          }
        } catch (parseError) {
          console.error("Error parsing SSE data:", parseError);
        }
      }
    }
  }
};

const handleFallbackAnalysisResponse = (
  result: {
    analysis: string;
    data: AnalysisData | null;
    sources?: Array<{ title: string; uri: string }>;
    groundedLocationData?: GroundedLocationData;
  },
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setAnalysisData: React.Dispatch<React.SetStateAction<AnalysisData | null>>,
  setShowMapView: React.Dispatch<React.SetStateAction<boolean>>,
  setHasCompletedAnalysis: React.Dispatch<React.SetStateAction<boolean>>,
  setShowAnalysisForm: React.Dispatch<React.SetStateAction<boolean>>,
  setIsAnalyzing: React.Dispatch<React.SetStateAction<boolean>>,
  router: AppRouterInstance,
) => {
  const assistantMessage: Message = {
    id: Date.now().toString(),
    role: "assistant",
    content: result.analysis,
    timestamp: new Date(),
  };

  setMessages((prev) => [...prev, assistantMessage]);

  // Show map view with analysis data
  if (result.data) {
    setAnalysisData({
      ...result.data,
      sources: result.sources || [],
      groundedLocationData: result.groundedLocationData,
    });
    setShowMapView(true);
    setHasCompletedAnalysis(true);
    setShowAnalysisForm(false);
    setIsAnalyzing(false);
    // Navigate to analysis page
    router.push("/analysis");
  }
};

export {
  checkIfUsedFreeAnalysis,
  handleResponseErrors,
  handleStreamingResponse,
  handleFallbackAnalysisResponse,
};
