"use client";

import { useState, useRef, useEffect } from "react";
import {
  BUSINESS_TYPES_BY_CATEGORY,
  CATEGORIES,
  type BusinessType,
} from "@/lib/constants/business-types";
import FieldHelp from "./field-help";

interface BusinessTypeSelectProps {
  value: BusinessType | null;
  onChange: (businessType: BusinessType) => void;
  disabled?: boolean;
  error?: string;
}

export default function BusinessTypeSelect({
  value,
  onChange,
  disabled = false,
  error,
}: BusinessTypeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const helpButtonRef = useRef<HTMLButtonElement | null>(null);
  const [showPopover, setShowPopover] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close popover when clicking outside or pressing Escape
  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (!showPopover) return;
      const target = event.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        helpButtonRef.current &&
        !helpButtonRef.current.contains(target)
      ) {
        setShowPopover(false);
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowPopover(false);
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [showPopover]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Normalize string for diacritics-insensitive comparison
  const normalize = (s: string) =>
    s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

  // Filter business types based on search query (diacritics-insensitive)
  const filteredCategories = searchQuery
    ? (() => {
        const normalizedQuery = normalize(searchQuery);
        return CATEGORIES.map((category) => ({
          category,
          types: BUSINESS_TYPES_BY_CATEGORY[category].filter((business) =>
            normalize(business.type).includes(normalizedQuery)
          ),
        })).filter((cat) => cat.types.length > 0);
      })()
    : CATEGORIES.map((category) => ({
        category,
        types: BUSINESS_TYPES_BY_CATEGORY[category],
      }));

  const handleSelect = (businessType: BusinessType) => {
    onChange(businessType);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label
        htmlFor="businessType"
        className="block mb-2 text-sm font-medium text-white"
      >
        Typ podnikání
        <FieldHelp description="Vyberte typ podnikání, který nejlépe vystihuje vaši provozovnu. Tento výběr pomůže přizpůsobit odhad návštěvnosti a doporučené provozní parametry (např. průměrná útrata, otevírací doba)." />
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`inline-flex items-center justify-between w-full p-2.5 text-sm font-medium text-white bg-slate-800 border rounded-lg hover:bg-slate-700 focus:ring-2 focus:outline-none focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
          error ? "border-red-500" : "border-slate-600"
        }`}
      >
        <span className={value ? "" : "text-slate-400"}>
          {value ? value.type : "Vyberte typ podnikání"}
        </span>
        <svg
          className={`w-2.5 h-2.5 ms-3 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 4 4 4-4"
          />
        </svg>
      </button>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-96 overflow-hidden flex flex-col">
          {/* Search input */}
          <div className="p-3 border-b border-slate-700">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Hledat typ podnikání..."
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Business types list */}
          <div className="overflow-y-auto">
            {filteredCategories.length > 0 ? (
              filteredCategories.map(({ category, types }) => (
                <div key={category}>
                  <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-700">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {category}
                    </h4>
                  </div>
                  <ul className="py-1">
                    {types.map((business) => (
                      <li key={business.type}>
                        <button
                          type="button"
                          onClick={() => handleSelect(business)}
                          className={`flex items-center justify-between w-full px-4 py-2.5 text-left hover:bg-slate-700 transition-colors ${
                            value?.type === business.type
                              ? "bg-slate-700 text-white"
                              : "text-slate-200"
                          }`}
                        >
                          <span className="text-sm">{business.type}</span>
                          {/* To be implemented in the future */}
                          {/* {business.avgSpend > 0 && (
                            <span className="text-xs text-slate-400">
                              ~{business.avgSpend} Kč/zákazník
                            </span>
                          )} */}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-slate-400">
                Žádné výsledky pro &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
