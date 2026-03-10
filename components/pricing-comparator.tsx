"use client";

import { Button } from "@/components/ui/button";
import { ChartColumn, Check, Coins, FileUp, Sparkles } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/hooks/use-locale";

export default function PricingComparator() {
  const { t } = useLocale();

  const tableData = {
    credits: [
      {
        feature: t("pricingComparator.table.credits.monthlyAllowance"),
        sonda: "25",
        raketa: "200",
        satellite: "2200",
      },
    ],
    analytics: [
      {
        feature: t("pricingComparator.table.analytics.localityScore"),
        sonda: true,
        raketa: true,
        satellite: true,
      },
      {
        feature: t("pricingComparator.table.analytics.realEstateListings"),
        sonda: false,
        raketa: true,
        satellite: true,
      },
    ],
    ai: [
      {
        feature: t("pricingComparator.table.ai.chatWithAi"),
        sonda: true,
        raketa: true,
        satellite: true,
      },
    ],
  };

  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="w-full overflow-auto lg:overflow-visible">
          <table className="w-[200vw] border-separate border-spacing-x-3 md:w-full dark:[--color-muted:var(--color-zinc-900)]">
            <thead className="bg-background sticky top-0">
              <tr className="*:py-4 *:text-left *:font-medium">
                <th className="lg:w-2/5"></th>
                <th className="space-y-3">
                  <span className="block">
                    {t("pricingComparator.header.sonda")}
                  </span>

                  <Button asChild variant="outline" size="sm">
                    <Link href="/pricing#pricing-plans">
                      {t("pricingComparator.buttons.sonda")}
                    </Link>
                  </Button>
                </th>
                <th className="bg-muted rounded-t-(--radius) space-y-3 px-4">
                  <span className="block">
                    {t("pricingComparator.header.raketa")}
                  </span>
                  <Button asChild size="sm">
                    <Link href="/pricing#pricing-plans">
                      {t("pricingComparator.buttons.raketa")}
                    </Link>
                  </Button>
                </th>
                <th className="space-y-3">
                  <span className="block">
                    {t("pricingComparator.header.satellite")}
                  </span>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/pricing#pricing-plans">
                      {t("pricingComparator.buttons.satellite")}
                    </Link>
                  </Button>
                </th>
              </tr>
            </thead>
            <tbody className="text-caption text-sm">
              <tr className="*:py-3">
                <td className="flex items-center gap-2 font-medium">
                  <Coins className="size-4" />
                  <span>{t("pricingComparator.sections.creditsAndUsage")}</span>
                </td>
                <td></td>
                <td className="bg-muted border-none px-4"></td>
                <td></td>
              </tr>
              {tableData.credits.map((row, index) => (
                <tr key={index} className="*:border-b *:py-3">
                  <td className="text-muted-foreground">{row.feature}</td>
                  <td>
                    {typeof row.sonda === "boolean" && row.sonda ? (
                      <Check className="size-4" />
                    ) : (
                      row.sonda
                    )}
                  </td>
                  <td className="bg-muted border-none px-4">
                    <div className="-mb-3 border-b py-3">
                      {typeof row.raketa === "boolean" && row.raketa ? (
                        <Check className="size-4" />
                      ) : (
                        row.raketa
                      )}
                    </div>
                  </td>
                  <td>
                    {typeof row.satellite === "boolean" && row.satellite ? (
                      <Check className="size-4" />
                    ) : (
                      row.satellite
                    )}
                  </td>
                </tr>
              ))}
              <tr className="*:pb-3 *:pt-8">
                <td className="flex items-center gap-2 font-medium">
                  <ChartColumn className="size-4" />
                  <span>
                    {t("pricingComparator.sections.dataAndAnalytics")}
                  </span>
                </td>
                <td></td>
                <td className="bg-muted border-none px-4"></td>
                <td></td>
              </tr>
              {tableData.analytics.map((row, index) => (
                <tr key={index} className="*:border-b *:py-3">
                  <td className="text-muted-foreground">{row.feature}</td>
                  <td>
                    {typeof row.sonda === "boolean" && row.sonda ? (
                      <Check className="size-4" />
                    ) : (
                      row.sonda
                    )}
                  </td>
                  <td className="bg-muted border-none px-4">
                    <div className="-mb-3 border-b py-3">
                      {typeof row.raketa === "boolean" && row.raketa ? (
                        <Check className="size-4" />
                      ) : (
                        row.raketa
                      )}
                    </div>
                  </td>
                  <td>
                    {typeof row.satellite === "boolean" && row.satellite ? (
                      <Check className="size-4" />
                    ) : (
                      row.satellite
                    )}
                  </td>
                </tr>
              ))}
              <tr className="*:pb-3 *:pt-8">
                <td className="flex items-center gap-2 font-medium">
                  <Sparkles className="size-4" />
                  <span>{t("pricingComparator.sections.ai")}</span>
                </td>
                <td></td>
                <td className="bg-muted border-none px-4"></td>
                <td></td>
              </tr>
              {tableData.ai.map((row, index) => (
                <tr key={index} className="*:border-b *:py-3">
                  <td className="text-muted-foreground">{row.feature}</td>
                  <td>
                    {typeof row.sonda === "boolean" && row.sonda ? (
                      <Check className="size-4" />
                    ) : (
                      row.sonda
                    )}
                  </td>
                  <td className="bg-muted border-none px-4">
                    <div className="-mb-3 border-b py-3">
                      {typeof row.raketa === "boolean" && row.raketa ? (
                        <Check className="size-4" />
                      ) : (
                        row.raketa
                      )}
                    </div>
                  </td>
                  <td>
                    {typeof row.satellite === "boolean" && row.satellite ? (
                      <Check className="size-4" />
                    ) : (
                      row.satellite
                    )}
                  </td>
                </tr>
              ))}
              <tr className="*:py-6">
                <td></td>
                <td></td>
                <td className="bg-muted rounded-b-(--radius) border-none px-4"></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
