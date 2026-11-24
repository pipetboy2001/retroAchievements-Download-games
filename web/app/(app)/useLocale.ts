"use client";

import { useCallback, useSyncExternalStore } from "react";
import { initLocale, setLocale as setLocaleGlobal, subscribe, t as translate, type Key, type Locale } from "./i18n";

// El HTML pre-renderizado siempre sale en español: durante la hidratación React usa este
// snapshot y recién después el idioma guardado en localStorage. Leerlo en el primer render
// rompía la hidratación para quien tuviera otro idioma elegido.
const serverLocale = (): Locale => "es";

export function useLocale() {
  const locale = useSyncExternalStore(subscribe, initLocale, serverLocale);

  const t = useCallback((key: Key) => translate(key, locale), [locale]);

  return {
    locale,
    setLocale: setLocaleGlobal,
    t,
  };
}
