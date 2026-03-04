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
import { Check, X } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";

export default function Pricing() {
  const [isAnnual] = useState(false);
  const { t, locale } = useLocale();

  return (
    <section className="py-16 md:pt-32 md:pb-24 bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <h1 className="text-center text-4xl font-semibold lg:text-5xl">
            {t("pricing.title")}
          </h1>
          <p>{t("pricing.intro")}</p>
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
              <CardTitle className="font-medium">
                {t("pricing.plans.sonda.title")}
              </CardTitle>
              <span className="my-3 block text-2xl font-semibold">
                {t("pricing.plans.sonda.price")}{" "}
                {isAnnual ? t("pricing.perYear") : t("pricing.perMonth")}
              </span>
              <CardDescription className="text-sm">
                {t("pricing.plans.sonda.description")}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 flex-grow">
              <hr className="border-dashed" />

              <ul className="list-outside space-y-3 text-sm">
                {[
                  t("pricing.plans.sonda.features.f1"),
                  t("pricing.plans.sonda.features.f2"),
                  t("pricing.plans.sonda.features.f3"),
                  t("pricing.plans.sonda.features.f4"),
                  t("pricing.plans.sonda.features.f5"),
                ].map((item, index) => {
                  const isDisabled = index > 3; // First 4 items available, last disabled
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
                <Link href="">{t("pricing.plans.sonda.cta")}</Link>
              </Button>
            </CardFooter>
          </Card>
          <Card className="relative flex flex-col">
            <span className="bg-secondary absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center rounded-full from-purple-400 to-amber-300 px-3 py-1 text-xs font-medium text-amber-950 ring-1 ring-inset ring-white/20 ring-offset-1 ring-offset-gray-950/5">
              {t("pricing.popularBadge")}
            </span>

            <CardHeader>
              <CardTitle className="font-medium">
                {t("pricing.plans.raketa.title")}
              </CardTitle>
              <span className="my-3 block text-2xl font-semibold">
                {isAnnual ? (
                  <>
                    <span className="text-muted-foreground line-through mr-2">
                      399 Kč
                    </span>
                    <span className="text-3xl text-primary block">319 Kč</span>
                    <span className="text-sm text-muted-foreground block">
                      {t("pricing.perMonthAnnualPayment")}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-muted-foreground line-through block">
                      399 Kč
                    </span>
                    <span className="text-3xl text-primary mr-4">299 Kč</span>
                    <span className="text-sm text-muted-foreground block">
                      {t("pricing.perMonthEarlyBird")}
                    </span>
                  </>
                )}
              </span>
              <CardDescription className="text-sm">
                {t("pricing.plans.raketa.description")}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 flex-grow">
              <hr className="border-dashed" />
              <ul className="list-outside space-y-3 text-sm">
                {[
                  t("pricing.plans.raketa.features.f1"),
                  t("pricing.plans.raketa.features.f2"),
                  ...(locale === "cs"
                    ? [t("pricing.plans.raketa.features.f3")]
                    : []),
                  t("pricing.plans.raketa.features.f4"),
                ].map((item, index) => {
                  const isDisabled = false;
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
                <Link href="">{t("pricing.plans.raketa.cta")}</Link>
              </Button>
            </CardFooter>
          </Card>
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-medium">
                {t("pricing.plans.modul.title")}
              </CardTitle>
              <span className="my-3 block text-2xl font-semibold">
                {isAnnual ? (
                  <>
                    <span className="text-muted-foreground line-through mr-2">
                      2990 Kč
                    </span>
                    <span className="text-3xl text-primary">2392 Kč</span>
                    <span className="text-sm text-muted-foreground block">
                      {t("pricing.perMonthAnnualPayment")}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-muted-foreground line-through block">
                      2999 Kč
                    </span>
                    <span className="text-3xl text-primary mr-4">2249 Kč</span>
                    <span className="text-sm text-muted-foreground block">
                      {t("pricing.perMonthEarlyBird")}
                    </span>
                  </>
                )}
              </span>
              <CardDescription className="text-sm">
                {t("pricing.plans.modul.description")}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 flex-grow">
              <hr className="border-dashed" />

              <ul className="list-outside space-y-3 text-sm">
                {[
                  t("pricing.plans.modul.features.f1"),
                  t("pricing.plans.modul.features.f2"),
                  t("pricing.plans.modul.features.f3"),
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
                <Link href="">{t("pricing.plans.modul.cta")}</Link>
              </Button>
            </CardFooter>
          </Card>
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-medium">
                {t("pricing.plans.orbita.title")}
              </CardTitle>
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
                {t("pricing.plans.orbita.priceNegotiable")}
                {/* )} */}
              </span>
              <CardDescription className="text-sm">
                {t("pricing.plans.orbita.description")}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 flex-grow">
              <hr className="border-dashed" />

              <ul className="list-outside space-y-3 text-sm">
                {[t("pricing.plans.orbita.features.f1")].map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="size-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="mt-auto">
              <Button asChild variant="outline" className="w-full">
                <Link href="/kontakt">{t("pricing.plans.orbita.cta")}</Link>
              </Button>
            </CardFooter>
          </Card>
          <p className="text-sm text-muted-foreground mt-4 col-span-4 text-center italic">
            {t("pricing.note")}
          </p>
        </div>
      </div>
    </section>
  );
}
