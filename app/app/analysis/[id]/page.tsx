import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AnalysisProvider } from "@/lib/contexts/analysis-context";
import AnalysisViewer from "@/components/analysis-results/analysis-viewer";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AnalysisDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <AnalysisProvider key={id} skipRestore>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader pageName="Analýza" />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <AnalysisViewer analysisId={id} />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AnalysisProvider>
  );
}
