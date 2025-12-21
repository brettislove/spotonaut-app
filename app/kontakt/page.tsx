import ContactForm from "@/components/contact-form";

export default function KontaktPage() {
  return (
    <div className="min-h-screen bg-slate-950 py-16 px-4">
      <div className="max-w-4xl mx-auto text-slate-200">
        <h1 className="text-4xl font-bold text-white mb-6">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Kontakt
          </span>
        </h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-2">
            Identifikace provozovatele
          </h2>
          <div className="text-sm text-slate-300 space-y-1">
            <div>
              <strong>Název firmy:</strong> Břetislav Dančák
            </div>
            <div>
              <strong>Sídlo / Adresa:</strong> Čápkova 16/8, 602 00 Brno
            </div>
            <div>
              <strong>IČO:</strong> 14015056
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-2">
            Kontaktní údaje
          </h2>
          <div className="text-sm text-slate-300 space-y-1">
            <div>
              <strong>Email (pro obchodní dotazy):</strong>{" "}
              <a
                href="mailto:crew@spotonaut.com"
                className="text-blue-300 hover:underline"
              >
                crew@spotonaut.com
              </a>
              <div className="mb-6 text-sm text-slate-400">
                Podrobné informace o ochraně osobních údajů, řešení reklamací a
                sporech naleznete v sekci{" "}
                <a href="/terms" className="text-blue-300 hover:underline">
                  Podmínky použití
                </a>{" "}
                a v{" "}
                <a href="/cookies" className="text-blue-300 hover:underline">
                  Zásadách používání cookies
                </a>
                .
              </div>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Informace o cookies a sledování
          </h2>
          <div className="text-sm text-slate-300 space-y-1">
            <div>
              Na této stránce používáme cookies a další sledovací technologie.
              Účel a rozsah zpracování najdete v našich{" "}
              <a href="/privacy" className="text-blue-300 hover:underline">
                Zásadách ochrany osobních údajů
              </a>{" "}
              a v{" "}
              <a href="/cookies" className="text-blue-300 hover:underline">
                Zásadách používání cookies
              </a>
              .
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-2">
            Formulář pro rychlý kontakt
          </h2>
          <p className="text-sm text-slate-300 mb-3">
            Pro rychlý dotaz můžete použít níže uvedený formulář. Zprávy jsou
            odesílány bezpečně na nastavený kontaktní email.
          </p>
          <ContactForm />
          <div className="text-sm text-slate-300 mt-4">
            <strong>Alternativně napište na email:</strong>{" "}
            <a
              href="mailto:crew@spotonaut.com"
              className="text-blue-300 hover:underline"
            >
              crew@spotonaut.com
            </a>
            <br />
            <strong>Případně zavolejte na telefon:</strong>{" "}
            <a
              href="tel:+420739705084"
              className="text-blue-300 hover:underline"
            >
              +420 739 705 084
            </a>
          </div>
        </section>

        <footer className="border-t border-slate-800 pt-6 text-xs text-slate-500">
          <div className="mb-2">
            Upozornění: výše uvedené údaje jsou uvedeny jako vzor. Nahraďte
            prosím text v hranatých závorkách skutečnými údaji vaší společnosti.
          </div>
          <div>
            Pokud chcete, mohu doplnit automatický kontaktní formulář, validaci
            a server-side zpracování zpráv.
          </div>
        </footer>
      </div>
    </div>
  );
}
