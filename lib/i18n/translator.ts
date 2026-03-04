import { DEFAULT_LOCALE, Locale } from "./config";
import cs from "./messages/cs";
import en from "./messages/en";

type Primitive = string | number | boolean | null | undefined;
export type TranslationParams = Record<string, Primitive>;

type WidenMessageLiterals<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly (infer U)[]
        ? ReadonlyArray<WidenMessageLiterals<U>>
        : T extends object
          ? { readonly [K in keyof T]: WidenMessageLiterals<T[K]> }
          : T;

export type Messages = WidenMessageLiterals<typeof cs>;

const MESSAGES_BY_LOCALE: Record<Locale, Messages> = {
  cs,
  en,
};

function getByPath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }

    return undefined;
  }, source);
}

function interpolate(input: string, params?: TranslationParams): string {
  if (!params) {
    return input;
  }

  return input.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
    const value = params[key];
    return value == null ? "" : String(value);
  });
}

export function getMessages(locale: Locale): Messages {
  return MESSAGES_BY_LOCALE[locale] ?? MESSAGES_BY_LOCALE[DEFAULT_LOCALE];
}

export function createTranslator(locale: Locale) {
  const localeMessages = getMessages(locale);
  const fallbackMessages = getMessages(DEFAULT_LOCALE);

  return (key: string, params?: TranslationParams): string => {
    const fromLocale = getByPath(localeMessages, key);

    if (typeof fromLocale === "string") {
      return interpolate(fromLocale, params);
    }

    const fromFallback = getByPath(fallbackMessages, key);
    if (typeof fromFallback === "string") {
      return interpolate(fromFallback, params);
    }

    return key;
  };
}
