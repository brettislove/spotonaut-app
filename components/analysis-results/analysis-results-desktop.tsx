import { AnalysisData } from "@/lib/types/analysis";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import ChatPanel from "../chat/chat-panel";
import MetricsPanel from "../metrics-panel";

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
