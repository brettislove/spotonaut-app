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
    <div className="flex flex-col items-center justify-center h-full w-full">
      <ResizablePanelGroup
        orientation="horizontal"
        className="w-full max-w-6xl flex-1"
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

      {/* AI disclaimer */}
      <div className="text-xs text-slate-400 px-3 py-2 max-w-6xl w-full text-center">
        Výsledky jsou založeny na AI a slouží pouze pro informační účely — nemusí být přesné ani úplné.
      </div>
    </div>
  );
}
