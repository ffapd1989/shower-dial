// SPDX-FileCopyrightText: 2026 Felipe Drummond
// SPDX-License-Identifier: MIT
// How the key is drawn. Pure functions: state in, SVG data URI out.
//
// IMPORTANT: the rasteriser is QtSvg (SVG Tiny profile), which ignores font
// lists and quotes in font-family. One family, unquoted, or the font silently
// falls back to the default. No CSS, gradients or filters either.

const PAPER = "#16181d";
const INK = "#e8eaed";
const DIM = "#5c626b";
const AMBER = "#ffb02e";
const RED = "#e8705c";
const FONT = "Segoe UI";

export function escapeText(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function asImage(inner: string): string {
  return `data:image/svg+xml;charset=utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72">` +
      `<rect width="72" height="72" rx="8" fill="${PAPER}"/>${inner}</svg>`,
  )}`;
}

function flame(tone: string): string {
  return `<path d="M11 19c0-4 2.2-6.4 3.6-8.2.3 2 1.2 3 2.2 3.6C17.6 12.6 17 9.8 15.4 7` +
    `c4 1.2 6.6 5 6.6 9.6 0 3.6-2.5 6.4-5.5 6.4S11 22.6 11 19z" fill="${tone}"/>`;
}

function lock(tone: string): string {
  return `<rect x="52" y="13" width="12" height="9" rx="1.6" fill="${tone}"/>` +
    `<path d="M54.5 13v-2.5a3.5 3.5 0 0 1 7 0V13" fill="none" stroke="${tone}"` +
    ` stroke-width="1.8"/>`;
}

function line(text: string, y: number, size: number, tone: string, opacity = 0.9): string {
  return `<text x="36" y="${y}" text-anchor="middle" font-family="${FONT}"` +
    ` font-size="${size}" fill="${tone}" opacity="${opacity}">${escapeText(text)}</text>`;
}

export type KeyFace = {
  /** What the heater is set to right now. */
  setpoint: number | undefined;
  /** Where the plugin is walking it to, while a walk is under way. */
  goingTo: number | undefined;
  on: boolean;
  heating: boolean;
  /** Someone else holds the lock: the key cannot act. */
  locked: boolean;
  label: string;
  /** The state line under the number, already in the owner's language. */
  detail: string;
};

/** The dial key: the setpoint is the key. Amber while water is being heated,
 *  white at rest, dim when the heater is off. A red lock means the phone is in
 *  charge; a small arrow above the number shows where a walk is heading. */
export function dialKey(face: KeyFace): string {
  const tone = !face.on ? DIM : face.heating ? AMBER : INK;
  const ring = face.heating && face.on
    ? `<rect x="2" y="2" width="68" height="68" rx="7" fill="none" stroke="${AMBER}"` +
      ` stroke-width="2" opacity="0.85"/>`
    : "";
  const shown = face.setpoint === undefined ? "—" : `${face.setpoint}°`;
  const number = line(shown, face.label ? 42 : 46, face.label ? 26 : 30, tone, 0.95);
  const badge = (face.heating && face.on ? flame(AMBER) : "") + (face.locked ? lock(RED) : "");
  const heading = face.goingTo !== undefined && face.goingTo !== face.setpoint
    ? line(`→ ${face.goingTo}°`, 15, 10, AMBER, 0.9) : "";
  const title = face.label ? line(face.label, 56, 9.5, INK, 0.8) : "";
  const detail = face.detail ? line(face.detail, 66, 8.5, face.locked ? RED : tone, 0.8) : "";
  return asImage(ring + badge + heading + number + title + detail);
}

/** A message the owner has to read, centred and big enough to actually read. */
export function noticeKey(lines: string[], tone = INK): string {
  const size = lines.length > 1 ? 11.5 : 12.5;
  const step = size + 4;
  const top = 36 - ((lines.length - 1) * step) / 2 + size / 3;
  return asImage(lines.map((text, index) => line(text, top + index * step, size, tone, 0.85))
    .join(""));
}
