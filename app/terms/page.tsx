import Link from "next/link";

export default function TermsPage() {
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
              Podmínky použití
            </h1>
            <p className="text-muted-foreground mb-8">
              Poslední aktualizace: 27. února 2026
            </p>

            <div className="space-y-8 text-muted-foreground">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  1. Rozsah služby
                </h2>
                <p>
                  Spotonaut poskytuje analytické a podpůrné informace založené
                  na automatizovaných modelech. Výstupy jsou informativní a
                  nejsou právně ani finančně závazné. Uživatel by měl vždy
                  provést vlastní ověření před přijetím rozhodnutí.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  2. Omezení odpovědnosti
                </h2>
                <p>
                  Provozovatel se snaží poskytovat přesné informace, avšak
                  nezaručuje absolutní přesnost a nenese odpovědnost za škody
                  vzniklé v důsledku použití doporučení nebo dat. Informace jsou
                  poskytovány &quot;tak jak jsou&quot;.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  3. Autorská práva a obsah
                </h2>
                <p>
                  Veškerý obsah (texty, obrázky, design) je vlastnictvím
                  provozovatele nebo je užíván na základě licence. Kopírování či
                  redistribuce bez souhlasu je zakázáno.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  4. Ochrana osobních údajů (GDPR)
                </h2>
                <p>
                  Správcem osobních údajů je provozovatel uvedený na kontaktní
                  stránce. Údaje zpracováváme za účelem komunikace a poskytování
                  služby. Podrobné informace o zpracování osobních údajů,
                  právech subjektu údajů a kontaktech naleznete v samostatné
                  sekci Zásad ochrany osobních údajů.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  5. Řešení reklamací a sporů
                </h2>
                <p>
                  Pokud máte stížnost nebo reklamaci, nejprve ji zašlete na
                  kontaktní e-mail provozovatele. Pro alternativní řešení sporů
                  můžete využít platformu ODR:
                  <a
                    href="https://ec.europa.eu/consumers/odr/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:opacity-80 underline"
                  >
                    https://ec.europa.eu/consumers/odr/
                  </a>
                  . Kontakty na české orgány dohledu naleznete na:{" "}
                  <a
                    href="https://www.coi.cz/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:opacity-80 underline"
                  >
                    https://www.coi.cz/
                  </a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  6. Platební údaje
                </h2>
                <p>
                  V případě online plateb používáme hostované platební rozhraní
                  poskytovatele platebních služeb. Údaje z platebních karet
                  (např. číslo karty, CVC/CVV) nejsou v rámci našich systémů
                  ukládány ani zpracovávány.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  7. Cookies a sledovací technologie
                </h2>
                <p>
                  Naše webová stránka může používat cookies pro zlepšení
                  uživatelské zkušenosti a analytické účely. Podrobné informace
                  naleznete v našich{" "}
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
                  8. Kontakt
                </h2>
                <p className="mb-4">
                  Máte-li dotazy k těmto podmínkám nebo k ochraně osobních
                  údajů, kontaktujte nás:
                </p>
                <div className="p-4 rounded-lg border bg-muted/30">
                  <p className="font-semibold text-foreground">Matěj Křen</p>
                  <p className="text-muted-foreground text-sm mt-2">
                    IČO: 06608183
                    <br />
                    Sídlo: Kostelecká Lhota 51, 517 41 Kostelec nad Orlicí
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
                  9. Změny těchto podmínek
                </h2>
                <p>
                  Provozovatel si vyhrazuje právo tyto podmínky aktualizovat. O
                  podstatných změnách vás budeme informovat e-mailem nebo
                  oznámením na webu. Doporučujeme tuto stránku pravidelně
                  kontrolovat.
                </p>
              </section>
            </div>

            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                Tyto podmínky jsou v souladu s nařízením GDPR (EU) 2016/679 a
                zákonem č. 110/2019 Sb., o zpracování osobních údajů.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
