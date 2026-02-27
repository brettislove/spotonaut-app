import Link from "next/link";

export default function CookiesPage() {
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
              Zásady používání cookies
            </h1>
            <p className="text-muted-foreground mb-8">
              Poslední aktualizace: 20. prosince 2025
            </p>

            <div className="space-y-8 text-muted-foreground">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  1. Co jsou cookies
                </h2>
                <p className="mb-4">
                  Cookies jsou malé textové soubory, které se ukládají do vašeho
                  zařízení při návštěvě webových stránek. Umožňují stránce
                  rozpoznat zařízení a zapamatovat si informace o návštěvě.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  2. Proč cookies používáme
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Zajištění základní funkčnosti webu</li>
                  <li>Zapamatování preferencí a nastavení</li>
                  <li>Zlepšení uživatelské zkušenosti</li>
                  <li>Analýza návštěvnosti a výkonu služby</li>
                  <li>Ochrana před spamem a zneužitím</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  3. Jaké cookies používáme
                </h2>
                <div className="p-4 rounded-lg border bg-muted/30">
                  <p className="text-foreground font-semibold mb-2">
                    Nezbytně nutné cookies
                  </p>
                  <p>
                    Tyto cookies jsou nezbytné pro správné fungování webu a
                    nelze je vypnout.
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-muted/30 mt-4">
                  <p className="text-foreground font-semibold mb-2">
                    Analytické a marketingové cookies
                  </p>
                  <p>
                    V současné době je nepoužíváme. Pokud je v budoucnu začneme
                    používat, budeme vás informovat a vyžádáme si souhlas.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  4. Cookies třetích stran
                </h2>
                <p className="mb-4">
                  Web může obsahovat prvky třetích stran (např. hosting nebo
                  analytické nástroje), které mohou nastavovat vlastní cookies.
                </p>
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:opacity-80 underline"
                >
                  Zásady ochrany soukromí Vercel →
                </a>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  5. Správa cookies
                </h2>
                <p className="mb-4">
                  Nastavení cookies můžete změnit ve svém prohlížeči.
                </p>
                <ul className="space-y-2 ml-4">
                  <li>
                    <a
                      href="https://support.google.com/chrome/answer/95647"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:opacity-80 underline"
                    >
                      Google Chrome →
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://support.mozilla.org/cs/kb/povoleni-zakazani-cookies"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:opacity-80 underline"
                    >
                      Mozilla Firefox →
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://support.apple.com/cs-cz/guide/safari/sfri11471/mac"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:opacity-80 underline"
                    >
                      Safari →
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://support.microsoft.com/cs-cz/microsoft-edge/odstranění-souborů-cookie-v-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:opacity-80 underline"
                    >
                      Microsoft Edge →
                    </a>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  6. Vaše práva
                </h2>
                <p>
                  V souladu s GDPR máte právo být informováni, odmítnout
                  nepovinné cookies, odvolat souhlas a podat stížnost u Úřadu
                  pro ochranu osobních údajů.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  7. Kontakt
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
                    <strong>Adresa:</strong> Čápkova 16/8, 602 00 Brno, Česká
                    republika
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  8. Související dokumenty
                </h2>
                <ul className="space-y-2 ml-4">
                  <li>
                    <Link
                      href="/privacy"
                      className="text-primary hover:opacity-80 underline"
                    >
                      GDPR →
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms"
                      className="text-primary hover:opacity-80 underline"
                    >
                      Podmínky použití →
                    </Link>
                  </li>
                </ul>
              </section>
            </div>

            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                Tyto zásady jsou v souladu s nařízením GDPR (EU) 2016/679 a
                zákonem č. 110/2019 Sb., o zpracování osobních údajů.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
