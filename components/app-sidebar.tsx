"use client";

import { useEffect, useState } from "react";
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
import { CircleQuestionMark, HandCoins, Settings } from "lucide-react";
import { Analysis } from "@/lib/types/analysis";

const data = {
  user: {
    email: "m@example.com",
    tier: "Sonda",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    // {
    //   title: "Dashboard",
    //   url: "#",
    //   icon: IconDashboard,
    // },
    // {
    //   title: "Lifecycle",
    //   url: "#",
    //   icon: IconListDetails,
    // },
    // {
    //   title: "Analytics",
    //   url: "#",
    //   icon: IconChartBar,
    // },
    // {
    //   title: "Projects",
    //   url: "#",
    //   icon: IconFolder,
    // },
    // {
    //   title: "Team",
    //   url: "#",
    //   icon: IconUsers,
    // },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Nastavení",
      url: "#",
      icon: Settings,
    },
    {
      title: "Plány a ceník",
      url: "/app/billing",
      icon: HandCoins,
    },
    {
      title: "Jak to funguje?",
      url: "/app/how-it-works",
      icon: CircleQuestionMark,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [, setIsLoading] = useState(true);

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
        <NavHistory analyses={analyses} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavCreditMeter />
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
