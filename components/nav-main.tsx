"use client";

import { usePathname, useRouter } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LucideProps, Plus } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;
  }[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2 px-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Nová analýza"
              className="px-4 bg-primary text-primary-foreground hover:cursor-pointer hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
              onClick={() => router.push("/app/new-analysis")}
            >
              <Plus />
              <span>Nová analýza</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                onClick={() => router.push(item.url)}
                className="px-4 cursor-pointer"
                isActive={pathname === item.url}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
