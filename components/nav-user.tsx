"use client";

import { IconUserCircle } from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

export function NavUser() {
  const { data: session } = useSession();
  const { resetAnalysis } = useAnalysis();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage
                  src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png"
                  alt="Phillip George"
                />
                <AvatarFallback className="text-xs">PG</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {session?.user?.email}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  Úroveň: Sonda
                </span>
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
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src="https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png"
                    alt="Phillip George"
                  />
                  <AvatarFallback className="text-xs">PG</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {session?.user?.email}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    Úroveň: Sonda
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconUserCircle />
                Účet
              </DropdownMenuItem>
              {/* <DropdownMenuItem>
                <IconCreditCard />
                Billing
              </DropdownMenuItem> */}
              {/* <DropdownMenuItem>
                <IconNotification />
                Notifications
              </DropdownMenuItem> */}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => handleSignOut({ resetAnalysis })}
            >
              <LogOut />
              Odhlásit se
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
