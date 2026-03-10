"use client";

import React, { useState } from "react";
import { TIER_RAKETA, TIER_SATELLITE, TIER_SONDA } from "@/lib/constants/tiers";

export default function UpdateQuotaForm({
  email,
  currentTier,
}: {
  email: string;
  currentTier: number;
}) {
  const [tier, setTier] = useState<number>(currentTier);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/users/credits/update-tier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tier, resetUsage: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error || "Failed to update tier");
      } else {
        setMessage("Updated");
        setTimeout(() => window.location.reload(), 700);
      }
    } catch {
      setMessage("Network error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <select
        value={tier}
        onChange={(e) => setTier(Number(e.target.value))}
        className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-white text-sm"
      >
        <option value={TIER_SONDA}>Sonda</option>
        <option value={TIER_RAKETA}>Raketa</option>
        <option value={TIER_SATELLITE}>Satelit</option>
      </select>
      <button
        type="submit"
        disabled={isSaving}
        className="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm disabled:opacity-60"
      >
        {isSaving ? "Saving..." : "Update"}
      </button>
      {message && <div className="text-sm text-slate-300">{message}</div>}
    </form>
  );
}
