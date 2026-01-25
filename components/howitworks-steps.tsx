import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Settings2, Sparkles, Zap } from "lucide-react";
import { ReactNode } from "react";
import { AnimatedGroup } from "./ui/animated-group";

export default function HowItWorksSteps() {
  return (
    <section className="py-16">
      <AnimatedGroup
        variants={{
          container: {
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          },
          item: {
            hidden: {
              opacity: 0,
              filter: "blur(8px)",
              scale: 0.95,
            },
            visible: {
              opacity: 1,
              filter: "blur(0px)",
              scale: 1,
              transition: {
                type: "spring",
                bounce: 0.3,
                duration: 1,
              },
            },
          },
        }}
        viewport={{ once: false, margin: "-100px" }}
      >
        <div className="@container mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h1 className="font-inter mx-auto my-8 max-w-4xl text-balance text-5xl font-bold md:text-6xl lg:mt-16 xl:text-7xl">
              Stačí 3 jednoduché kroky
            </h1>
            <p className="mt-4">
              Výběr lokality může být nejdražší rozhodnutí celého podnikání.
              Spotonaut Ti dá rychlý, srozumitelný způsob, jak si místo prověřit
              dřív, než podepíšeš nájemní či kupní smlouvu.
            </p>
          </div>
          <div className="@min-4xl:max-w-full @min-4xl:grid-cols-3 mx-auto mt-8 grid max-w-sm gap-6 [--color-background:var(--color-muted)] [--color-card:var(--color-muted)] *:text-center md:mt-16 dark:[--color-muted:var(--color-zinc-900)]">
            <Card className="group border-0 shadow-none">
              <CardHeader className="pb-3">
                <CardDecorator>
                  <Settings2 className="size-6" aria-hidden />
                </CardDecorator>

                <h3 className="mt-6 font-medium">1. Zadej vstupní data</h3>
              </CardHeader>

              <CardContent>
                <p className="text-sm">
                  Vyber cílovou lokalitu špendlíkem na mapě nebo zadej adresu.
                  Uveď typ podnikání — tento výběr řídí celou analýzu.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-0 shadow-none">
              <CardHeader className="pb-3">
                <CardDecorator>
                  <Sparkles className="size-6" aria-hidden />
                </CardDecorator>

                <h3 className="mt-6 font-medium">2. Spusť analýzu</h3>
              </CardHeader>

              <CardContent>
                <p className="mt-3 text-sm">
                  Využíváme mapové podklady a veřejná data (doprava, zástavba,
                  konkurence). AI vyhodnotí lokaci a zobrazí klíčová skóre
                  0–100.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-0 shadow-none">
              <CardHeader className="pb-3">
                <CardDecorator>
                  <Zap className="size-6" aria-hidden />
                </CardDecorator>

                <h3 className="mt-6 font-medium">3. Porovnej výsledky</h3>
              </CardHeader>

              <CardContent>
                <p className="mt-3 text-sm">
                  V chatu dostaneš detailní rozbor a konkrétní doporučení
                  (sortiment, otevírací doba, marketing). Polož další otázky a
                  rozvíjej strategii.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </AnimatedGroup>
    </section>
  );
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
  <div className="mask-radial-from-40% mask-radial-to-60% relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
    <div
      aria-hidden
      className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-50"
    />

    <div className="bg-card absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t">
      {children}
    </div>
  </div>
);
