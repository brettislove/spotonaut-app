import { Button } from "@/components/ui/button";
import { ChartColumn, Check, Coins, FileUp, Sparkles } from "lucide-react";
import Link from "next/link";

const tableData = {
  credits: [
    {
      feature: "Měsíční příděl",
      sonda: "30 (jednorázově)",
      raketa: "500 (obnovuje se)",
      modul: "5000+",
    },
    {
      feature: "Možnost dokoupit",
      sonda: false,
      raketa: true,
      modul: true,
    },
  ],
  analytics: [
    {
      feature: "Skóre lokality",
      sonda: true,
      raketa: true,
      modul: true,
    },
    {
      feature: "Zobrazení realitních inzercí",
      sonda: false,
      raketa: true,
      modul: true,
    },
    {
      feature: "Možnost uložit analýzy",
      sonda: "1 analýza",
      raketa: "Neomezeně",
      modul: "Neomezeně",
    },
  ],
  ai: [
    {
      feature: "Pokročilý AI chat",
      sonda: "Základní",
      raketa: "Pokročilý kontext",
      modul: "Pokročilý kontext",
    },
  ],
  export: [
    {
      feature: "Export do PDF",
      sonda: false,
      raketa: true,
      modul: true,
    },
  ],
};

export default function PricingComparator() {
  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="w-full overflow-auto lg:overflow-visible">
          <table className="w-[200vw] border-separate border-spacing-x-3 md:w-full dark:[--color-muted:var(--color-zinc-900)]">
            <thead className="bg-background sticky top-0">
              <tr className="*:py-4 *:text-left *:font-medium">
                <th className="lg:w-2/5"></th>
                <th className="space-y-3">
                  <span className="block">🌑 Sonda</span>

                  <Button asChild variant="outline" size="sm">
                    <Link href="#">Vyzkoušet zdarma</Link>
                  </Button>
                </th>
                <th className="bg-muted rounded-t-(--radius) space-y-3 px-4">
                  <span className="block">🚀 Raketa</span>
                  <Button asChild size="sm">
                    <Link href="#">Začít naplno</Link>
                  </Button>
                </th>
                <th className="space-y-3">
                  <span className="block">🛰️ Modul</span>
                  <Button asChild variant="outline" size="sm">
                    <Link href="#">Kontaktujte nás</Link>
                  </Button>
                </th>
              </tr>
            </thead>
            <tbody className="text-caption text-sm">
              <tr className="*:py-3">
                <td className="flex items-center gap-2 font-medium">
                  <Coins className="size-4" />
                  <span>Kredity a použití</span>
                </td>
                <td></td>
                <td className="bg-muted border-none px-4"></td>
                <td></td>
              </tr>
              {tableData.credits.map((row, index) => (
                <tr key={index} className="*:border-b *:py-3">
                  <td className="text-muted-foreground">{row.feature}</td>
                  <td>
                    {typeof row.sonda === 'boolean' && row.sonda ? (
                      <Check className="size-4" />
                    ) : (
                      row.sonda
                    )}
                  </td>
                  <td className="bg-muted border-none px-4">
                    <div className="-mb-3 border-b py-3">
                      {typeof row.raketa === 'boolean' && row.raketa ? (
                        <Check className="size-4" />
                      ) : (
                        row.raketa
                      )}
                    </div>
                  </td>
                  <td>
                    {typeof row.modul === 'boolean' && row.modul ? (
                      <Check className="size-4" />
                    ) : (
                      row.modul
                    )}
                  </td>
                </tr>
              ))}
              <tr className="*:pb-3 *:pt-8">
                <td className="flex items-center gap-2 font-medium">
                  <ChartColumn className="size-4" />
                  <span>Data a analytika</span>
                </td>
                <td></td>
                <td className="bg-muted border-none px-4"></td>
                <td></td>
              </tr>
              {tableData.analytics.map((row, index) => (
                <tr key={index} className="*:border-b *:py-3">
                  <td className="text-muted-foreground">{row.feature}</td>
                  <td>
                    {typeof row.sonda === 'boolean' && row.sonda ? (
                      <Check className="size-4" />
                    ) : (
                      row.sonda
                    )}
                  </td>
                  <td className="bg-muted border-none px-4">
                    <div className="-mb-3 border-b py-3">
                      {typeof row.raketa === 'boolean' && row.raketa ? (
                        <Check className="size-4" />
                      ) : (
                        row.raketa
                      )}
                    </div>
                  </td>
                  <td>
                    {typeof row.modul === 'boolean' && row.modul ? (
                      <Check className="size-4" />
                    ) : (
                      row.modul
                    )}
                  </td>
                </tr>
              ))}
              <tr className="*:pb-3 *:pt-8">
                <td className="flex items-center gap-2 font-medium">
                  <Sparkles className="size-4" />
                  <span>AI asistence</span>
                </td>
                <td></td>
                <td className="bg-muted border-none px-4"></td>
                <td></td>
              </tr>
              {tableData.ai.map((row, index) => (
                <tr key={index} className="*:border-b *:py-3">
                  <td className="text-muted-foreground">{row.feature}</td>
                  <td>
                    {typeof row.sonda === 'boolean' && row.sonda ? (
                      <Check className="size-4" />
                    ) : (
                      row.sonda
                    )}
                  </td>
                  <td className="bg-muted border-none px-4">
                    <div className="-mb-3 border-b py-3">
                      {typeof row.raketa === 'boolean' && row.raketa ? (
                        <Check className="size-4" />
                      ) : (
                        row.raketa
                      )}
                    </div>
                  </td>
                  <td>
                    {typeof row.modul === 'boolean' && row.modul ? (
                      <Check className="size-4" />
                    ) : (
                      row.modul
                    )}
                  </td>
                </tr>
              ))}
              <tr className="*:pb-3 *:pt-8">
                <td className="flex items-center gap-2 font-medium">
                  <FileUp className="size-4" />
                  <span>Exporty</span>
                </td>
                <td></td>
                <td className="bg-muted border-none px-4"></td>
                <td></td>
              </tr>
              {tableData.export.map((row, index) => (
                <tr key={index} className="*:border-b *:py-3">
                  <td className="text-muted-foreground">{row.feature}</td>
                  <td>
                    {typeof row.sonda === 'boolean' && row.sonda ? (
                      <Check className="size-4" />
                    ) : (
                      row.sonda
                    )}
                  </td>
                  <td className="bg-muted border-none px-4">
                    <div className="-mb-3 border-b py-3">
                      {typeof row.raketa === 'boolean' && row.raketa ? (
                        <Check className="size-4" />
                      ) : (
                        row.raketa
                      )}
                    </div>
                  </td>
                  <td>
                    {typeof row.modul === 'boolean' && row.modul ? (
                      <Check className="size-4" />
                    ) : (
                      row.modul
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
