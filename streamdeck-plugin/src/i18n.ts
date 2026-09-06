// SPDX-FileCopyrightText: 2026 Felipe Drummond
// SPDX-License-Identifier: MIT
// Words that appear ON THE KEY. The panel has its own table (ui/inspector.html):
// same reader, different space — a key fits two short words at most.

export type Locale = "pt" | "en" | "es";

export type KeyText = {
  searching: string;
  noHeater: string;
  off: string;
  heating: string;
  locked: string;
  ready: string;
};

const TEXT: Record<Locale, KeyText> = {
  pt: {
    searching: "procurando…",
    noHeater: "sem aquecedor",
    off: "desligado",
    heating: "aquecendo",
    locked: "no celular",
    ready: "pronto",
  },
  en: {
    searching: "searching…",
    noHeater: "no heater",
    off: "off",
    heating: "heating",
    locked: "phone in control",
    ready: "ready",
  },
  es: {
    searching: "buscando…",
    noHeater: "sin calentador",
    off: "apagado",
    heating: "calentando",
    locked: "en el móvil",
    ready: "listo",
  },
};

/** Maps whatever the Stream Deck or the OS reports into one of the three. */
export function asLocale(raw: string | undefined): Locale | undefined {
  const tag = (raw ?? "").toLowerCase();
  if (tag.startsWith("pt")) return "pt";
  if (tag.startsWith("es")) return "es";
  if (tag.startsWith("en")) return "en";
  return undefined;
}

/** The owner's explicit choice wins; then the Stream Deck's language when it is
 *  one we speak; then the OS locale, because the Stream Deck app has no
 *  Portuguese and would otherwise force English on a Brazilian desk. */
export function pickLocale(chosen: string | undefined, appLanguage: string | undefined,
                           systemLocale: string | undefined): Locale {
  if (chosen && chosen !== "auto") return asLocale(chosen) ?? "en";
  return asLocale(appLanguage) ?? asLocale(systemLocale) ?? "en";
}

export function keyText(locale: Locale): KeyText {
  return TEXT[locale] ?? TEXT.en;
}
