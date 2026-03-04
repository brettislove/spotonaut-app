import { cookies, headers } from "next/headers";
import { NextRequest } from "next/server";
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  LOCALE_COOKIE_NAME,
  Locale,
} from "./config";

function parseAcceptLanguage(acceptLanguage: string | null): Locale | null {
  if (!acceptLanguage) {
    return null;
  }

  const lower = acceptLanguage.toLowerCase();

  if (lower.includes("cs")) {
    return "cs";
  }

  if (lower.includes("en")) {
    return "en";
  }

  return null;
}

export async function detectLocaleFromServerContext(): Promise<Locale> {
  const cookieStore = await cookies();
  const localeFromCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  if (isSupportedLocale(localeFromCookie)) {
    return localeFromCookie;
  }

  const headersStore = await headers();
  return (
    parseAcceptLanguage(headersStore.get("accept-language")) ?? DEFAULT_LOCALE
  );
}

export function detectLocaleFromRequest(request: NextRequest): Locale {
  const localeFromCookie = request.cookies.get(LOCALE_COOKIE_NAME)?.value;

  if (isSupportedLocale(localeFromCookie)) {
    return localeFromCookie;
  }

  return (
    parseAcceptLanguage(request.headers.get("accept-language")) ??
    DEFAULT_LOCALE
  );
}
