"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { useLocale } from "@/hooks/use-locale";

export default function CreditsExplained() {
  const [selectedScenario, setSelectedScenario] = useState("A");
  const { t } = useLocale();

  return (
    <div className="mt-16 md:mt-24">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-2xl font-semibold md:text-3xl mb-4">
          {t("creditsExplained.title")}
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          {t("creditsExplained.intro")}
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-8">
          <div className="flex items-center gap-2 text-lg">
            <span className="text-2xl">🗺️</span>
            <span>{t("creditsExplained.bullets.analysisCredit")}</span>
          </div>
          <div className="flex items-center gap-2 text-lg">
            <span className="text-2xl">💬</span>
            <span>{t("creditsExplained.bullets.aiQueryCredit")}</span>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-6 mb-6">
          <p className="text-sm text-muted-foreground mb-4">
            {t("creditsExplained.raketaIntro")}
          </p>

          <div className="flex justify-center gap-2 mb-4">
            <Button
              variant={selectedScenario === "A" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedScenario("A")}
            >
              {t("creditsExplained.scenarios.A")}
            </Button>
            <Button
              variant={selectedScenario === "B" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedScenario("B")}
            >
              {t("creditsExplained.scenarios.B")}
            </Button>
            <Button
              variant={selectedScenario === "C" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedScenario("C")}
            >
              {t("creditsExplained.scenarios.C")}
            </Button>
          </div>

          <div className="text-center">
            {selectedScenario === "A" && (
              <p className="text-lg font-medium">
                {t("creditsExplained.scenarios.selectedA")}
              </p>
            )}
            {selectedScenario === "B" && (
              <p className="text-lg font-medium">
                {t("creditsExplained.scenarios.selectedB")}
              </p>
            )}
            {selectedScenario === "C" && (
              <p className="text-lg font-medium">
                {t("creditsExplained.scenarios.selectedC")}
              </p>
            )}
          </div>
        </div>

        {/* <p className="text-sm text-muted-foreground">
          <strong>Tip:</strong> Došly vám kredity? Nevadí. V tarifu Raketa a
          vyšším si můžete kdykoliv dokoupit balíček bez nutnosti upgradovat
          tarif.
        </p> */}
        <p className="text-sm text-muted-foreground">
          <strong>{t("creditsExplained.tipIntro")}</strong>{" "}
          {t("creditsExplained.tip")}
        </p>
      </div>
    </div>
  );
}
