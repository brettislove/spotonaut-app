"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Info, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="py-16 md:pt-32 md:pb-24 bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <h1 className="text-center text-4xl font-semibold lg:text-5xl">
            Zjistěte skutečný potenciál vaší lokality během vteřin.
          </h1>
          <p>
            Vyberte si plán, který odpovídá vašim ambicím. Od prvního nápadu po
            franšízovou síť.
          </p>
        </div>

        {/* <div className="mt-8 flex items-center justify-center gap-4 md:mt-12">
          <span
            className={`text-sm ${!isAnnual ? "font-semibold" : "text-muted-foreground"}`}
          >
            Měsíční
          </span>
          <Switch
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
            aria-label="Přepnout na roční platbu"
          />
          <span
            className={`text-sm ${isAnnual ? "font-semibold" : "text-muted-foreground"}`}
          >
            Roční
            {/* <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
              -20%
            </span> 
            <Badge
              variant="outline"
              className="ml-2 text-green-600 dark:text-green-400 border-green-200 dark:border-green-700"
            >
              -20%
            </Badge>
          </span>
        </div> */}

        <div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-4 items-stretch">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-medium">🌑 Sonda</CardTitle>
              <span className="my-3 block text-2xl font-semibold">
                0 Kč {isAnnual ? "/ rok" : "/ měsíc"}
              </span>
              <CardDescription className="text-sm">
                Pro rychlý sken okolí.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 flex-grow">
              <hr className="border-dashed" />

              <ul className="list-outside space-y-3 text-sm">
                {[
                  "25 kreditů do začátku (jednorázově)",
                  'Základní "Skóre lokality"',
                  "Náhled na mapě",
                  "Pokročilý AI chat",
                  // "Možnost uložit si 1 analýzu",
                  "Zobrazení realitních inzercí",
                ].map((item, index) => {
                  const isDisabled = index > 3; // First 5 items are available, rest are disabled
                  return (
                    <li
                      key={index}
                      className={`flex items-center gap-2 ${isDisabled ? "text-muted-foreground" : ""}`}
                    >
                      {isDisabled ? (
                        <X className="size-3 text-muted-foreground" />
                      ) : (
                        <Check className="size-3" />
                      )}
                      <span className={isDisabled ? "line-through" : ""}>
                        {item}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>

            <CardFooter className="mt-auto">
              <Button asChild variant="outline" className="w-full">
                <Link href="">Vyzkoušet zdarma</Link>
              </Button>
            </CardFooter>
          </Card>
          <Card className="relative flex flex-col">
            <span className="bg-secondary absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center rounded-full from-purple-400 to-amber-300 px-3 py-1 text-xs font-medium text-amber-950 ring-1 ring-inset ring-white/20 ring-offset-1 ring-offset-gray-950/5">
              🔥 Nejpopulárnější
            </span>

            <CardHeader>
              <CardTitle className="font-medium">🚀 Raketa</CardTitle>
              <span className="my-3 block text-2xl font-semibold">
                {isAnnual ? (
                  <>
                    <span className="text-muted-foreground line-through mr-2">
                      399 Kč
                    </span>
                    <span className="text-3xl text-primary block">319 Kč</span>
                    <span className="text-sm text-muted-foreground block">
                      / měsíc (roční platba)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-muted-foreground line-through block">
                      399 Kč
                    </span>
                    <span className="text-3xl text-primary mr-4">299 Kč</span>
                    <span className="text-sm text-muted-foreground block">
                      / měsíc (early bird cena)
                    </span>
                  </>
                )}
              </span>
              <CardDescription className="text-sm">
                Pokročilá analýza.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 flex-grow">
              <hr className="border-dashed" />
              <ul className="list-outside space-y-3 text-sm">
                {[
                  "Vše v plánu Sonda, plus:",
                  "200 kreditů / měsíc",
                  // "Profesionální PDF reporty",
                  "Zobrazení realitních inzercí",
                  "Možnost uložit si neomezený počet analýz",
                  // "Možnost jednorázově dokoupit kredity",
                ].map((item, index) => {
                  const isDisabled = index > 9; // First 10 items are available, last 3 are disabled
                  return (
                    <li
                      key={index}
                      className={`flex items-center gap-2 ${isDisabled ? "text-muted-foreground" : ""}`}
                    >
                      {isDisabled ? (
                        <span className="size-3 text-muted-foreground">✗</span>
                      ) : (
                        <Check className="size-3" />
                      )}
                      <span className={isDisabled ? "line-through" : ""}>
                        {item}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>

            <CardFooter className="mt-auto">
              <Button asChild className="w-full">
                <Link href="">Začít naplno</Link>
              </Button>
            </CardFooter>
          </Card>
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-medium">🛰️ Modul</CardTitle>
              <span className="my-3 block text-2xl font-semibold">
                {isAnnual ? (
                  <>
                    <span className="text-muted-foreground line-through mr-2">
                      2990 Kč
                    </span>
                    <span className="text-3xl text-primary">2392 Kč</span>
                    <span className="text-sm text-muted-foreground block">
                      / měsíc (roční platba)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-muted-foreground line-through block">
                      2999 Kč
                    </span>
                    <span className="text-3xl text-primary mr-4">2249 Kč</span>
                    <span className="text-sm text-muted-foreground block">
                      / měsíc (early bird cena)
                    </span>
                  </>
                )}
              </span>
              <CardDescription className="text-sm">
                Pro profesionály.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 flex-grow">
              <hr className="border-dashed" />

              <ul className="list-outside space-y-3 text-sm">
                {[
                  "Vše v plánu Raketa, plus:",
                  "2 200 kreditů / měsíc",
                  // "Týmový přístup (více uživatelů)",
                  // "Export do Excelu/CSV",
                  // "Srovnávací analýzy lokalit",
                  "Prioritní podpora",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="size-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button asChild variant="outline" className="w-full">
                <Link href="">Profi nasazení</Link>
              </Button>
            </CardFooter>
          </Card>
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-medium">🪐 Orbita</CardTitle>
              <span className="my-3 block text-2xl font-semibold">
                {/* {isAnnual ? (
                  <>
                    <span className="text-muted-foreground line-through mr-2"></span>
                    <span className="text-3xl text-primary">Dle dohody</span>
                    <span className="text-sm text-muted-foreground block">
                      / měsíc (roční platba)
                    </span>
                  </>
                ) : ( */}
                Dle dohody
                {/* )} */}
              </span>
              <CardDescription className="text-sm">
                Podniková řešení na míru.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 flex-grow">
              <hr className="border-dashed" />

              <ul className="list-outside space-y-3 text-sm">
                {["Další funkce na míru dle potřeb vašeho podnikání"].map(
                  (item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="size-5" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </CardContent>

            <CardFooter className="mt-auto">
              <Button asChild variant="outline" className="w-full">
                <Link href="/kontakt">Kontaktujte nás</Link>
              </Button>
            </CardFooter>
          </Card>
          <p className="text-sm text-muted-foreground mt-4 col-span-4 text-center italic">
            Ceny jsou bez DPH.
          </p>
        </div>
      </div>
    </section>
  );
}
