import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-12">
          {/* Back button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors mb-8"
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
            Zpět na hlavní stránku
          </Link>

          {/* Content */}
          <div className="max-w-4xl mx-auto">
            <div className="p-8 md:p-12 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Podmínky použití
              </h1>
              <p className="text-slate-400 mb-8">
                Poslední aktualizace: 20. prosince 2025
              </p>

              <div className="space-y-8 text-slate-300">
                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
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
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    2. Omezení odpovědnosti
                  </h2>
                  <p>
                    Provozovatel se snaží poskytovat přesné informace, avšak
                    nezaručuje absolutní přesnost a nenese odpovědnost za škody
                    vzniklé v důsledku použití doporučení nebo dat. Informace
                    jsou poskytovány &quot;tak jak jsou&quot;.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    3. Autorská práva a obsah
                  </h2>
                  <p>
                    Veškerý obsah (texty, obrázky, design) je vlastnictvím
                    provozovatele nebo je užíván na základě licence. Kopírování
                    či redistribuce bez souhlasu je zakázáno.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    4. Ochrana osobních údajů (GDPR)
                  </h2>
                  <p>
                    Správcem osobních údajů je provozovatel uvedený na kontaktní
                    stránce. Údaje zpracováváme za účelem komunikace a
                    poskytování služby. Podrobné informace o zpracování osobních
                    údajů, právech subjektu údajů a kontaktech naleznete v
                    samostatné sekci Zásad ochrany osobních údajů.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    5. Řešení reklamací a sporů
                  </h2>
                  <p>
                    Pokud máte stížnost nebo reklamaci, nejprve ji zašlete na
                    kontaktní e-mail provozovatele. Pro alternativní řešení
                    sporů můžete využít platformu ODR:
                    <a
                      href="https://ec.europa.eu/consumers/odr/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-300 hover:underline"
                    >
                      https://ec.europa.eu/consumers/odr/
                    </a>
                    . Kontakty na české orgány dohledu naleznete na:{" "}
                    <a
                      href="https://www.coi.cz/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-300 hover:underline"
                    >
                      https://www.coi.cz/
                    </a>
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    6. Cookies a sledovací technologie
                  </h2>
                  <p>
                    Naše webová stránka může používat cookies pro zlepšení
                    uživatelské zkušenosti a analytické účely. Podrobné
                    informace naleznete v našich{" "}
                    <Link
                      href="/cookies"
                      className="text-blue-400 hover:text-blue-300 underline transition-colors"
                    >
                      Zásadách používání cookies
                    </Link>
                    .
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    7. Kontakt
                  </h2>
                  <p className="mb-4">
                    Máte-li dotazy k těmto podmínkám nebo k ochraně osobních
                    údajů, kontaktujte nás:
                  </p>
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="font-semibold text-white">Břetislav Dančák</p>
                    <p className="text-slate-400 text-sm mt-2">
                      IČO: 14015056
                      <br />
                      Sídlo: Čápkova 16/8, 602 00 Brno, Česká republika
                      <br />
                      E-mail:{" "}
                      <a
                        href="mailto:info@sparxoft.com"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        info@sparxoft.com
                      </a>
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    8. Změny těchto podmínek
                  </h2>
                  <p>
                    Provozovatel si vyhrazuje právo tyto podmínky aktualizovat.
                    O podstatných změnách vás budeme informovat e-mailem nebo
                    oznámením na webu. Doporučujeme tuto stránku pravidelně
                    kontrolovat.
                  </p>
                </section>
              </div>

              {/* Footer */}
              <div className="mt-12 pt-8 border-t border-slate-700">
                <p className="text-sm text-slate-500 text-center">
                  Tyto podmínky jsou v souladu s nařízením GDPR (EU) 2016/679 a
                  zákonem č. 110/2019 Sb., o zpracování osobních údajů.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-12 border-t border-slate-800/50 mt-20">
          <div className="text-center text-slate-400 text-sm">
            <p>© 2025 Sparxoft.com. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
