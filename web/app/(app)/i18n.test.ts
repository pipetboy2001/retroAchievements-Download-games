import { beforeEach, describe, expect, it } from "vitest";
import {
  downloadAllLabel,
  downloadingToast,
  gamesSelected,
  getLocale,
  resultsCount,
  setLocale,
  subscribe,
  t,
} from "./i18n";

beforeEach(() => {
  setLocale("es");
});

describe("t", () => {
  it.each([
    ["es", "Cerrar"],
    ["en", "Close"],
    ["pt", "Fechar"],
    ["fr", "Fermer"],
  ] as const)("translates common.close for %s", (locale, expected) => {
    expect(t("common.close", locale)) .toBe(expected);
  });

  it("defaults to the current locale when none is passed", () => {
    setLocale("en");
    expect(t("common.close")).toBe("Close");
  });
});

describe("gamesSelected", () => {
  it.each([
    ["es", 1, "1 juego seleccionado"],
    ["es", 2, "2 juegos seleccionados"],
    ["en", 1, "1 game selected"],
    ["en", 2, "2 games selected"],
    ["pt", 1, "1 jogo selecionado"],
    ["fr", 1, "1 jeu sélectionné"],
    ["fr", 2, "2 jeux sélectionnés"],
  ] as const)("pluralizes correctly for %s / n=%i", (locale, n, expected) => {
    expect(gamesSelected(n, locale)).toBe(expected);
  });
});

describe("downloadAllLabel / downloadingToast", () => {
  it("interpolates the count", () => {
    expect(downloadAllLabel(3, "es")).toBe("Descargar todo (3)");
    expect(downloadingToast(1, "es")).toBe("Descargando 1 juego…");
    expect(downloadingToast(2, "es")).toBe("Descargando 2 juegos…");
  });
});

describe("resultsCount", () => {
  it("omits the filter clause when there is none", () => {
    expect(resultsCount(10, "", "es")).toBe("10 juegos");
  });

  it("includes the filter clause when present", () => {
    expect(resultsCount(10, "SNES", "es")).toBe("10 juegos en SNES");
  });
});

describe("setLocale / getLocale / subscribe", () => {
  it("updates getLocale() and notifies subscribers", () => {
    const seen: string[] = [];
    const unsubscribe = subscribe((l) => seen.push(l));

    setLocale("pt");

    expect(getLocale()).toBe("pt");
    expect(seen).toEqual(["pt"]);

    unsubscribe();
    setLocale("fr");
    expect(seen).toEqual(["pt"]); // ya no se notifica tras desuscribirse
  });
});
