"use client";

import IntegrationsSection from "@/components/integrations-section";
import FAQSection from "@/components/faqs";
import ScrollRevealContent from "@/components/scroll-reveal-content";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { useLocale } from "@/hooks/use-locale";

export default function HowItWorksClient() {
  const { t } = useLocale();

  const mockContentA = {
    title: t("howItWorksPage.steps.stepA.title"),
    description: t("howItWorksPage.steps.stepA.description"),
    image: {
      url: "/Spotty_formular.png",
      width: 800,
      height: 400,
      alt: t("howItWorksPage.steps.stepA.imageAlt"),
    },
  };

  const mockContentB = {
    title: t("howItWorksPage.steps.stepB.title"),
    description: t("howItWorksPage.steps.stepB.description"),
    image: {
      url: "/Spotty_vysledky.png",
      width: 800,
      height: 400,
      alt: t("howItWorksPage.steps.stepB.imageAlt"),
    },
  };

  const mockContentC = {
    title: t("howItWorksPage.steps.stepC.title"),
    description: t("howItWorksPage.steps.stepC.description"),
    image: {
      url: "/Spotty_chat.png",
      width: 800,
      height: 600,
      alt: t("howItWorksPage.steps.stepC.imageAlt"),
    },
  };

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
              {t("howItWorksPage.title")}
            </h1>
            <p className="mt-4">{t("howItWorksPage.intro")}</p>
          </div>
        </div>
        <ScrollRevealContent
          contentA={mockContentA}
          contentB={mockContentB}
          contentC={mockContentC}
        />
        <IntegrationsSection />
        <FAQSection />
      </AnimatedGroup>
    </section>
  );
}
