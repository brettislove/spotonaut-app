"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  IconCamera,
  IconFileAi,
  IconFileDescription,
} from "@tabler/icons-react";

import { NavHistory } from "@/components/nav-history";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import SpotonautLogo from "./spotonaut-logo";
import NavCreditMeter from "./nav-credit-meter";
import { CircleQuestionMark, Home, Settings } from "lucide-react";
import { Analysis } from "@/lib/types/analysis";
import { useLocale } from "@/hooks/use-locale";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isSupportedLocale } from "@/lib/i18n/config";

// navClouds are built inside the component to allow localization via `t`

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [, setIsLoading] = useState(true);
  const pathname = usePathname();
  const { locale, setLocale, t } = useLocale();

  const data = {
    navMain: [
      {
        title: t("appSidebar.home"),
        url: "/app",
        icon: Home,
      },
    ],
    navClouds: [
      {
        title: t("appSidebar.clouds.capture.title"),
        icon: IconCamera,
        isActive: true,
        url: "#",
        items: [
          {
            title: t("appSidebar.clouds.capture.items.activeProposals"),
            url: "#",
          },
          { title: t("appSidebar.clouds.capture.items.archived"), url: "#" },
        ],
      },
      {
        title: t("appSidebar.clouds.proposal.title"),
        icon: IconFileDescription,
        url: "#",
        items: [
          {
            title: t("appSidebar.clouds.proposal.items.activeProposals"),
            url: "#",
          },
          { title: t("appSidebar.clouds.proposal.items.archived"), url: "#" },
        ],
      },
      {
        title: t("appSidebar.clouds.prompts.title"),
        icon: IconFileAi,
        url: "#",
        items: [
          {
            title: t("appSidebar.clouds.prompts.items.activeProposals"),
            url: "#",
          },
          { title: t("appSidebar.clouds.prompts.items.archived"), url: "#" },
        ],
      },
    ],
    navSecondary: [
      {
        title: t("appSidebar.settings"),
        url: "#",
        icon: Settings,
      },
      {
        title: t("appSidebar.howItWorks"),
        url: "/app/how-it-works",
        icon: CircleQuestionMark,
      },
      {
        title: t("appSidebar.termsAndPolicies"),
        url: "/about",
        icon: IconFileDescription,
        items: [
          {
            title: t("appSidebar.about"),
            url: "/about",
          },
          {
            title: t("appSidebar.contact"),
            url: "/kontakt",
          },
          {
            title: t("appSidebar.privacy"),
            url: "/privacy",
          },
          {
            title: t("appSidebar.terms"),
            url: "/terms",
          },
          {
            title: t("appSidebar.cookies"),
            url: "/cookies",
          },
        ],
      },
    ],
  };

  const handleLocaleChange = (value: string) => {
    if (isSupportedLocale(value)) {
      setLocale(value);
    }
  };

  // Extract active analysis ID from pathname like /app/analysis/[id]
  const activeAnalysisId = pathname?.match(/\/app\/analysis\/([^/]+)/)?.[1];

  useEffect(() => {
    async function fetchRecentAnalyses() {
      try {
        const response = await fetch("/api/analyses/recent");
        if (response.ok) {
          const data = await response.json();
          setAnalyses(data);
        }
      } catch (error) {
        console.error("Error fetching recent analyses:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecentAnalyses();
  }, []);

  const handleRename = (id: string, newName: string) => {
    setAnalyses((prev) =>
      prev.map((a) => (a.id === id ? { ...a, locationName: newName } : a)),
    );
  };

  const handleDelete = (id: string) => {
    setAnalyses((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <SpotonautLogo />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavHistory
          analyses={analyses}
          activeAnalysisId={activeAnalysisId}
          onRename={handleRename}
          onDelete={handleDelete}
        />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 pb-1">
          <Select value={locale} onValueChange={handleLocaleChange}>
            <SelectTrigger
              size="sm"
              aria-label={t("common.language")}
              className="w-full"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cs">{t("common.czech")}</SelectItem>
              <SelectItem value="en">{t("common.english")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <NavCreditMeter />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
