"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Info, Cookie } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CookieBannerNew() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Delay check to avoid hydration mismatch
    requestAnimationFrame(() => {
      const cookieConsent = localStorage.getItem("cookieConsent");
      if (!cookieConsent) {
        setShowBanner(true);
      }
    });
  }, []);

  const acceptCookies = () => {
    try {
      localStorage.setItem("cookieConsent", "accepted");
    } catch (e) {
      console.warn("Failed to persist cookie consent", e);
    }
    setShowBanner(false);
  };

  const rejectCookies = () => {
    try {
      localStorage.setItem("cookieConsent", "declined");
    } catch (e) {
      console.warn("Failed to persist cookie consent", e);
    }
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 px-4">
      <div className="max-w-6xl mx-auto">
        <Card className="bg-card/95 backdrop-blur-lg border-border shadow-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Cookie className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">Používáme cookies</CardTitle>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 pb-4">
            <CardDescription className="text-sm leading-relaxed">
              Používáme cookies k zajištění základní funkčnosti webu a zlepšení
              vaší uživatelské zkušenosti. Sbíráme anonymní analytická data
              (zobrazení stránek, používání funkcí, země/region) pro zlepšení
              našich služeb. IP adresy jsou hashovány denně, data uchováváme 90
              dní. Neukládáme osobní údaje.
            </CardDescription>

            <Link
              href="/cookies"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors group"
            >
              <Info className="w-4 h-4" />
              <span>Zobrazit podrobnosti o cookies</span>
            </Link>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={rejectCookies}
              className="w-full sm:w-auto"
            >
              Pouze nezbytné
            </Button>
            <Button
              variant="default"
              onClick={acceptCookies}
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              Přijmout vše
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
