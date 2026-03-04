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
import { useLocale } from "@/hooks/use-locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isSupportedLocale } from "@/lib/i18n/config";

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
  const { locale, setLocale, t } = useLocale();
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  const handleLocaleChange = (value: string) => {
    if (isSupportedLocale(value)) {
      setLocale(value);
    }
  };

  const menuItems = [
    { name: t("header.menu.howItWorks"), href: "/how-it-works" },
    { name: t("header.menu.blog"), href: "/blog" },
    { name: t("header.menu.pricing"), href: "/pricing" },
    { name: t("header.menu.contact"), href: "/kontakt" },
  ];

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <header>
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
                aria-label={
                  menuState
                    ? t("header.mobile.closeMenu")
                    : t("header.mobile.openMenu")
                }
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
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <Select value={locale} onValueChange={handleLocaleChange}>
                  <SelectTrigger
                    size="sm"
                    aria-label={t("common.language")}
                    className="w-full sm:w-auto border-none bg-transparent shadow-none hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 dark:bg-transparent"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cs">{t("common.czech")}</SelectItem>
                    <SelectItem value="en">{t("common.english")}</SelectItem>
                  </SelectContent>
                </Select>
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
                        <span>{t("header.auth.accountSettings")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => handleSignOut({ resetAnalysis })}
                      >
                        <LogOut />
                        <span>{t("header.auth.signOut")}</span>
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
                      <span>{t("header.auth.signIn")}</span>
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
                      <span>{t("header.auth.signUp")}</span>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className={cn(isScrolled ? "lg:inline-flex" : "hidden")}
                      onClick={() => setLoginModalOpen(true)}
                    >
                      <span>{t("header.auth.start")}</span>
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
