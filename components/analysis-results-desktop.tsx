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
  ItemMedia,
  ItemTitle,
} from "./ui/item";
import { MapPinned, ChevronUp, ChevronDown } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";

export default function AnalysisResultsDesktop({
  analysisData,
}: {
  analysisData: AnalysisData;
}) {
  const [activeSnapPoint, setActiveSnapPoint] = useState<string>("25vh");

  const toggleDrawer = () => {
    setActiveSnapPoint(activeSnapPoint === "100px" ? "25vh" : "100px");
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
                  <div className="absolute top-4 left-4 right-4 z-10">
                    <Item variant="default" className="bg-card">
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
                  </div>
                  <MapViewNew analysisData={analysisData} />
                  <Drawer
                    open={true}
                    modal={false}
                    dismissible={false}
                    snapPoints={["100px", "25vh"]}
                    activeSnapPoint={activeSnapPoint}
                    setActiveSnapPoint={setActiveSnapPoint}
                    direction="bottom"
                    fadeFromIndex={0}
                  >
                    <DrawerContent className="z-20 bg-card/90 backdrop-blur-sm">
                      <DrawerHeader>
                        <div className="flex justify-between items-center">
                          <DrawerTitle>Metriky</DrawerTitle>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleDrawer}
                          >
                            {activeSnapPoint === "100px" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </DrawerHeader>
                      <div className="flex-1 overflow-y-auto p-4">
                        <p className="text-sm text-muted-foreground">
                          Detailed analysis information will appear here. This
                          content is scrollable when expanded.
                        </p>
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
