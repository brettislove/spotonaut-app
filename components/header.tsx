"use client";
import Link from "next/link";
import { LogOut, Menu, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
// import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Avatar from "boring-avatars";
import { handleSignOut } from "@/utils/auth";
import { useAnalysis } from "@/lib/contexts/analysis-context";

const menuItems = [
  { name: "Jak to funguje", href: "/how-it-works" },
  { name: "Blog", href: "/blog" },
  { name: "Ceník", href: "/pricing" },
  { name: "Kontakt", href: "/kontakt" },
];

export const HeroHeader = ({
  setLoginModalOpen,
  setSignupModalOpen,
  setAccountSettingsModalOpen,
}: {
  setLoginModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSignupModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setAccountSettingsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { resetAnalysis } = useAnalysis();
  const { data: session } = useSession();
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  return (
    <header>
      {/* Mobile menu overlay */}
      {menuState && (
        <div
          className="fixed inset-0 z-10 bg-black/20 lg:hidden"
          onClick={() => setMenuState(false)}
        />
      )}
      <nav
        data-state={menuState && "active"}
        className="fixed z-20 w-full px-2"
      >
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12",
            isScrolled &&
              "bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5",
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link href="/" aria-label="home" className="flex items-center">
                <span
                  className="text-xl font-bold"
                  style={{ color: "rgb(164, 59, 254)" }}
                >
                  Spot
                </span>
                <Image
                  src="/spotonaut_logo.png"
                  alt="SpotOnaut"
                  width={32}
                  height={32}
                  className="inline-block mx-0.5"
                  priority
                  unoptimized
                />
                <span
                  className="text-xl font-bold"
                  style={{ color: "rgb(47, 61, 214)" }}
                >
                  naut
                </span>
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-accent-foreground block duration-150"
                    >
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-accent-foreground block duration-150"
                        onClick={() => setMenuState(false)}
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                {session ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost">
                        <Avatar
                          name={session?.user?.email || "User"}
                          size={32}
                        />
                        {session.user?.email}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuLabel className="flex items-center gap-2">
                        <div className="flex flex-1 flex-col">
                          <span className="text-popover-foreground">
                            {session.user?.name}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {session.user?.email}
                          </span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setAccountSettingsModalOpen(true)}
                      >
                        <Settings />
                        <span>Nastavení účtu</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => handleSignOut({ resetAnalysis })}
                      >
                        <LogOut />
                        <span>Odhlásit se</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "cursor-pointer",
                        isScrolled && "lg:hidden",
                      )}
                      onClick={() => setLoginModalOpen(true)}
                    >
                      <span>Přihlásit se</span>
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className={cn(
                        "cursor-pointer",
                        isScrolled && "lg:hidden",
                      )}
                      onClick={() => setSignupModalOpen(true)}
                    >
                      <span>Zaregistrovat se</span>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className={cn(isScrolled ? "lg:inline-flex" : "hidden")}
                      onClick={() => setLoginModalOpen(true)}
                    >
                      <span>Začít</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
