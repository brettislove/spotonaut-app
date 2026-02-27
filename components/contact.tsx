"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

export default function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Vyplňte prosím všechna povinná pole.");
      return;
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Zadejte prosím platný e-mail.");
      return;
    }

    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Odeslání se nepodařilo");
      }

      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch (submitError) {
      setStatus("error");
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Neznámá chyba při odesílání",
      );
    }
  };

  return (
    <section className="py-8">
      <div className="mx-auto max-w-3xl px-8 lg:px-0">
        <h1 className="text-center text-4xl font-semibold lg:text-5xl">
          Potřebujete s něčím poradit?
        </h1>
        <p className="mt-4 text-center">
          Pokud si s něčím nevíte rady, nebo chcete probrat možnosti využití
          Spotonauta ve vaší firmě, neváhejte nám napsat. Rádi vám pomůžeme.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Card className="p-5">
            <h2 className="text-base font-semibold">
              Pro firmy: kontakt napřímo
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Firemní poptávky a spolupráce řešíme přednostně e-mailem na{" "}
              <a
                href="mailto:crew@spotonaut.com"
                className="underline underline-offset-2"
              >
                crew@spotonaut.com
              </a>
              . Odpovídáme obvykle do 1 pracovního dne.
            </p>
          </Card>
          <Card className="p-5">
            <h2 className="text-base font-semibold">Sledujte nás</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              <a
                href="https://x.com/spotonaut"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                X
              </a>{" "}
              ·{" "}
              <a
                href="https://www.instagram.com/spotonaut/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                Instagram
              </a>{" "}
              ·{" "}
              <a
                href="https://www.facebook.com/profile.php?id=61585409315276"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                Facebook
              </a>{" "}
              ·{" "}
              <a
                href="https://www.tiktok.com/@spotonaut"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                TikTok
              </a>
            </p>
          </Card>
        </div>

        <Card className="mx-auto mt-12 max-w-lg p-8 shadow-md sm:p-16">
          <div>
            <h2 className="text-xl font-semibold">
              Dejte nám vědět a my se vám ozveme
            </h2>
            <p className="mt-4 text-sm">
              Máte otázku k používání Spotonautu? Napište nám a my se vám co
              nejdříve ozveme s odpovědí.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="mb-2 inline-block">
                Jméno *
              </Label>
              <Input
                type="text"
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="mb-2 inline-block">
                E-mail *
              </Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <Label htmlFor="msg" className="mb-2 inline-block">
                Zpráva *
              </Label>
              <Textarea
                id="msg"
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {status === "success" && (
              <p className="text-sm text-foreground">
                Děkujeme, zpráva byla odeslána. Ozveme se co nejdříve.
              </p>
            )}

            <p className="text-xs text-muted-foreground">
              Odesláním formuláře souhlasíte se zpracováním údajů pro vyřízení
              dotazu.
            </p>

            <Button type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Odesílám…" : "Odeslat"}
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
}
