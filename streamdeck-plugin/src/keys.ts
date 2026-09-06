// SPDX-FileCopyrightText: 2026 Felipe Drummond
// SPDX-License-Identifier: MIT
// How the key is drawn. Pure functions: state in, SVG data URI out.
//
// IMPORTANT: the rasteriser is QtSvg (SVG Tiny profile), which ignores font
// lists and quotes in font-family. One family, unquoted, or the font silently
// falls back to the default. No CSS, gradients or filters either.

import { iconArt, ICON_NAMES } from "./icons.ts";

const PAPER = "#16181d";
const INK = "#e8eaed";
const DIM = "#5c626b";
const IDLE = "#8a9099";
const AMBER = "#ffb02e";
const RED = "#e8705c";
const FONT = "Segoe UI";

/** Colours the owner may paint the label with. Amber first: it is the house colour. */
export const TINTS: { name: string; value: string }[] = [
  { name: "white", value: INK },
  { name: "amber", value: AMBER },
  { name: "warm", value: "#ffd9a0" },
  { name: "green", value: "#7fd1a6" },
  { name: "cyan", value: "#5fd6cf" },
  { name: "blue", value: "#5aa9e6" },
  { name: "violet", value: "#b18cf0" },
  { name: "pink", value: "#ec86b8" },
  { name: "red", value: RED },
];

export function isTint(colour: string | undefined): boolean {
  return TINTS.some((entry) => entry.value === colour);
}

/** Everything the owner chose about how the key looks. */
export type KeyLook = {
  icon: string;
  /** Side of the icon's box in key pixels; 0 hides it. */
  iconSize: number;
  labelSize: number;
  labelColor: string;
  labelBold: boolean;
};

export const PLAIN_LOOK: KeyLook = {
  icon: "shower", iconSize: 22, labelSize: 9.5, labelColor: INK, labelBold: false,
};

export function escapeText(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function asImage(inner: string): string {
  return `data:image/svg+xml;charset=utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72">` +
      `<rect width="72" height="72" rx="8" fill="${PAPER}"/>${inner}</svg>`,
  )}`;
}

function lock(tone: string): string {
  return `<rect x="52" y="13" width="12" height="9" rx="1.6" fill="${tone}"/>` +
    `<path d="M54.5 13v-2.5a3.5 3.5 0 0 1 7 0V13" fill="none" stroke="${tone}"` +
    ` stroke-width="1.8"/>`;
}

function line(text: string, y: number, size: number, tone: string, opacity = 0.9,
              bold = false): string {
  return `<text x="36" y="${y}" text-anchor="middle" font-family="${FONT}"` +
    ` font-size="${size}"${bold ? ` font-weight="bold"` : ""} fill="${tone}"` +
    ` opacity="${opacity}">${escapeText(text)}</text>`;
}

/** The chosen icon in the top-left corner, at the chosen size. */
function badge(look: KeyLook, tone: string): string {
  if (look.iconSize <= 0) return "";
  const scale = look.iconSize / 24;
  return `<g transform="translate(5,5) scale(${scale.toFixed(3)})">${iconArt(look.icon, tone)}</g>`;
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
  look: KeyLook;
};

/** The dial key: the setpoint is the key. Amber while water is being heated,
 *  white at rest, dim when the heater is off. The owner's icon sits in the
 *  corner and takes the same colour; a red lock means the phone is in charge; a
 *  small arrow above the number shows where a walk is heading. */
export function dialKey(face: KeyFace): string {
  const { look } = face;
  const tone = !face.on ? DIM : face.heating ? AMBER : INK;
  const iconTone = !face.on ? DIM : face.heating ? AMBER : IDLE;
  const ring = face.heating && face.on
    ? `<rect x="2" y="2" width="68" height="68" rx="7" fill="none" stroke="${AMBER}"` +
      ` stroke-width="2" opacity="0.85"/>`
    : "";
  const shown = face.setpoint === undefined ? "—" : `${face.setpoint}°`;
  const hasLabel = !!face.label;
  const number = line(shown, hasLabel ? 41 : 46, hasLabel ? 25 : 30, tone, 0.95);
  const heading = face.goingTo !== undefined && face.goingTo !== face.setpoint
    ? line(`→ ${face.goingTo}°`, 15, 10, AMBER, 0.9) : "";
  const labelTone = !face.on ? DIM : look.labelColor;
  const title = hasLabel
    ? line(face.label, 56, look.labelSize, labelTone, 0.9, look.labelBold) : "";
  const detailSize = Math.min(look.labelSize, 9.5);
  const detail = face.detail
    ? line(face.detail, 66, detailSize, face.locked ? RED : tone, 0.8, look.labelBold) : "";
  const padlock = face.locked ? lock(RED) : "";
  return asImage(ring + badge(look, iconTone) + padlock + heading + number + title + detail);
}

/** A message the owner has to read, centred and big enough to actually read. */
export function noticeKey(lines: string[], tone = INK): string {
  const longest = Math.max(...lines.map((text) => text.length));
  // "sin calentador" at 12.5 px runs off a 72 px key; one size fits all three languages.
  const size = longest > 11 ? 9.5 : lines.length > 1 ? 11.5 : 12.5;
  const step = size + 4;
  const top = 36 - ((lines.length - 1) * step) / 2 + size / 3;
  return asImage(lines.map((text, index) => line(text, top + index * step, size, tone, 0.85))
    .join(""));
}

/** Every icon as a picture, for the panel to show instead of a list of names. */
export function iconGallery(): { name: string; image: string }[] {
  return ICON_NAMES.map((name) => ({
    name,
    image: `data:image/svg+xml;charset=utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">` +
        `${iconArt(name, INK)}</svg>`)}`,
  }));
}
