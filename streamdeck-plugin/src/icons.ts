// SPDX-FileCopyrightText: 2026 Felipe Drummond
// SPDX-License-Identifier: MIT
// The pictures a key can wear, drawn in a 24x24 box and tinted with whatever
// colour the state calls for. QtSvg (SVG Tiny) rasterises these: strokes and
// transforms are fine, nothing may rely on CSS, gradients or filters.

export type IconName = "shower" | "bathtub" | "tap" | "flame" | "drop" | "thermometer" | "steam";

export const ICON_NAMES: IconName[] = [
  "shower", "bathtub", "tap", "flame", "drop", "thermometer", "steam",
];

const ART: Record<IconName, (tone: string) => string> = {
  shower: (tone) =>
    `<path d="M2.5 4.5h8a4 4 0 0 1 4 4V10" fill="none" stroke="${tone}" stroke-width="2"` +
    ` stroke-linecap="round"/>` +
    `<path d="M8 10h13l1.5 3.5H6.5z" fill="${tone}"/>` +
    `<rect x="6" y="13.5" width="16.5" height="1.8" rx="0.9" fill="${tone}" opacity="0.7"/>` +
    `<g stroke="${tone}" stroke-width="1.7" stroke-linecap="round" opacity="0.9">` +
    `<path d="M8.5 18v2.5"/><path d="M11.5 18v4.5"/><path d="M14.5 18v3"/>` +
    `<path d="M17.5 18v5"/><path d="M20.5 18v2.5"/></g>`,

  bathtub: (tone) =>
    `<path d="M5.5 11V5.5a2.2 2.2 0 0 1 4.4 0" fill="none" stroke="${tone}" stroke-width="1.8"` +
    ` stroke-linecap="round"/>` +
    `<path d="M2 12h20v2.5a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5z" fill="${tone}"/>` +
    `<g stroke="${tone}" stroke-width="1.8" stroke-linecap="round">` +
    `<path d="M6 19.5v2"/><path d="M18 19.5v2"/></g>`,

  tap: (tone) =>
    `<path d="M5 9.5h7.5a4.5 4.5 0 0 1 4.5 4.5v2" fill="none" stroke="${tone}"` +
    ` stroke-width="2.2" stroke-linecap="round"/>` +
    `<rect x="2.5" y="7.5" width="5" height="4" rx="1.2" fill="${tone}"/>` +
    `<rect x="9" y="4" width="3" height="5.5" rx="1" fill="${tone}"/>` +
    `<rect x="14.5" y="15.5" width="5" height="2.6" rx="1.3" fill="${tone}"/>` +
    `<path d="M17 19.5c-1.3 1.6-1.9 2.5-1.9 3.3a1.9 1.9 0 0 0 3.8 0c0-.8-.6-1.7-1.9-3.3z"` +
    ` fill="${tone}"/>`,

  flame: (tone) =>
    `<path d="M12 22c-4 0-6.8-3-6.8-6.8 0-4.4 2.6-6.9 4.2-9.6.5 2.2 1.6 3.3 2.7 4 0-2.9-.7-5.7-2.7-8.8` +
    ` 5 1.3 9.2 5.8 9.2 11.6 0 5.6-2.9 9.6-6.6 9.6z" fill="${tone}"/>` +
    `<path d="M12 22c-2 0-3.4-1.6-3.4-3.4 0-2.4 1.5-3.6 2.4-4.9.3 1.1.9 1.8 1.4 2.2 0-1.5-.3-2.8-1-4` +
    ` 2.3.9 4.2 3 4.2 5.7 0 2.7-1.6 4.4-3.6 4.4z" fill="#16181d" opacity="0.35"/>`,

  drop: (tone) =>
    `<path d="M12 2.5c-4.5 6.2-7 9.8-7 13a7 7 0 0 0 14 0c0-3.2-2.5-6.8-7-13z" fill="${tone}"/>` +
    `<path d="M8.5 15.5a3.5 3.5 0 0 0 3 3.4" fill="none" stroke="#16181d" stroke-width="1.4"` +
    ` stroke-linecap="round" opacity="0.4"/>`,

  thermometer: (tone) =>
    `<rect x="9" y="2.5" width="6" height="13" rx="3" fill="none" stroke="${tone}"` +
    ` stroke-width="2"/>` +
    `<circle cx="12" cy="18" r="4" fill="${tone}"/>` +
    `<rect x="11" y="8" width="2" height="8" fill="${tone}"/>`,

  steam: (tone) =>
    `<g fill="none" stroke="${tone}" stroke-width="2.2" stroke-linecap="round">` +
    `<path d="M6 21c0-2.5 2.5-3 2.5-5.5S6 12.5 6 10s2.5-3 2.5-5.5"/>` +
    `<path d="M12 21c0-2.5 2.5-3 2.5-5.5S12 12.5 12 10s2.5-3 2.5-5.5"/>` +
    `<path d="M18 21c0-2.5 2.5-3 2.5-5.5S18 12.5 18 10s2.5-3 2.5-5.5"/></g>`,
};

export function iconArt(name: string, tone: string): string {
  return (ART[name as IconName] ?? ART.shower)(tone);
}
