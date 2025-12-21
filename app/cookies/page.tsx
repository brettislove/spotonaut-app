import Link from "next/link";

export default function CookiesPage() {
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
                Zásady používání cookies
              </h1>
              <p className="text-slate-400 mb-8">
                Poslední aktualizace: 20. prosince 2025
              </p>

              <div className="space-y-8 text-slate-300">
                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    1. Co jsou cookies
                  </h2>
                  <p className="mb-4">
                    Cookies jsou malé textové soubory, které se ukládají do
                    vašeho zařízení (počítač, tablet, smartphone) při návštěvě
                    webových stránek. Umožňují webové stránce rozpoznat vaše
                    zařízení a zapamatovat si určité informace o vaší návštěvě.
                  </p>
                  <p>
                    Cookies jsou široce používány k zajištění fungování webových
                    stránek nebo k jejich efektivnějšímu fungování, jakož i k
                    poskytování informací provozovatelům stránek.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    2. Proč používáme cookies
                  </h2>
                  <p className="mb-4">
                    Na našich stránkách používáme cookies k:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Zajištění základní funkčnosti webu</li>
                    <li>Zapamatování vašich preferencí a nastavení</li>
                    <li>Zlepšení uživatelské zkušenosti</li>
                    <li>Analýze návštěvnosti a chování uživatelů</li>
                    <li>Ochraně před spamem a zneužitím služby</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    3. Jaké cookies používáme
                  </h2>

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-white mb-3">
                      3.1 Nezbytně nutné cookies
                    </h3>
                    <p className="mb-3">
                      Tyto cookies jsou nezbytné pro fungování webu a nelze je
                      vypnout. Obvykle se nastavují pouze v reakci na akce,
                      které provedete a které představují požadavek na služby.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border border-slate-700 rounded-lg">
                        <thead className="bg-slate-800/50">
                          <tr>
                            <th className="px-4 py-3 text-left text-white">
                              Název
                            </th>
                            <th className="px-4 py-3 text-left text-white">
                              Účel
                            </th>
                            <th className="px-4 py-3 text-left text-white">
                              Platnost
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t border-slate-700">
                            <td className="px-4 py-3 font-mono text-blue-300">
                              session_id
                            </td>
                            <td className="px-4 py-3">
                              Udržení relace uživatele během návštěvy
                            </td>
                            <td className="px-4 py-3">do zavření prohlížeče</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-white mb-3">
                      3.2 Analytické cookies
                    </h3>
                    <p className="mb-3">
                      Tyto cookies nám umožňují počítat návštěvy a zdroje
                      provozu, abychom mohli měřit a zlepšovat výkonnost našich
                      stránek.
                    </p>
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-sm">
                        <strong className="text-white">
                          V současné době nepoužíváme analytické cookies.
                        </strong>{" "}
                        Pokud je v budoucnu budeme používat, informujeme o tom a
                        požádáme o souhlas.
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-white mb-3">
                      3.3 Marketingové cookies
                    </h3>
                    <p className="mb-3">
                      Tyto cookies mohou být nastaveny prostřednictvím našich
                      stránek našimi reklamními partnery a mohou být použity k
                      zobrazování relevantních reklam.
                    </p>
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-sm">
                        <strong className="text-white">
                          V současné době nepoužíváme marketingové cookies.
                        </strong>{" "}
                        V případě změny vás budeme informovat a požádáme o
                        souhlas.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    4. Cookies třetích stran
                  </h2>
                  <p className="mb-4">
                    Naše webové stránky mohou obsahovat prvky třetích stran,
                    které mohou také nastavovat cookies, například služby
                    hostingu nebo analytiky.
                  </p>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                      <h4 className="text-white font-semibold mb-2">
                        Vercel Analytics
                      </h4>
                      <p className="text-sm mb-2">
                        Poskytovatel hostingu a analytických služeb pro měření
                        výkonu webu.
                      </p>
                      <a
                        href="https://vercel.com/legal/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm underline"
                      >
                        Zásady ochrany soukromí Vercel →
                      </a>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    5. Jak spravovat cookies
                  </h2>
                  <p className="mb-4">
                    Můžete nastavit svůj prohlížeč tak, aby cookies odmítal nebo
                    vás upozornil, když jsou odesílány. Níže jsou odkazy na
                    nápovědu pro běžné prohlížeče.
                  </p>
                  <div className="space-y-4">
                    <ul className="space-y-2 ml-4">
                      <li>
                        <a
                          href="https://support.google.com/chrome/answer/95647"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          Google Chrome →
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://support.mozilla.org/cs/kb/povoleni-zakazani-cookies"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          Mozilla Firefox →
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://support.apple.com/cs-cz/guide/safari/sfri11471/mac"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          Safari →
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://support.microsoft.com/cs-cz/microsoft-edge/odstranění-souborů-cookie-v-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          Microsoft Edge →
                        </a>
                      </li>
                    </ul>
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-sm text-yellow-200">
                        <strong>Upozornění:</strong> Pokud zakážete cookies,
                        některé funkce webu nemusí fungovat správně.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    6. Doba uložení cookies
                  </h2>
                  <p className="mb-4">
                    Používáme session cookies (dočasné) a persistent cookies
                    (permanentní). Konkrétní doba platnosti je uvedena v tabulce
                    u konkrétních cookies.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    7. Vaše práva
                  </h2>
                  <p className="mb-4">
                    V souladu s GDPR máte právo být informován, odmítnout
                    nepovinné cookies, odvolat souhlas, požádat o smazání
                    cookies nebo podat stížnost u Úřadu pro ochranu osobních
                    údajů.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    8. Kontakt
                  </h2>
                  <p className="mb-4">
                    Máte-li dotazy ohledně našich zásad používání cookies,
                    kontaktujte nás:
                  </p>
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-white">
                      <strong>E-mail:</strong>{" "}
                      <a
                        href="mailto:crew@spotonaut.com"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        crew@spotonaut.com
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
                    9. Další informace
                  </h2>
                  <p className="mb-4">
                    Více informací o cookies a ochraně soukromí naleznete zde:
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li>
                      <a
                        href="https://www.uoou.cz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        Úřad pro ochranu osobních údajů →
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.aboutcookies.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        AboutCookies.org →
                      </a>
                    </li>
                    <li>
                      <Link
                        href="/terms"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        Podmínky použití →
                      </Link>
                    </li>
                  </ul>
                </section>
              </div>

              {/* Footer */}
              <div className="mt-12 pt-8 border-t border-slate-700">
                <p className="text-sm text-slate-500 text-center">
                  Tyto zásady jsou v souladu s nařízením GDPR (EU) 2016/679 a
                  zákonem č. 110/2019 Sb., o zpracování osobních údajů.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-12 border-t border-slate-800/50 mt-20">
          <div className="text-center text-slate-400 text-sm">
            <p>&copy; 2025 Spotonaut / Sparxoft. Všechna práva vyhrazena.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
