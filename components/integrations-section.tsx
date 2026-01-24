import {
  Gemini,
  Replit,
  MagicUI,
  VSCodium,
  MediaWiki,
  GooglePaLM,
} from "@/components/logos";
import { cn } from "@/lib/utils";
import { LogoIcon } from "@/components/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { AnimatedGroup } from "./ui/animated-group";

export default function IntegrationsSection() {
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
        <div className="bg-muted dark:bg-background">
          <div className="mx-auto max-w-5xl px-6">
            <div className="relative mx-auto flex max-w-sm items-center justify-between">
              <div className="space-y-6">
                <IntegrationCard position="left-top">
                  <Gemini />
                </IntegrationCard>
                <IntegrationCard position="left-middle">
                  <Replit />
                </IntegrationCard>
                <IntegrationCard position="left-bottom">
                  <MagicUI />
                </IntegrationCard>
              </div>
              <div className="mx-auto my-2 flex w-fit justify-center gap-2">
                <div className="bg-muted relative z-20 rounded-2xl border p-1">
                  <IntegrationCard
                    className="shadow-black-950/10 dark:bg-background size-16 border-black/25 shadow-xl dark:border-white/25 dark:shadow-white/10"
                    isCenter={true}
                  >
                    <Image
                      src="/spotonaut_logo.png"
                      alt="SpotOnaut"
                      width={26}
                      height={26}
                      priority
                      unoptimized
                    />
                  </IntegrationCard>
                </div>
              </div>
              <div
                role="presentation"
                className="absolute inset-1/3 bg-[radial-gradient(var(--dots-color)_1px,transparent_1px)] opacity-50 [--dots-color:black] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:[--dots-color:white]"
              ></div>

              <div className="space-y-6">
                <IntegrationCard position="right-top">
                  <VSCodium />
                </IntegrationCard>
                <IntegrationCard position="right-middle">
                  <MediaWiki />
                </IntegrationCard>
                <IntegrationCard position="right-bottom">
                  <GooglePaLM />
                </IntegrationCard>
              </div>
            </div>
            <div className="mx-auto mt-12 max-w-lg space-y-6 text-center">
              <h2 className="text-balance text-3xl font-semibold md:text-4xl">
                Na čem jsou data založená?
              </h2>
              <p className="text-muted-foreground">
                Spotonaut staví na dostupných datech a s pomocí AI pomáhá
                analyzovat jejich vzájemné propojení a vliv na obchodní
                potenciál zvolené lokality.
              </p>

              <Button variant="default" size="sm" asChild>
                <Link href="/">Vyzkoušet zdarma</Link>
              </Button>
            </div>
          </div>
        </div>
      </AnimatedGroup>
    </section>
  );
}

const IntegrationCard = ({
  children,
  className,
  position,
  isCenter = false,
}: {
  children: React.ReactNode;
  className?: string;
  position?:
    | "left-top"
    | "left-middle"
    | "left-bottom"
    | "right-top"
    | "right-middle"
    | "right-bottom";
  isCenter?: boolean;
}) => {
  return (
    <div
      className={cn(
        "bg-background relative flex size-12 rounded-xl border dark:bg-transparent",
        className,
      )}
    >
      <div
        className={cn("relative z-20 m-auto", !isCenter && "size-fit *:size-6")}
      >
        {children}
      </div>
      {position && !isCenter && (
        <div
          className={cn(
            "bg-linear-to-r to-muted-foreground/25 absolute z-10 h-px",
            position === "left-top" &&
              "left-full top-1/2 w-[130px] origin-left rotate-[25deg]",
            position === "left-middle" &&
              "left-full top-1/2 w-[120px] origin-left",
            position === "left-bottom" &&
              "left-full top-1/2 w-[130px] origin-left rotate-[-25deg]",
            position === "right-top" &&
              "bg-linear-to-l right-full top-1/2 w-[130px] origin-right rotate-[-25deg]",
            position === "right-middle" &&
              "bg-linear-to-l right-full top-1/2 w-[120px] origin-right",
            position === "right-bottom" &&
              "bg-linear-to-l right-full top-1/2 w-[130px] origin-right rotate-[25deg]",
          )}
        />
      )}
    </div>
  );
};
