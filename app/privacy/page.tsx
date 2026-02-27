import Link from "next/link";

export default function PrivacyPage() {
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
              Zásady ochrany osobních údajů
            </h1>
            <p className="text-muted-foreground mb-8">
              Poslední aktualizace: 21. prosince 2025
            </p>

            <div className="space-y-8 text-muted-foreground">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  1. Správce osobních údajů
                </h2>
                <p className="mb-4">Správcem osobních údajů je:</p>
                <div className="p-4 rounded-lg border bg-muted/30">
                  <p className="font-semibold text-foreground">
                    Břetislav Dančák
                  </p>
                  <p className="text-muted-foreground text-sm mt-2">
                    IČO: 14015056
                    <br />
                    Sídlo: Čápkova 16/8, 602 00 Brno, Česká republika
                    <br />
                    E-mail:{" "}
                    <a
                      href="mailto:crew@spotonaut.com"
                      className="text-primary hover:opacity-80 underline"
                    >
                      crew@spotonaut.com
                    </a>
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  2. Jaké údaje zpracováváme
                </h2>
                <p className="mb-4">
                  V závislosti na interakci se službou můžeme zpracovávat např.:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Jméno a e-mail při kontaktování formulářem</li>
                  <li>
                    IP adresa a technické informace (logy) za účelem bezpečnosti
                  </li>
                  <li>
                    Údaje související se zasíláním služeb nebo fakturací, pokud
                    jsou poskytnuty
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  3. Účel a právní základ zpracování
                </h2>
                <p className="mb-4">Údaje zpracováváme za účelem:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Vyřízení dotazů a komunikace s uživatelem (legitimní zájem /
                    plnění žádosti)
                  </li>
                  <li>
                    Zajištění bezpečnosti a provozu služby (oprávněný zájem)
                  </li>
                  <li>
                    Plnění smluvních závazků, pokud dojde k objednávce (plnění
                    smlouvy)
                  </li>
                  <li>
                    Marketing pouze se souhlasem uživatele (pokud je relevantní)
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  4. Doba uchovávání
                </h2>
                <p>
                  Doba uchovávání závisí na účelu zpracování. Obvyklé doby jsou:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Komunikační zprávy: po dobu nezbytnou k vyřízení (obvykle do
                    2 let)
                  </li>
                  <li>
                    Bezpečnostní logy: do 90 dnů, pokud není nutné delší
                    uchování pro vyšetřování
                  </li>
                  <li>
                    Údaje související se smlouvami: po dobu vyžadovanou právem
                    (fakturace, účetnictví)
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  5. Předávání údajů třetím stranám
                </h2>
                <p className="mb-4">
                  Můžeme předat osobní údaje poskytovatelům služeb (hosting,
                  e-mail, analytika), kteří zpracovávají údaje jako zpracovatelé
                  na základě smlouvy. Příklady kategorií příjemců:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Poskytovatelé hostingu (např. Vercel)</li>
                  <li>
                    E-mailové služby pro odesílání notifikací (např. Resend)
                  </li>
                  <li>Poskytovatelé analytických služeb, pokud jsou použity</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  6. Vaše práva
                </h2>
                <p className="mb-4">V souladu s GDPR máte práva, například:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Právo na přístup k údajům</li>
                  <li>Právo na opravu nebo výmaz</li>
                  <li>Právo na omezení zpracování</li>
                  <li>Právo vznést námitku a právo na přenositelnost údajů</li>
                  <li>
                    Právo podat stížnost u Úřadu pro ochranu osobních údajů
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  7. Zabezpečení
                </h2>
                <p>
                  Používáme technická a organizační opatření k ochraně osobních
                  údajů, včetně šifrování přenosu (HTTPS) a omezení přístupu k
                  datům.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  8. Cookies a sledovací technologie
                </h2>
                <p>
                  Podrobné informace o používaných cookies naleznete v{" "}
                  <Link
                    href="/cookies"
                    className="text-primary hover:opacity-80 underline transition-colors"
                  >
                    Zásadách používání cookies
                  </Link>
                  .
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  9. Kontakt
                </h2>
                <p className="mb-4">
                  Pro uplatnění práv nebo další dotazy nás kontaktujte:
                </p>
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
                  10. Změny zásad
                </h2>
                <p>
                  Tyto zásady můžeme čas od času aktualizovat. O podstatných
                  změnách vás budeme informovat e-mailem nebo oznámením na webu.
                  Doporučujeme tuto stránku pravidelně kontrolovat.
                </p>
              </section>
            </div>

            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                Tyto zásady jsou v souladu s nařízením GDPR (EU) 2016/679 a
                českou legislativou.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
