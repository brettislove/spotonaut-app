import {
  Building,
  ChevronDown,
  ChevronUpIcon,
  CircleEllipsis,
  Clock,
  House,
  ListFilter,
  MapPinHouse,
  MapPinned,
  ShoppingCart,
  TrainFront,
  Trophy,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "./ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import MapViewNew from "./map-view-new";
import { AnalysisData } from "@/lib/types/analysis";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

export default function MetricsPanel({
  analysisData,
  className,
}: {
  analysisData: AnalysisData;
  className?: string;
}) {
  const [filters, setFilters] = useState({
    competitors: true,
    transit: true,
    shopping: true,
    office: true,
    residential: true,
    other: true,
    availableProperties: true,
  });

  return (
    <Card
      className={`h-full flex flex-col gap-0 py-0 overflow-hidden ${className}`}
    >
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
                <ItemDescription>{analysisData.locationName}</ItemDescription>
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
          <MapViewNew analysisData={analysisData} filterState={filters} />
          {/* <Drawer
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
                    <Button variant="ghost" size="icon" onClick={toggleDrawer}>
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
                          {analysisData.metrics?.recommendedHours || "N/A"}
                        </div>
                      </div>
                    </ItemContent>
                  </Item>
                </ItemGroup>
              </div>
            </DrawerContent>
          </Drawer> */}
        </div>
      </CardContent>
      <CardFooter className="bg-background p-0">
        {/* <Card className="w-full">
          <CardContent> */}
        <Collapsible
          defaultOpen={true}
          className="data-[state=open]:bg-background rounded-md w-full p-2"
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="group w-full text-md font-bold">
              Metriky
              <ChevronUpIcon className="ml-auto group-data-[state=open]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col items-start gap-2 p-2.5 pt-0 text-sm data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down transition-all duration-300">
            <div className="flex-1 overflow-y-auto pt-2">
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
                        {analysisData.metrics?.recommendedHours || "N/A"}
                      </div>
                    </div>
                  </ItemContent>
                </Item>
              </ItemGroup>
            </div>
          </CollapsibleContent>
        </Collapsible>
        {/* </CardContent>
        </Card> */}
      </CardFooter>
    </Card>
  );
}
