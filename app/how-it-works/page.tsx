import Link from "next/link";
import Image from "next/image";
import { MapPin, Sparkles, MessageSquare } from "lucide-react";
import HowItWorksSteps from "@/components/howitworks-steps";
import IntegrationsSection from "@/components/integrations-section";
import FAQSection from "@/components/faqs";
import ScrollRevealContentA from "@/components/scroll-reveal-content-a";
import { AnimatedGroup } from "@/components/ui/animated-group";

export default function HowItWorksPage() {
  const mockContentA = {
    title: "Zadej vstupní data",
    description:
      "Vyber cílovou lokalitu špendlíkem na mapě nebo zadej adresu. Uveď typ podnikání — tento výběr řídí celou analýzu.",
    image: {
      url: "/Spotty_formular.png",
      width: 800,
      height: 400,
      alt: "Map selection interface",
    },
  };

  const mockContentB = {
    title: "Spusť analýzu",
    description:
      "Využíváme mapové podklady a veřejná data (doprava, zástavba, konkurence). AI vyhodnotí lokaci a zobrazí klíčová skóre 0–100.",
    image: {
      url: "/Spotty_vysledky.png",
      width: 800,
      height: 400,
      alt: "AI analysis results",
    },
  };

  const mockContentC = {
    title: "Porovnej výsledky",
    description:
      "V chatu dostaneš detailní rozbor a konkrétní doporučení (sortiment, otevírací doba, marketing). Polož další otázky a rozvíjej strategii.",
    image: {
      url: "/Spotty_chat.png",
      width: 800,
      height: 600,
      alt: "Interactive chat interface",
    },
  };

  return (
    <>
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
                Spotonaut Ti dá rychlý, srozumitelný způsob, jak si místo
                prověřit dřív, než podepíšeš nájemní či kupní smlouvu.
              </p>
            </div>
          </div>
          <ScrollRevealContentA
            contentA={mockContentA}
            contentB={mockContentB}
            contentC={mockContentC}
          />
          <IntegrationsSection />
          <FAQSection />
        </AnimatedGroup>
      </section>
    </>
  );
}
