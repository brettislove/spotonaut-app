"use client";

import { useState } from "react";
import { Button } from "./ui/button";

export default function CreditsExplained() {
  const [selectedScenario, setSelectedScenario] = useState("A");

  return (
    <div className="mt-16 md:mt-24">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-2xl font-semibold md:text-3xl mb-4">
          Jak fungují kredity?
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Flexibilita v každém kreditu. Plaťte jen za to, co využijete.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-8">
          <div className="flex items-center gap-2 text-lg">
            <span className="text-2xl">🗺️</span>
            <span>1 kompletní analýza lokality = 10 Kreditů</span>
          </div>
          <div className="flex items-center gap-2 text-lg">
            <span className="text-2xl">💬</span>
            <span>1 dotaz na AI asistenta = 1 Kredit</span>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-6 mb-6">
          <p className="text-sm text-muted-foreground mb-4">
            S tarifem 🚀 Raketa (500 kreditů) můžete měsíčně udělat například:
          </p>

          <div className="flex justify-center gap-2 mb-4">
            <Button
              variant={selectedScenario === "A" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedScenario("A")}
            >
              Scénář A
            </Button>
            <Button
              variant={selectedScenario === "B" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedScenario("B")}
            >
              Scénář B
            </Button>
            <Button
              variant={selectedScenario === "C" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedScenario("C")}
            >
              Scénář C
            </Button>
          </div>

          <div className="text-center">
            {selectedScenario === "A" && (
              <p className="text-lg font-medium">
                50 Hloubkových analýz a 0 dotazů.
              </p>
            )}
            {selectedScenario === "B" && (
              <p className="text-lg font-medium">
                20 Analýz (200 kr.) + 300 Dotazů na AI (doladění detailů).
              </p>
            )}
            {selectedScenario === "C" && (
              <p className="text-lg font-medium">
                5 Analýz (50 kr.) + Exporty + 450 Dotazů.
              </p>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          <strong>Tip:</strong> Došly vám kredity? Nevadí. V tarifu Raketa a
          vyšším si můžete kdykoliv dokoupit balíček bez nutnosti upgradovat
          tarif.
        </p>
      </div>
    </div>
  );
}
