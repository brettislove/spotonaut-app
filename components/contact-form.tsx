"use client";

import React, { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Vyplňte prosím všechna pole.");
      return false;
    }
    // basic email check
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Zadejte platný e-mail.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Odeslání selhalo");
      }

      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err: unknown) {
      setStatus("error");
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Neznámá chyba při odesílání");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-xl">
      <div>
        <label className="block text-sm text-slate-300 mb-1">Jméno</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg px-3 py-2 bg-slate-800 border border-slate-700 text-white text-sm"
          placeholder="Vaše jméno"
        />
      </div>

      <div>
        <label className="block text-sm text-slate-300 mb-1">E‑mail</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg px-3 py-2 bg-slate-800 border border-slate-700 text-white text-sm"
          placeholder="vaše@email.cz"
        />
      </div>

      <div>
        <label className="block text-sm text-slate-300 mb-1">Zpráva</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="w-full rounded-lg px-3 py-2 bg-slate-800 border border-slate-700 text-white text-sm"
          placeholder="Napište svůj dotaz..."
        />
      </div>

      {error && <div className="text-xs text-red-400">{error}</div>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status === "sending"}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm disabled:opacity-50"
        >
          {status === "sending" ? "Odesílám…" : "Odeslat zprávu"}
        </button>

        {status === "success" && (
          <div className="text-sm text-green-400">
            Děkujeme, zpráva odeslána.
          </div>
        )}
        {status === "error" && (
          <div className="text-sm text-red-400">Chyba: {error}</div>
        )}
      </div>
    </form>
  );
}
