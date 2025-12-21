"use client";

import React, { useState } from "react";

export default function UpdateQuotaForm({
  email,
  currentQuota,
}: {
  email: string;
  currentQuota: number;
}) {
  const [quota, setQuota] = useState<number>(currentQuota);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/chat/usage/update-quota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, quota }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error || "Failed to update quota");
      } else {
        setMessage("Updated");
        // refresh to show updated counts
        setTimeout(() => window.location.reload(), 700);
      }
    } catch (err) {
      setMessage("Network error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="number"
        value={quota}
        min={0}
        onChange={(e) => setQuota(Number(e.target.value))}
        className="w-20 px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-white text-sm"
      />
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
