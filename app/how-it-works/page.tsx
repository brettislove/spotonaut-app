import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-slate-950 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Jak to funguje
            </span>
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg">
            Výběr lokality může být <b className="text-blue-400">nejdražší</b>{" "}
            rozhodnutí celého podnikání. Přitom se pořád často dělá{" "}
            <b className="text-blue-400">„pocitově“</b>. Spotonaut vznikl proto,
            aby podnikatelé, včetně začínajících, měli{" "}
            <b className="text-blue-400">
              rychlý, srozumitelný a jednotný způsob
            </b>
            , jak si místo prověřit dřív, než podepíšou nájemní či kupní
            smlouvu.
          </p>
        </header>

        <section className="grid gap-8 mb-12">
          <div className="lg:col-span-2 p-8">
            <h2 className="text-2xl font-semibold text-white mb-8">
              Postup krok za krokem
            </h2>
            <ol className="space-y-8">
              <li className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 flex items-start gap-4">
                <div className="flex-none w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center font-semibold">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Zadej vstupní data
                  </h3>
                  <p className="text-slate-300">
                    Vyber cílovou lokalitu (špendlík na mapě nebo adresa). Uveď
                    typ podnikání — tento výběr řídí celou analýzu.
                  </p>
                </div>
              </li>

              <li className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 flex items-start gap-4">
                <div className="flex-none w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center font-semibold">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Spustíme průzkum okolí
                  </h3>
                  <p className="text-slate-300">
                    Spotonaut využije mapové podklady a veřejná data (doprava,
                    druh zástavby, konkurence), aby pochopil kontext místa.
                  </p>
                </div>
              </li>

              <li className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 flex items-start gap-4">
                <div className="flex-none w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center font-semibold">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    AI analýza a skóre
                  </h3>
                  <p className="text-slate-300">
                    Modely vyhodnotí lokaci a průchodnost, zobrazíme klíčová
                    skóre 0–100 a krátké shrnutí.
                  </p>
                </div>
              </li>

              <li className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 flex items-start gap-4">
                <div className="flex-none w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center font-semibold">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Interaktivní chat s doporučeními
                  </h3>
                  <p className="text-slate-300">
                    V chatu dostaneš detailní rozbor metrik a konkrétní
                    doporučení (sortiment, otevírací doba, marketing). Polož
                    další otázky a rozvíjej strategii.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Tipy jak Spotonaut využít naplno
          </h2>
          <ul className="grid sm:grid-cols-2 gap-4 text-slate-300">
            <li className="bg-slate-900/40 rounded-lg p-4 ring-1 ring-slate-800">
              Testuj víc lokalit se stejným typem podnikání pro srovnání.
            </li>
            <li className="bg-slate-900/40 rounded-lg p-4 ring-1 ring-slate-800">
              Zkus různé typy podnikání na téže adrese a porovnej skóre.
            </li>
            <li className="bg-slate-900/40 rounded-lg p-4 ring-1 ring-slate-800">
              Použij chat pro doporučení ohledně sortimentu a otevírací doby.
            </li>
            <li className="bg-slate-900/40 rounded-lg p-4 ring-1 ring-slate-800">
              Ulož výsledky a sdílej je s poradcem nebo spolumajitelem.
            </li>
          </ul>
        </section>
        <footer className="text-center">
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-blue-400 to-purple-600 text-white py-3 px-8 rounded-2xl font-semibold shadow-lg"
          >
            Vyzkoušet Spotonaut
          </Link>
          <p className="text-slate-400 text-sm mt-4">
            Potřebuješ pomoct? Napiš nám na{" "}
            <a
              href="mailto:crew@spotonaut.com"
              className="underline text-slate-40 hover:text-white"
            >
              crew@spotonaut.com
            </a>{" "}
            a my Ti rádi poradíme!
          </p>
        </footer>
      </div>
    </div>
  );
}
