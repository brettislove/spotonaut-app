"use client";

import React, { useEffect, useState } from "react";

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

const DAYS: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Po" },
  { key: "tue", label: "Út" },
  { key: "wed", label: "St" },
  { key: "thu", label: "Čt" },
  { key: "fri", label: "Pá" },
  { key: "sat", label: "So" },
  { key: "sun", label: "Ne" },
];

interface OperatingDaysProps {
  initial?: Partial<Record<DayKey, number>>;
  disabled?: boolean;
  onChange?: (totalHours: number, days: Record<DayKey, number>) => void;
  error?: string | undefined;
}

// sensible defaults: Mon-Fri 8h, Sat 6h, Sun 0h
const DEFAULTS: Record<DayKey, number> = {
  mon: 8,
  tue: 8,
  wed: 8,
  thu: 8,
  fri: 8,
  sat: 8,
  sun: 8,
};

export default function OperatingDays({
  initial,
  disabled = false,
  onChange,
  error,
}: OperatingDaysProps) {
  const [hours, setHours] = useState<Record<DayKey, number>>(() => {
    const base: Record<DayKey, number> = {
      mon: 0,
      tue: 0,
      wed: 0,
      thu: 0,
      fri: 0,
      sat: 0,
      sun: 0,
    };
    if (initial) {
      (Object.keys(base) as DayKey[]).forEach((k) => {
        base[k] = initial[k] ?? DEFAULTS[k];
      });
    } else {
      // default to regular work week
      (Object.keys(base) as DayKey[]).forEach((k) => {
        base[k] = DEFAULTS[k];
      });
    }
    return base;
  });

  // calculate total and notify parent
  useEffect(() => {
    const total = Object.values(hours).reduce((s, h) => s + (h || 0), 0);
    onChange?.(total, hours);
  }, [hours, onChange]);

  const toggleDay = (key: DayKey) => {
    setHours((prev) => {
      const isActive = !!prev[key];
      const next = { ...prev };
      next[key] = isActive ? 0 : DEFAULTS[key] ?? 8;
      return next;
    });
  };

  const setDayHours = (key: DayKey, value: number) => {
    const v = Math.max(0, Math.min(24, Math.round(value || 0)));
    setHours((prev) => ({ ...prev, [key]: v }));
  };

  return (
    <div>
      <div className="grid grid-cols-7 gap-2">
        {DAYS.map((d) => {
          const active = (hours[d.key] || 0) > 0;
          return (
            <div
              key={d.key}
              className="flex flex-col items-center operating-day-cell"
            >
              <button
                type="button"
                onClick={() => toggleDay(d.key)}
                disabled={disabled}
                aria-pressed={active}
                className={`w-full cursor-pointer px-2 py-2 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  active
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white"
                }`}
                title={active ? "Kliknutím vypnete" : "Kliknutím zapnete"}
              >
                {d.label}
              </button>
            </div>
          );
        })}
      </div>

      {/* <div className="flex items-center justify-between mt-3">
        <span className="text-sm text-slate-400">
          Vybráno: {Object.values(hours).filter((h) => h > 0).length} dní
        </span>
        <span className="px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 border border-blue-500 rounded-lg">
          {Object.values(hours).reduce((s, h) => s + (h || 0), 0)}h/týdně
        </span>
      </div> */}

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
