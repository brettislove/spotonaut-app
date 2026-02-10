import { AppSidebar } from "@/components/app-sidebar";
import CreditsExplained from "@/components/credits-explained";
import Pricing from "@/components/pricing";
import PricingComparator from "@/components/pricing-comparator";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Page() {
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
        <SiteHeader pageName="Plány a ceník" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <Pricing />
              <CreditsExplained />
              <PricingComparator />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
