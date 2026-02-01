"use client";

import { useState, useEffect } from "react";
import { AnalysisData } from "@/lib/types/analysis";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import MapViewNew from "./map-view-new";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "./ui/item";
import {
  MapPinned,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  MessageSquareIcon,
  ListFilter,
  Trophy,
  TrainFront,
  ShoppingCart,
  Building,
  House,
  MapPinHouse,
  CircleEllipsis,
  Clock,
  ThumbsUpIcon,
  ThumbsDownIcon,
  RefreshCcwIcon,
  CopyIcon,
} from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Switch } from "./ui/switch";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputMessage,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputController,
} from "./ai-elements/prompt-input";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "./ai-elements/conversation";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageToolbar,
} from "./ai-elements/message";
import { useAnalysis } from "@/lib/contexts/analysis-context";
import { useRateLimit } from "@/lib/hooks/useRateLimit";
import { MessageType } from "./chat-interface";
import { toast } from "sonner";
import { Shimmer } from "./ai-elements/shimmer";
import { Suggestion, Suggestions } from "./ai-elements/suggestion";

const snapPoints = ["8%", "35%", "80%"];

export default function AnalysisResultsDesktop({
  analysisData,
}: {
  analysisData: AnalysisData;
}) {
  const { checkRateLimit } = useRateLimit();
  const { messages, setMessages } = useAnalysis();
  const [activeSnapPoint, setActiveSnapPoint] = useState<number>(1);
  const [filters, setFilters] = useState({
    competitors: true,
    transit: true,
    shopping: true,
    office: true,
    residential: true,
    other: true,
    availableProperties: true,
  });
  const [promptInputText, setPromptInputText] = useState("");

  const toggleDrawer = () => {
    setActiveSnapPoint(activeSnapPoint === 0 ? 1 : 0);
  };

  const toggleMaximize = () => {
    setActiveSnapPoint(activeSnapPoint === 2 ? 1 : 2);
  };

  const [status, setStatus] = useState<
    "submitted" | "streaming" | "ready" | "error"
  >("ready");

  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [disliked, setDisliked] = useState<Record<string, boolean>>({});

  const handleSubmit = async (
    message: PromptInputMessage,
    clearInput: () => void,
  ) => {
    setStatus("submitted");

    const { text } = message;

    if (!text || !text.trim()) {
      return;
    }

    // Check rate limit
    if (!checkRateLimit()) {
      const rateLimitMessage: MessageType = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Příliš mnoho požadavků. Prosím, zkuste to znovu za chvíli.",
        timestamp: new Date(),
      };
      // Append rate limit message to conversation
      setMessages((prev) => [...prev, rateLimitMessage]);
      return;
    }

    const userMessage: MessageType = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    // Append user message to conversation
    // setMessages((prev) => [...prev, userMessage]);

    try {
      // Claim a prompt for this user (server-side lifetime quota) BEFORE appending the user's message
      const claimRes = await fetch("/api/chat/usage/claim", { method: "POST" });
      if (!claimRes.ok) {
        const claimData = await claimRes.json().catch(() => ({}));
        if (claimRes.status === 403 && claimData.limitExceeded) {
          if (claimData.requestPending) {
            toast.info("Žádost o další prompty je v procesu schválení.");
          }
          // Show request modal
          setStatus("ready");
          return;
        }
        throw new Error(claimData.error || "Failed to claim prompt");
      }
      // Claim succeeded: append user's message and clear input
      setMessages((prev) => [...prev, userMessage]);
      //   clearInput();
      setStatus("streaming");
      // Build the full conversation history including the new message
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          coordinates: analysisData?.coordinates,
          groundedLocationData: analysisData?.groundedLocationData,
        }),
      });
      if (!response.ok) {
        const errorMessage: MessageType = {
          id: Date.now().toString(),
          role: "assistant",
          content: "Došlo k chybě při získávání odpovědi od AI.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setStatus("error");
        throw new Error("Failed to get response from AI");
      }
      const data = await response.json();
      console.log("AI response data:", data);
      const assistantMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        suggestions: data.suggestions || [],
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setStatus("ready");
    } catch (error) {
      console.error("Error during message submission:", error);
      setStatus("error");
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  // Get suggestions from the last assistant message - to show only the latest ones
  const lastAssistantMessage = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");
  const currentSuggestions = lastAssistantMessage?.suggestions || [];

  return (
    <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
      <ResizablePanelGroup
        orientation="horizontal"
        className="w-full max-w-6xl h-full"
      >
        <ResizablePanel minSize={25} defaultSize={60}>
          <div className="h-full p-2">
            <Card className="h-full flex flex-col py-0 overflow-hidden">
              <CardContent className="flex-1 px-0 relative">
                <div className="relative h-full">
                  <div className="absolute top-2 left-4 right-4 z-10">
                    <Item variant="default" size="xs" className="bg-card">
                      <ItemMedia variant="icon">
                        <MapPinned />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>
                          {analysisData.groundedLocationData?.categories}
                        </ItemTitle>
                        <ItemDescription>
                          {analysisData.locationName}
                        </ItemDescription>
                      </ItemContent>
                    </Item>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="default"
                          className="absolute right-0 mt-1 bg-card hover:bg-accent"
                        >
                          <ListFilter />
                          Filtry
                          <ChevronDown />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="data-[state=closed]:slide-out-to-right-10 data-[state=open]:slide-in-from-right-10 data-[state=closed]:slide-out-to-top-20 data-[state=open]:slide-in-from-top-20 data-[state=closed]:zoom-out-100 w-56 duration-400"
                      >
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Typy bodů zájmu</DropdownMenuLabel>
                          <DropdownMenuItem
                            className="justify-between"
                            onSelect={(event) => event.preventDefault()}
                          >
                            <Trophy />
                            <span className="flex-1">Konkurence</span>
                            <Switch
                              id="airplane-mode"
                              checked={filters.competitors}
                              onCheckedChange={(value) =>
                                setFilters((prev) => ({
                                  ...prev,
                                  competitors: value,
                                }))
                              }
                            />
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="justify-between"
                            onSelect={(event) => event.preventDefault()}
                          >
                            <TrainFront />
                            <span className="flex-1">Doprava</span>
                            <Switch
                              id="airplane-mode"
                              checked={filters.transit}
                              onCheckedChange={(value) =>
                                setFilters((prev) => ({
                                  ...prev,
                                  transit: value,
                                }))
                              }
                            />
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="justify-between"
                            onSelect={(event) => event.preventDefault()}
                          >
                            <ShoppingCart />
                            <span className="flex-1">Nákupy</span>
                            <Switch
                              id="airplane-mode"
                              checked={filters.shopping}
                              onCheckedChange={(value) =>
                                setFilters((prev) => ({
                                  ...prev,
                                  shopping: value,
                                }))
                              }
                            />
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="justify-between"
                            onSelect={(event) => event.preventDefault()}
                          >
                            <Building />
                            <span className="flex-1">Kanceláře</span>
                            <Switch
                              id="airplane-mode"
                              checked={filters.office}
                              onCheckedChange={(value) =>
                                setFilters((prev) => ({
                                  ...prev,
                                  office: value,
                                }))
                              }
                            />
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="justify-between"
                            onSelect={(event) => event.preventDefault()}
                          >
                            <House />
                            <span className="flex-1">Bydlení</span>
                            <Switch
                              id="airplane-mode"
                              checked={filters.residential}
                              onCheckedChange={(value) =>
                                setFilters((prev) => ({
                                  ...prev,
                                  residential: value,
                                }))
                              }
                            />
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="justify-between"
                            onSelect={(event) => event.preventDefault()}
                          >
                            <MapPinHouse />
                            <span className="flex-1">Reality</span>
                            <Switch
                              id="airplane-mode"
                              checked={filters.availableProperties}
                              onCheckedChange={(value) =>
                                setFilters((prev) => ({
                                  ...prev,
                                  availableProperties: value,
                                }))
                              }
                            />
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="justify-between"
                            onSelect={(event) => event.preventDefault()}
                          >
                            <CircleEllipsis />
                            <span className="flex-1">Ostatní</span>
                            <Switch
                              id="airplane-mode"
                              checked={filters.other}
                              onCheckedChange={(value) =>
                                setFilters((prev) => ({
                                  ...prev,
                                  other: value,
                                }))
                              }
                            />
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <MapViewNew
                    analysisData={analysisData}
                    filterState={filters}
                  />
                  <Drawer
                    open={true}
                    modal={false}
                    dismissible={false}
                    snapPoints={snapPoints}
                    activeSnapPoint={snapPoints[activeSnapPoint]}
                    setActiveSnapPoint={(point) =>
                      setActiveSnapPoint(snapPoints.indexOf(point))
                    }
                    direction="bottom"
                    fadeFromIndex={0}
                  >
                    <DrawerContent className="z-20 bg-card/90 backdrop-blur-sm">
                      <DrawerHeader>
                        <div className="flex justify-between items-center">
                          <DrawerTitle>Metriky</DrawerTitle>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={toggleDrawer}
                            >
                              {activeSnapPoint === 0 ? (
                                <ChevronUp className="h-6 w-6" />
                              ) : (
                                <ChevronDown className="h-6 w-6" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={toggleMaximize}
                            >
                              {activeSnapPoint === 2 ? (
                                <Minimize2 className="h-6 w-6" />
                              ) : (
                                <Maximize2 className="h-6 w-6" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </DrawerHeader>
                      <div className="flex-1 overflow-y-auto p-4">
                        <ItemGroup className="grid grid-cols-3 gap-4">
                          <Item variant="outline">
                            <ItemHeader>Hodnocení lokality</ItemHeader>
                            <ItemContent>
                              <div className="flex items-end gap-2">
                                <div className="text-white font-bold text-2xl lg:text-3xl">
                                  {analysisData.metrics?.localityScore ?? 0}
                                </div>
                                <div className="text-blue-400 text-sm lg:text-base pb-1">
                                  / 100
                                </div>
                              </div>
                              {/* Progress bar */}
                              <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${analysisData.metrics?.localityScore ?? 0}%`,
                                  }}
                                />
                              </div>
                            </ItemContent>
                          </Item>
                          <Item variant="outline">
                            <ItemHeader>Průchodnost</ItemHeader>
                            <ItemContent>
                              <div className="flex items-end gap-2">
                                <div className="text-white font-bold text-2xl lg:text-3xl">
                                  {analysisData.metrics?.footfallScore ?? 0}
                                </div>
                                <div className="text-purple-400 text-sm lg:text-base pb-1">
                                  / 100
                                </div>
                              </div>
                              {/* Progress bar */}
                              <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${analysisData.metrics?.footfallScore ?? 0}%`,
                                  }}
                                />
                              </div>
                            </ItemContent>
                          </Item>
                          <Item variant="outline">
                            <ItemHeader>Doporučené hodiny</ItemHeader>
                            <ItemContent>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="w-6 h-6 lg:w-8 lg:h-8 text-pink-400" />
                                <div className="text-white font-bold text-xl lg:text-2xl">
                                  {analysisData.metrics?.recommendedHours ||
                                    "N/A"}
                                </div>
                              </div>
                            </ItemContent>
                          </Item>
                          {/* {models.map((model) => (
                            <Item key={model.name} variant="outline">
                              <ItemHeader>
                                <Image
                                  src="/moon.png"
                                  alt={model.name}
                                  width={128}
                                  height={128}
                                  className="aspect-square w-full rounded-sm object-cover"
                                />
                              </ItemHeader>
                              <ItemContent>
                                <ItemTitle>{model.name}</ItemTitle>
                                <ItemDescription>
                                  {model.description}
                                </ItemDescription>
                              </ItemContent>
                            </Item>
                          ))} */}
                        </ItemGroup>
                      </div>
                    </DrawerContent>
                  </Drawer>
                </div>
              </CardContent>
            </Card>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel minSize={25} defaultSize={40}>
          <div className="h-full p-2">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>AI Asistent</CardTitle>
                <CardDescription>
                  Chatujte s naším AI asistentem pro analýzu lokality
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 flex flex-col">
                <Conversation className="flex-1">
                  <ConversationContent>
                    {messages.length === 0 ? (
                      <ConversationEmptyState
                        description="Messages will appear here as the conversation progresses."
                        icon={<MessageSquareIcon className="size-6" />}
                        title="Start a conversation"
                      />
                    ) : (
                      <>
                        {messages.map(({ id, role, content }, index) => {
                          // Clean the first message by removing JSON code blocks

                          return (
                            <Message from={role} key={id}>
                              <MessageContent>{content}</MessageContent>
                              {role === "assistant" && (
                                <MessageToolbar>
                                  <MessageActions>
                                    <MessageAction
                                      label="Retry"
                                      onClick={() =>
                                        toast.info(
                                          "Opětovný dotaz zatím není implementován.",
                                        )
                                      }
                                      tooltip="Zkusit znovu"
                                    >
                                      <RefreshCcwIcon className="size-4" />
                                    </MessageAction>
                                    <MessageAction
                                      label="Like"
                                      onClick={() =>
                                        setLiked((prev) => ({
                                          ...prev,
                                          [id]: !prev[id],
                                        }))
                                      }
                                      tooltip="Dobrá odpověď"
                                    >
                                      <ThumbsUpIcon
                                        className="size-4"
                                        fill={
                                          liked[id] ? "currentColor" : "none"
                                        }
                                      />
                                    </MessageAction>
                                    <MessageAction
                                      label="Dislike"
                                      onClick={() =>
                                        setDisliked((prev) => ({
                                          ...prev,
                                          [id]: !prev[id],
                                        }))
                                      }
                                      tooltip="Špatná odpověď"
                                    >
                                      <ThumbsDownIcon
                                        className="size-4"
                                        fill={
                                          disliked[id] ? "currentColor" : "none"
                                        }
                                      />
                                    </MessageAction>
                                    <MessageAction
                                      label="Copy"
                                      onClick={() => handleCopy(content)}
                                      tooltip="Zkopírovat"
                                    >
                                      <CopyIcon className="size-4" />
                                    </MessageAction>
                                  </MessageActions>
                                </MessageToolbar>
                              )}
                            </Message>
                          );
                        })}
                        {status === "streaming" && (
                          <Message from="assistant" key="loading">
                            <MessageContent>
                              <Shimmer>Přemýšlím</Shimmer>
                            </MessageContent>
                          </Message>
                        )}
                      </>
                    )}
                  </ConversationContent>
                  <ConversationScrollButton />
                </Conversation>
                {/* Suggestions */}
                {currentSuggestions.length > 0 && status === "ready" && (
                  <div className="px-2 py-2">
                    <Suggestions>
                      {currentSuggestions.map((suggestion) => (
                        <Suggestion
                          key={suggestion}
                          suggestion={suggestion}
                          onClick={() => setPromptInputText(suggestion)}
                        />
                      ))}
                    </Suggestions>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <PromptInputProvider>
                  <PromptInputWrapper
                    status={status}
                    onSubmit={handleSubmit}
                    suggestionText={promptInputText}
                    onSuggestionTextConsumed={() => setPromptInputText("")}
                  />
                </PromptInputProvider>
              </CardFooter>
            </Card>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

function PromptInputWrapper({
  status,
  onSubmit,
  suggestionText,
  onSuggestionTextConsumed,
}: {
  status: "submitted" | "streaming" | "ready" | "error";
  onSubmit: (message: PromptInputMessage, clearInput: () => void) => void;
  suggestionText?: string;
  onSuggestionTextConsumed?: () => void;
}) {
  const controller = usePromptInputController();

  // When suggestionText changes, insert it into the input
  useEffect(() => {
    if (suggestionText) {
      controller.textInput.setInput(suggestionText);
      onSuggestionTextConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestionText]);

  const handleSubmitWithClear = (message: PromptInputMessage) => {
    onSubmit(message, controller.textInput.clear);
  };

  return (
    <div className="size-full">
      <PromptInput globalDrop multiple onSubmit={handleSubmitWithClear}>
        <PromptInputBody>
          <PromptInputTextarea
            onChange={(e) => controller.textInput.setInput(e.target.value)}
            placeholder="Zeptejte se mě na cokoli..."
            value={controller.textInput.value}
          />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools></PromptInputTools>
          <PromptInputSubmit status={status} />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
