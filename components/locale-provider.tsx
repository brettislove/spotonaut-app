"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import {
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_COOKIE_NAME,
  Locale,
} from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n/translator";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (
    key: string,
    params?: Record<string, string | number | boolean | null | undefined>,
  ) => string;
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export default function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const value = useMemo<LocaleContextValue>(() => {
    const t = createTranslator(locale);

    return {
      locale,
      setLocale: (nextLocale: Locale) => {
        if (nextLocale === locale) {
          return;
        }

        document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
        setLocaleState(nextLocale);
        document.documentElement.lang = nextLocale;
        window.location.reload();
      },
      t,
    };
  }, [locale]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }

  return context;
}
