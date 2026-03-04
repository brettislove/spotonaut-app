"use client";

import { IconUserCircle } from "@tabler/icons-react";

// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import { handleSignOut } from "@/utils/auth";
import { useAnalysis } from "@/lib/contexts/analysis-context";
import { LogOut } from "lucide-react";
import Avatar from "boring-avatars";
import { getTierName } from "@/lib/constants/tiers";
import { Badge } from "./ui/badge";
import { useLocale } from "@/hooks/use-locale";

export function NavUser() {
  const { data: session } = useSession();
  const { resetAnalysis } = useAnalysis();
  const { t } = useLocale();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="w-6 h-6 flex-shrink-0">
                <Avatar name={session?.user?.email || "User"} size={24} />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium mb-1">
                  {session?.user?.email}
                </span>
                <Badge
                  variant="outline"
                  className="text-muted-foreground truncate text-xs"
                >
                  {getTierName(session?.user?.tier ?? 0)}{" "}
                </Badge>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={"bottom"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div className="w-6 h-6 flex-shrink-0">
                  <Avatar name={session?.user?.email || "User"} size={24} />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium mb-1">
                    {session?.user?.email}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {t("navUser.levelPrefix")}{" "}
                    {getTierName(session?.user?.tier || 0)}{" "}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconUserCircle />
                {t("navUser.account")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => handleSignOut({ resetAnalysis })}
            >
              <LogOut />
              {t("navUser.signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
