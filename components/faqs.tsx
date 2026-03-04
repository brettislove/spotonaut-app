"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { AnimatedGroup } from "./ui/animated-group";
import { useLocale } from "@/hooks/use-locale";

export default function FAQSection() {
  const { t } = useLocale();

  const faqItems = [
    {
      id: "item-1",
      question: t("faqs.items.item1.question"),
      answer: t("faqs.items.item1.answer"),
    },
    {
      id: "item-2",
      question: t("faqs.items.item2.question"),
      answer: t("faqs.items.item2.answer"),
    },
    {
      id: "item-3",
      question: t("faqs.items.item3.question"),
      answer: t("faqs.items.item3.answer"),
    },
    {
      id: "item-4",
      question: t("faqs.items.item4.question"),
      answer: t("faqs.items.item4.answer"),
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
              {t("faqs.title")}
            </h2>
            <p className="text-muted-foreground mt-4 text-balance">
              {t("faqs.intro")}
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
              {t("faqs.contactPrompt")}{" "}
              <Link
                href="mailto:crew@spotonaut.com"
                className="text-primary font-medium hover:underline"
              >
                {t("faqs.contactLink")}
              </Link>
              .
            </p>
          </div>
        </div>
      </AnimatedGroup>
    </section>
  );
}
