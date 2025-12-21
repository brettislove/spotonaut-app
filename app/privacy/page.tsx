import Link from "next/link";

export default function PrivacyPage() {
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

          <div className="max-w-4xl mx-auto">
            <div className="p-8 md:p-12 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Zásady ochrany osobních údajů
              </h1>
              <p className="text-slate-400 mb-8">
                Poslední aktualizace: 21. prosince 2025
              </p>

              <div className="space-y-8 text-slate-300">
                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    1. Správce osobních údajů
                  </h2>
                  <p className="mb-4">Správcem osobních údajů je:</p>
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
                    2. Jaké údaje zpracováváme
                  </h2>
                  <p className="mb-4">
                    V závislosti na interakci se službou můžeme zpracovávat
                    např.:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Jméno a e-mail při kontaktování formulářem</li>
                    <li>
                      IP adresa a technické informace (logy) za účelem
                      bezpečnosti
                    </li>
                    <li>
                      Údaje související se zasíláním služeb nebo fakturací,
                      pokud jsou poskytnuty
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    3. Účel a právní základ zpracování
                  </h2>
                  <p className="mb-4">Údaje zpracováváme za účelem:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      Vyřízení dotazů a komunikace s uživatelem (legitimní zájem
                      / plnění žádosti)
                    </li>
                    <li>
                      Zajištění bezpečnosti a provozu služby (oprávněný zájem)
                    </li>
                    <li>
                      Plnění smluvních závazků, pokud dojde k objednávce (plnění
                      smlouvy)
                    </li>
                    <li>
                      Marketing pouze se souhlasem uživatele (pokud je
                      relevantní)
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    4. Doba uchovávání
                  </h2>
                  <p>
                    Doba uchovávání závisí na účelu zpracování. Obvyklé doby
                    jsou:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      Komunikační zprávy: po dobu nezbytnou k vyřízení (obvykle
                      do 2 let)
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
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    5. Předávání údajů třetím stranám
                  </h2>
                  <p className="mb-4">
                    Můžeme předat osobní údaje poskytovatelům služeb (hosting,
                    e-mail, analytika), kteří zpracovávají údaje jako
                    zpracovatelé na základě smlouvy. Příklady kategorií
                    příjemců:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Poskytovatelé hostingu (např. Vercel)</li>
                    <li>
                      E-mailové služby pro odesílání notifikací (např. Resend)
                    </li>
                    <li>
                      Poskytovatelé analytických služeb, pokud jsou použity
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    6. Vaše práva
                  </h2>
                  <p className="mb-4">
                    V souladu s GDPR máte práva, například:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Právo na přístup k údajům</li>
                    <li>Právo na opravu nebo výmaz</li>
                    <li>Právo na omezení zpracování</li>
                    <li>
                      Právo vznést námitku a právo na přenositelnost údajů
                    </li>
                    <li>
                      Právo podat stížnost u Úřadu pro ochranu osobních údajů
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    7. Zabezpečení
                  </h2>
                  <p>
                    Používáme technická a organizační opatření k ochraně
                    osobních údajů, včetně šifrování přenosu (HTTPS) a omezení
                    přístupu k datům.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    8. Cookies a sledovací technologie
                  </h2>
                  <p>
                    Podrobné informace o používaných cookies naleznete v{" "}
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
                    9. Kontakt
                  </h2>
                  <p className="mb-4">
                    Pro uplatnění práv nebo další dotazy nás kontaktujte:
                  </p>
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-white">
                      <strong>E-mail:</strong>{" "}
                      <a
                        href="mailto:info@sparxoft.com"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        info@sparxoft.com
                      </a>
                    </p>
                    <p className="text-white mt-2">
                      <strong>Adresa:</strong> Čápkova 16/8, 602 00 Brno, Česká
                      republika
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    10. Změny zásad
                  </h2>
                  <p>
                    Tyto zásady můžeme čas od času aktualizovat. O podstatných
                    změnách vás budeme informovat e-mailem nebo oznámením na
                    webu. Doporučujeme tuto stránku pravidelně kontrolovat.
                  </p>
                </section>
              </div>

              <div className="mt-12 pt-8 border-t border-slate-700">
                <p className="text-sm text-slate-500 text-center">
                  Tyto zásady jsou v souladu s nařízením GDPR (EU) 2016/679 a
                  českou legislativou.
                </p>
              </div>
            </div>
          </div>
        </div>

        <footer className="container mx-auto px-4 py-12 border-t border-slate-800/50 mt-20">
          <div className="text-center text-slate-400 text-sm">
            <p>© 2025 Spotonaut / Sparxoft. Všechna práva vyhrazena.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
