"use client";

import { useState } from "react";
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
  MailIcon,
  MessageSquareIcon,
  BellIcon,
  ListFilter,
  Trophy,
  TrainFront,
  ShoppingCart,
  Building,
  House,
  MapPinHouse,
  CircleEllipsis,
} from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Switch } from "./ui/switch";

const models = [
  {
    name: "v0-1.5-sm",
    description: "Everyday tasks and UI generation.",
    image:
      "https://images.unsplash.com/photo-1650804068570-7fb2e3dbf888?q=80&w=640&auto=format&fit=crop",
    credit: "Valeria Reverdo on Unsplash",
  },
  {
    name: "v0-1.5-lg",
    description: "Advanced thinking or reasoning.",
    image:
      "https://images.unsplash.com/photo-1610280777472-54133d004c8c?q=80&w=640&auto=format&fit=crop",
    credit: "Michael Oeser on Unsplash",
  },
  {
    name: "v0-2.0-mini",
    description: "Open Source model for everyone.",
    image:
      "https://images.unsplash.com/photo-1602146057681-08560aee8cde?q=80&w=640&auto=format&fit=crop",
    credit: "Cherry Laithang on Unsplash",
  },
];

const snapPoints = ["8%", "35%", "80%"];

export default function AnalysisResultsDesktop({
  analysisData,
}: {
  analysisData: AnalysisData;
}) {
  const [activeSnapPoint, setActiveSnapPoint] = useState<number>(1);

  const [googleSwitch, setGoogleSwitch] = useState(false);
  const [twitterSwitch, setTwitterSwitch] = useState(false);
  const [linkedinSwitch, setLinkedinSwitch] = useState(false);
  const [dribbbleSwitch, setDribbbleSwitch] = useState(false);
  const [behanceSwitch, setBehanceSwitch] = useState(false);

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
                  <MapViewNew analysisData={analysisData} />
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
                          {models.map((model) => (
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
                          ))}
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
                <CardTitle>Chat Card</CardTitle>
                <CardDescription>
                  This card uses the small size variant.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p>
                  The card component supports a size prop that can be set to
                  &quot;sm&quot; for a more compact appearance.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  Action
                </Button>
              </CardFooter>
            </Card>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
