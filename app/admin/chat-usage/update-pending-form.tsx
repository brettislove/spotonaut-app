"use client";

import React, { useState } from "react";

export default function UpdatePendingForm({
  email,
  currentPending,
}: {
  email: string;
  currentPending: boolean;
}) {
  const [pending, setPending] = useState<boolean>(currentPending);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleToggle = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/chat-usage/set-pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, requestPending: !pending }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error || "Failed to update");
      } else {
        setPending(!pending);
        setMessage("Updated");
        setTimeout(() => window.location.reload(), 700);
      }
    } catch (err) {
      setMessage("Network error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        disabled={isSaving}
        className={`px-3 py-1 rounded-md text-sm ${
          pending
            ? "bg-yellow-600 hover:bg-yellow-700 text-white"
            : "bg-slate-800 hover:bg-slate-700 text-slate-200"
        } disabled:opacity-60`}
      >
        {isSaving ? "Saving..." : pending ? "Pending" : "Clear"}
      </button>
      {message && <div className="text-sm text-slate-300">{message}</div>}
    </div>
  );
}
