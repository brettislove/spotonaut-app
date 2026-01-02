"use client";

import { useId, useRef, useState, useEffect } from "react";

interface FieldHelpProps {
  title?: string;
  description: string;
}

export default function FieldHelp({ title, description }: FieldHelpProps) {
  const id = useId();
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (!open) return;
      const t = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(t) &&
        buttonRef.current &&
        !buttonRef.current.contains(t)
      ) {
        setOpen(false);
      }
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={`fh-${id}`}
        onClick={() => setOpen((s) => !s)}
        title="Nápověda"
        className="ms-2 inline-flex items-center align-middle h-4 leading-none text-slate-400 hover:text-slate-200"
      >
        <svg
          className="w-4 h-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.529 9.988a2.502 2.502 0 1 1 5 .191A2.441 2.441 0 0 1 12 12.582V14m-.01 3.008H12M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
        <span className="sr-only">Zobrazit nápovědu</span>
      </button>

      <div
        id={`fh-${id}`}
        ref={popoverRef}
        role="tooltip"
        aria-hidden={!open}
        className={`absolute z-50 mt-2 p-3 inline-block text-sm transition-opacity duration-150 rounded-lg shadow-2xl border border-slate-700 bg-slate-900/95 text-slate-100 ${
          open
            ? "visible opacity-100"
            : "invisible opacity-0 pointer-events-none"
        } left-1/2 -translate-x-1/2 transform max-w-[calc(100vw-1.5rem)] w-full sm:w-72 sm:left-auto sm:translate-x-0`}
      >
        <div>
          {title && (
            <h3 className="font-semibold text-heading mb-2">{title}</h3>
          )}
          <p className="text-sm text-slate-300">{description}</p>
        </div>
      </div>
    </>
  );
}
