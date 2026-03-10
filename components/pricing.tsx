"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  BILLING_PLAN_SATELLITE,
  BILLING_PLAN_RAKETA,
  type BillingCurrency,
  type BillingPlan,
} from "@/lib/constants/billing";
import { startStripeCheckout } from "@/lib/billing/client";

export default function Pricing() {
  const [currency, setCurrency] = useState<BillingCurrency>("czk");
  const [activeCheckoutPlan, setActiveCheckoutPlan] =
    useState<BillingPlan | null>(null);
  const { t, locale } = useLocale();

  const currencySuffix = currency === "eur" ? "€" : "Kč";
  const formatPrice = (amount: number) => `${amount} ${currencySuffix}`;

  const raketaPrice =
    currency === "eur" ? { current: 11.99 } : { original: 399, current: 299 };

  const satellitePrice =
    currency === "eur" ? { current: 89.99 } : { original: 2999, current: 2249 };

  const handleCheckout = async (plan: BillingPlan) => {
    try {
      setActiveCheckoutPlan(plan);
      await startStripeCheckout({
        plan,
        interval: "month",
        currency,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Nepodařilo se spustit platbu",
      );
      setActiveCheckoutPlan(null);
    }
  };

  return (
    <section
      id="pricing-plans"
      className="py-16 md:pt-32 md:pb-24 bg-gradient-to-b from-background to-muted/20"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <h1 className="text-center text-4xl font-semibold lg:text-5xl">
            {t("pricing.title")}
          </h1>
          <p>{t("pricing.intro")}</p>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 md:mt-12 md:flex-row">
          <Select
            value={currency}
            onValueChange={(value) => setCurrency(value as BillingCurrency)}
          >
            <SelectTrigger size="sm" className="w-[120px]">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="czk">CZK</SelectItem>
              <SelectItem value="eur">EUR</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-4 items-stretch">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-medium">
                {t("pricing.plans.sonda.title")}
              </CardTitle>
              <span className="my-3 block text-2xl font-semibold">
                {formatPrice(0)} {t("pricing.perMonth")}
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
                <Link href="/">{t("pricing.plans.sonda.cta")}</Link>
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
                <>
                  {raketaPrice.original !== undefined && (
                    <span className="text-muted-foreground line-through block">
                      {formatPrice(raketaPrice.original)}
                    </span>
                  )}
                  <span className="text-3xl text-primary mr-4">
                    {formatPrice(raketaPrice.current)}
                  </span>
                  <span className="text-sm text-muted-foreground block">
                    {t("pricing.perMonthEarlyBird")}
                  </span>
                </>
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
              <Button
                className="w-full"
                onClick={() => handleCheckout(BILLING_PLAN_RAKETA)}
                disabled={activeCheckoutPlan !== null}
              >
                {activeCheckoutPlan === BILLING_PLAN_RAKETA
                  ? locale === "cs"
                    ? "Přesměrování..."
                    : "Redirecting..."
                  : t("pricing.plans.raketa.cta")}
              </Button>
            </CardFooter>
          </Card>
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-medium">
                {t("pricing.plans.satellite.title")}
              </CardTitle>
              <span className="my-3 block text-2xl font-semibold">
                <>
                  {satellitePrice.original !== undefined && (
                    <span className="text-muted-foreground line-through block">
                      {formatPrice(satellitePrice.original)}
                    </span>
                  )}
                  <span className="text-3xl text-primary mr-4">
                    {formatPrice(satellitePrice.current)}
                  </span>
                  <span className="text-sm text-muted-foreground block">
                    {t("pricing.perMonthEarlyBird")}
                  </span>
                </>
              </span>
              <CardDescription className="text-sm">
                {t("pricing.plans.satellite.description")}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 flex-grow">
              <hr className="border-dashed" />

              <ul className="list-outside space-y-3 text-sm">
                {[
                  t("pricing.plans.satellite.features.f1"),
                  t("pricing.plans.satellite.features.f2"),
                  t("pricing.plans.satellite.features.f3"),
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="size-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleCheckout(BILLING_PLAN_SATELLITE)}
                disabled={activeCheckoutPlan !== null}
              >
                {activeCheckoutPlan === BILLING_PLAN_SATELLITE
                  ? locale === "cs"
                    ? "Přesměrování..."
                    : "Redirecting..."
                  : t("pricing.plans.satellite.cta")}
              </Button>
            </CardFooter>
          </Card>
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-medium">
                {t("pricing.plans.orbita.title")}
              </CardTitle>
              <span className="my-3 block text-2xl font-semibold">
                {t("pricing.plans.orbita.priceNegotiable")}
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
