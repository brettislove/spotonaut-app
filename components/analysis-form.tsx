"use client";

import { useState } from "react";

interface AnalysisFormData {
  location: string;
  productType: "coffee" | "snacks" | "cold_drinks";
  operatingHours: number;
  avgSpend: number;
  timeframe: "day" | "week" | "month" | "year";
}

interface AnalysisFormProps {
  onSubmit: (data: AnalysisFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function AnalysisForm({
  onSubmit,
  onCancel,
  isLoading = false,
}: AnalysisFormProps) {
  const [formData, setFormData] = useState<AnalysisFormData>({
    location: "",
    productType: "coffee",
    operatingHours: 40,
    avgSpend: 50,
    timeframe: "month",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof AnalysisFormData, string>>
  >({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof AnalysisFormData, string>> = {};

    if (!formData.location.trim()) {
      newErrors.location = "Lokalita je povinná";
    }

    if (formData.operatingHours < 1 || formData.operatingHours > 168) {
      newErrors.operatingHours = "Hodiny musí být mezi 1-168";
    }

    if (formData.avgSpend < 1) {
      newErrors.avgSpend = "Průměrná útrata musí být alespoň 1 Kč";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const updateField = <K extends keyof AnalysisFormData>(
    field: K,
    value: AnalysisFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 max-w-2xl mx-auto">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">
          Analýza lokality
        </h3>
        <p className="text-slate-400 text-xs">
          Vyplňte informace o vašem podnikání pro podrobnou analýzu
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Location */}
        <div>
          <label
            htmlFor="location"
            className="block text-xs font-medium text-slate-300 mb-1"
          >
            Lokalita *
          </label>
          <input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) => updateField("location", e.target.value)}
            placeholder="např. Václavské náměstí 1, Praha"
            disabled={isLoading}
            className={`w-full bg-slate-900/50 border ${
              errors.location ? "border-red-500" : "border-slate-600"
            } text-white text-sm placeholder-slate-500 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all disabled:opacity-50`}
          />
          {errors.location && (
            <p className="text-red-400 text-xs mt-0.5">{errors.location}</p>
          )}
        </div>

        {/* Product Type */}
        <div>
          <label
            htmlFor="productType"
            className="block text-xs font-medium text-slate-300 mb-1"
          >
            Typ produktu *
          </label>
          <select
            id="productType"
            value={formData.productType}
            onChange={(e) =>
              updateField(
                "productType",
                e.target.value as AnalysisFormData["productType"]
              )
            }
            disabled={isLoading}
            className="w-full bg-slate-900/50 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all disabled:opacity-50"
          >
            <option value="coffee">Káva / Teplé nápoje</option>
            <option value="snacks">Snacky</option>
            <option value="cold_drinks">Studené nápoje</option>
          </select>
        </div>

        {/* Operating Hours and Average Spend - Side by Side */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="operatingHours"
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              Hodiny/týden *
            </label>
            <input
              id="operatingHours"
              type="number"
              min="1"
              max="168"
              value={formData.operatingHours}
              onChange={(e) =>
                updateField("operatingHours", parseInt(e.target.value) || 0)
              }
              disabled={isLoading}
              className={`w-full bg-slate-900/50 border ${
                errors.operatingHours ? "border-red-500" : "border-slate-600"
              } text-white text-sm placeholder-slate-500 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all disabled:opacity-50`}
            />
            {errors.operatingHours && (
              <p className="text-red-400 text-xs mt-0.5">
                {errors.operatingHours}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="avgSpend"
              className="block text-xs font-medium text-slate-300 mb-1"
            >
              Útrata (Kč) *
            </label>
            <input
              id="avgSpend"
              type="number"
              min="1"
              step="1"
              value={formData.avgSpend}
              onChange={(e) =>
                updateField("avgSpend", parseInt(e.target.value) || 0)
              }
              disabled={isLoading}
              className={`w-full bg-slate-900/50 border ${
                errors.avgSpend ? "border-red-500" : "border-slate-600"
              } text-white text-sm placeholder-slate-500 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all disabled:opacity-50`}
            />
            {errors.avgSpend && (
              <p className="text-red-400 text-xs mt-0.5">{errors.avgSpend}</p>
            )}
          </div>
        </div>

        {/* Timeframe */}
        <div>
          <label
            htmlFor="timeframe"
            className="block text-xs font-medium text-slate-300 mb-1"
          >
            Období analýzy *
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: "day", label: "Den" },
              { value: "week", label: "Týden" },
              { value: "month", label: "Měsíc" },
              { value: "year", label: "Rok" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  updateField(
                    "timeframe",
                    option.value as AnalysisFormData["timeframe"]
                  )
                }
                disabled={isLoading}
                className={`py-1.5 px-3 rounded-lg font-medium text-xs transition-all disabled:opacity-50 ${
                  formData.timeframe === option.value
                    ? "bg-blue-500 text-white"
                    : "bg-slate-900/50 border border-slate-600 text-slate-300 hover:border-slate-500"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 bg-slate-700 text-white font-semibold text-sm px-4 py-2 rounded-lg hover:bg-slate-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Zrušit
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-sm px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Analyzuji..." : "Analyzovat"}
          </button>
        </div>
      </form>
    </div>
  );
}
