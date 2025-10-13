import React, { createContext, useContext, useMemo, useState } from "react";

// Types
export type Locale = "vi" | "en";
export type Translations = Record<string, string>;

export interface I18nContextValue {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  t: (key: string) => string;
}

// Context
export const I18nContext = createContext<I18nContextValue | undefined>(
  undefined
);
  
// Hook
export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};

// Translations
import vi from "../locales/vi.json";
import en from "../locales/en.json";

const localeMap: Record<Locale, Translations> = {
  vi,
  en,
};

// Provider
export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [locale, setLocale] = useState<Locale>("vi");

  const value = useMemo<I18nContextValue>(() => {
    const dict = localeMap[locale] || {};
    const t = (key: string) => dict[key] ?? key;
    return { locale, setLocale, t };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
