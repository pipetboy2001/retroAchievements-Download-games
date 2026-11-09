"use client";

import { useEffect, useState } from "react";
import { getLocale, initLocale, setLocale as setLocaleGlobal, subscribe, t as translate, type Key, type Locale } from "./i18n";

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(getLocale());

  useEffect(() => {
    setLocaleState(initLocale());
    return subscribe(setLocaleState);
  }, []);

  return {
    locale,
    setLocale: setLocaleGlobal,
    t: (key: Key) => translate(key, locale),
  };
}
