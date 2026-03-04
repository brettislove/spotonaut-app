"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { RecentAnalyses } from "@/components/recent-analyses";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useLocale } from "@/hooks/use-locale";

export default function Page() {
  const { t } = useLocale();
  return (
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
        <SiteHeader pageName={t("dashboard.pageName")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Dashboard Header */}
              <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">
                    {t("dashboard.welcome")}
                  </h1>
                  {/* <p className="text-muted-foreground">
                    Přehled vašich analýz a dat
                  </p> */}
                </div>
              </div>
              <div className="space-y-2">
                <div className="px-4 lg:px-6">
                  <h2 className="text-lg font-semibold">
                    {t("dashboard.recentAnalyses")}
                  </h2>
                </div>
                <RecentAnalyses />
              </div>
              {/* <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} /> */}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
