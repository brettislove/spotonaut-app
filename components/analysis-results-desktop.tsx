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

export default function AnalysisResultsDesktop({
  analysisData,
}: {
  analysisData: AnalysisData;
}) {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
      <ResizablePanelGroup
        orientation="horizontal"
        className="w-full max-w-6xl h-full"
      >
        <ResizablePanel minSize={25} defaultSize={60}>
          <div className="h-full p-2">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Map Card</CardTitle>
                <CardDescription>
                  This card uses the small size variant.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 px-6">
                <MapViewNew analysisData={analysisData} />
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  Action
                </Button>
              </CardFooter>
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
