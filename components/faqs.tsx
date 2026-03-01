"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { AnimatedGroup } from "./ui/animated-group";

export default function FAQSection() {
  const faqItems = [
    {
      id: "item-1",
      question: "Jaká data používáme pro analýzu?",
      answer:
        "Naše analýza využívá veřejně dostupná data z Google Maps a Sreality.cz.  AI model je zpracovává a pomáha analyzova jejich vzájemné propojení, či vliv na obchodní potenciál zvolené lokality.",
    },
    {
      id: "item-2",
      question: "Jaké jsou hlavní výhody využití Spotonauta pro můj byznys?",
      answer: `Spotonaut vám pomůže vybrat správné místo rychle a bez zbytečného rizika.\n\n Během pár minut zjistíte, jaký má lokalita potenciál, a můžete porovnat více míst mezi sebou. Díky tomu děláte rozhodnutí na základě dat, ne pocitu. Výrazně tím snížíte šanci, že investujete do špatné adresy.\n\n Navíc je Spotonaut aktuálně zdarma a stále přidáváme nové funkce.`,
    },
    {
      id: "item-3",
      question:
        "V čem se Spotonaut liší od jiných zprostředkovatelů lokačních analýz?",
      answer:
        "Spotonaut je rychlý, dostupný a praktický.\n\nNejsme drahá konzultační firma ani složitý enterprise nástroj. Analýzu získáte během pár minut, bez dlouhých jednání a vysokých nákladů. Zaměřujeme se na jednoduchost, srozumitelnost a reálné využití v praxi pro malé podnikatele i rostoucí sítě.\n\nNavíc nástroj neustále vyvíjíme podle zpětné vazby uživatelů.",
    },
    {
      id: "item-4",
      question: "Jaký je typický případ užití?",
      answer:
        "Chci otevřít nový stánek, provozovnu nebo umístit automat, ale nejsem si jistý lokalitou.\n\nZadám adresu, porovnám možnosti a během chvíle mám jasnější představu, kde má smysl investovat.\n\nSpotonaut pomáhá rozhodnout se dřív, než podepíšete nájem nebo utratíte první peníze.",
    },
  ];

  return (
    <section className="py-16 md:py-24">
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
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">
              Často kladené otázky
            </h2>
            <p className="text-muted-foreground mt-4 text-balance">
              Níže naleznete výběr nejčastějších dotazů našich uživatelů.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-xl">
            <Accordion
              type="single"
              collapsible
              className="bg-background ring-muted w-full rounded-2xl border px-8 py-3 shadow-sm ring-4 dark:ring-0"
            >
              {faqItems.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="border-dashed"
                >
                  <AccordionTrigger className="cursor-pointer text-base hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {item.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <p className="text-muted-foreground mt-6 px-8 text-center text-sm">
              Nemůžete najít, co hledáte?{" "}
              <Link
                href="mailto:crew@spotonaut.com"
                className="text-primary font-medium hover:underline"
              >
                Kontaktujte nás
              </Link>
              .
            </p>
          </div>
        </div>
      </AnimatedGroup>
    </section>
  );
}
