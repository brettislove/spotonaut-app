import Link from "next/link";

export default function AboutPage() {
  return (
    <div>
      <section className="pt-24 md:pt-28">
        <div className="container mx-auto px-4 lg:px-16">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Zpět do aplikace
          </Link>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-16">
          <div className="max-w-4xl mx-auto rounded-2xl border bg-card p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              O provozovateli
            </h1>
            <p className="text-muted-foreground mb-8">
              Identifikační a kontaktní údaje provozovatele služby Spotonaut.
            </p>

            <div className="space-y-8 text-muted-foreground">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Provozovatel webu
                </h2>
                <div className="p-4 rounded-lg border bg-muted/30">
                  <p className="font-semibold text-foreground">
                    Břetislav Dančák
                  </p>
                  <p className="text-muted-foreground text-sm mt-2">
                    IČO: 14015056
                    <br />
                    Sídlo: Čápkova 16/8, 602 00 Brno, Česká republika
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Kontaktní údaje
                </h2>
                <div className="p-4 rounded-lg border bg-muted/30">
                  <p className="text-foreground">
                    <strong>E-mail:</strong>{" "}
                    <a
                      href="mailto:crew@spotonaut.com"
                      className="text-primary hover:opacity-80 underline"
                    >
                      crew@spotonaut.com
                    </a>
                  </p>
                  <p className="text-foreground mt-2">
                    <strong>Web:</strong> https://spotonaut.com
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Právní informace
                </h2>
                <p>
                  Podrobné informace ke zpracování osobních údajů naleznete v{" "}
                  <Link
                    href="/privacy"
                    className="text-primary hover:opacity-80 underline transition-colors"
                  >
                    GDPR
                  </Link>
                  . Podmínky použití najdete v{" "}
                  <Link
                    href="/terms"
                    className="text-primary hover:opacity-80 underline transition-colors"
                  >
                    Podmínkách použití
                  </Link>{" "}
                  a informace o cookies v{" "}
                  <Link
                    href="/cookies"
                    className="text-primary hover:opacity-80 underline transition-colors"
                  >
                    Zásadách používání cookies
                  </Link>
                  .
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
