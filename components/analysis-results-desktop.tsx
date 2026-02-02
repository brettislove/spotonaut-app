"use client";

import { useState } from "react";
import { AnalysisData } from "@/lib/types/analysis";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
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
  ListFilter,
  Trophy,
  TrainFront,
  ShoppingCart,
  Building,
  House,
  MapPinHouse,
  CircleEllipsis,
  Clock,
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
import ChatPanel from "./chat-panel";
import MetricsPanel from "./metrics-panel";

const snapPoints = ["8%", "35%", "80%"];

export default function AnalysisResultsDesktop({
  analysisData,
}: {
  analysisData: AnalysisData;
}) {
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

  const toggleDrawer = () => {
    setActiveSnapPoint(activeSnapPoint === 0 ? 1 : 0);
  };

  const toggleMaximize = () => {
    setActiveSnapPoint(activeSnapPoint === 2 ? 1 : 2);
  };

  return (
    <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
      <ResizablePanelGroup
        orientation="horizontal"
        className="w-full max-w-6xl h-full"
      >
        <ResizablePanel minSize={25} defaultSize={60}>
          <div className="h-full p-2">
            {/* <Card className="h-full flex flex-col py-0 overflow-hidden">
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
                              {/* Progress bar 
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
                              {/* Progress bar 
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
                        </ItemGroup>
                      </div>
                    </DrawerContent>
                  </Drawer>
                </div>
              </CardContent>
            </Card> */}
            <MetricsPanel analysisData={analysisData} />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel minSize={25} defaultSize={40}>
          <div className="h-full p-2">
            <ChatPanel analysisData={analysisData} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
