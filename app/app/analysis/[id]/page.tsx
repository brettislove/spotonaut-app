import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createTranslator } from "@/lib/i18n/translator";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  isSupportedLocale,
} from "@/lib/i18n/config";
import { cookies } from "next/headers";
import { AnalysisProvider } from "@/lib/contexts/analysis-context";
import AnalysisViewer from "@/components/analysis-results/analysis-viewer";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AnalysisDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const locale = isSupportedLocale(localeCookie)
    ? localeCookie
    : DEFAULT_LOCALE;
  const t = createTranslator(locale);

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
          <SiteHeader pageName={t("analysisPage.title")} />
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
