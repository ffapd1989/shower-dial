// SPDX-FileCopyrightText: 2026 Felipe Drummond
// SPDX-License-Identifier: MIT
// The water heater's Wi-Fi module speaks plain HTTP on the LAN, no auth. The
// protocol was reverse-engineered by the community and is written down in
// docs/PROTOCOL.md; this file is the only place that knows it.

import { lookup } from "node:dns/promises";
import { networkInterfaces } from "node:os";

/** The module announces itself on DHCP under this name. */
export const DEFAULT_HOSTNAME = "WIFI-RINNAI";

/** The heater's own scale: index on the wire, degrees on the dial. */
const INDEX_TO_CELSIUS: Record<number, number> = {
  3: 35, 4: 36, 5: 37, 6: 38, 7: 39, 8: 40, 9: 41, 10: 42, 11: 43, 12: 44,
  13: 45, 14: 46, 16: 48, 18: 50, 19: 55, 20: 60,
};
export const TEMPERATURES: number[] = Object.values(INDEX_TO_CELSIUS);

export function celsiusOf(index: number): number | undefined {
  return INDEX_TO_CELSIUS[index];
}

/** The next stop on the dial after `current`, walking the heater's own scale
 *  from `low` to `high` and wrapping back to `low`. Anything outside the range,
 *  or unknown, lands on `low`. */
export function nextInCycle(current: number | undefined, low: number, high: number): number {
  const stops = TEMPERATURES.filter((celsius) => celsius >= low && celsius <= high);
  if (!stops.length) return low;
  const at = current === undefined ? -1 : stops.indexOf(current);
  return stops[(at + 1) % stops.length];
}

export type HeaterState = {
  on: boolean;
  heating: boolean;
  /** Target temperature as the module reports it, in °C. */
  target: number | undefined;
  /** IP that holds the priority lock; null when nobody does. */
  priorityIp: string | null;
};

/** `tela_` is a comma-separated line; these are the columns that matter. The
 *  priority column is a bare `null` after the module reboots and `<ip>:pri` or
 *  `null:pri` once anybody has taken or released the lock. */
export function parseTela(line: string): HeaterState | undefined {
  const fields = line.trim().split(",");
  if (fields.length < 8) return undefined;
  const priority = fields[6].replace(/:pri$/, "");
  if (priority !== "null" && !/^\d+(\.\d+){3}$/.test(priority)) return undefined;
  return {
    on: fields[0] !== "11",
    heating: fields[2] === "1",
    target: celsiusOf(Number(fields[7])),
    priorityIp: priority === "null" ? null : priority,
  };
}

/** Milliseconds the heater needs to apply one button press. A second press
 *  inside that window is silently dropped, so every step waits it out. */
export const STEP_MS = 3000;
const REQUEST_MS = 4000;
const MAX_STEPS = 25;

async function get(host: string, path: string): Promise<string> {
  const response = await fetch(`http://${host}/${path}`, {
    signal: AbortSignal.timeout(REQUEST_MS),
    cache: "no-store",
  });
  return response.text();
}

/** The priority endpoints answer with a malformed HTTP response; the effect
 *  lands anyway, so the error is expected and swallowed. */
async function fireAndForget(host: string, path: string): Promise<void> {
  try {
    await get(host, path);
  } catch {
    // expected
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function readState(host: string): Promise<HeaterState | undefined> {
  try {
    return parseTela(await get(host, "tela_"));
  } catch {
    return undefined;
  }
}

/** The address this machine uses on the module's subnet: what the module will
 *  see as the caller, and therefore what the priority lock must name. */
export function localIpFor(moduleIp: string): string | undefined {
  const [a, b, c] = moduleIp.split(".");
  const prefix = `${a}.${b}.${c}.`;
  for (const addresses of Object.values(networkInterfaces())) {
    for (const address of addresses ?? []) {
      if (address.family === "IPv4" && address.address.startsWith(prefix)) return address.address;
    }
  }
  return undefined;
}

export type StepOutcome = "done" | "locked" | "unreachable";

/** Walks the setpoint to `wanted()`, one press at a time, turning the heater on
 *  first if needed. `wanted` is asked again before every press, so the owner
 *  can change their mind mid-walk and the walk simply bends. Holds the priority
 *  lock for the duration so the presses also count while someone is in the
 *  shower; a lock held by somebody else is respected, never stolen. */
export async function setTarget(
  host: string, moduleIp: string, wanted: () => number,
  onProgress?: (state: HeaterState) => void,
): Promise<StepOutcome> {
  let state = await readState(host);
  if (!state) return "unreachable";
  const me = localIpFor(moduleIp);
  if (state.priorityIp && state.priorityIp !== me) return "locked";

  if (me) await fireAndForget(host, `ip:${me}:pri`);
  try {
    if (!state.on) {
      state = parseTela(await get(host, "lig")) ?? state;
      onProgress?.(state);
      await sleep(STEP_MS);
      state = (await readState(host)) ?? state;
    }
    for (let step = 0; step < MAX_STEPS && state.target !== wanted(); step += 1) {
      if (state.target === undefined) return "unreachable";
      const press = state.target < wanted() ? "inc" : "dec";
      const next = parseTela(await get(host, press));
      if (!next) return "unreachable";
      if (next.priorityIp && next.priorityIp !== me) return "locked";
      state = next;
      onProgress?.(state);
      await sleep(STEP_MS);
    }
    return "done";
  } catch {
    return "unreachable";
  } finally {
    await fireAndForget(host, "ip:null:pri");
  }
}

// ———————————————————————————— discovery ————————————————————————————

/** Every /24 this machine sits on, minus link-local and virtual-switch noise. */
function candidateSubnets(): string[] {
  const seen = new Set<string>();
  for (const addresses of Object.values(networkInterfaces())) {
    for (const address of addresses ?? []) {
      if (address.family !== "IPv4" || address.internal) continue;
      if (address.address.startsWith("169.254.")) continue;
      const [a, b, c] = address.address.split(".");
      seen.add(`${a}.${b}.${c}.`);
    }
  }
  return [...seen];
}

async function answersLikeAHeater(ip: string): Promise<boolean> {
  try {
    const response = await fetch(`http://${ip}/tela_`, { signal: AbortSignal.timeout(1500) });
    return parseTela(await response.text()) !== undefined;
  } catch {
    return false;
  }
}

/** Finds the module: by its DHCP name first, then by asking every address on
 *  the local subnets whether it talks like a heater. Returns the IP. */
export async function discover(onProgress?: (done: number, total: number) => void):
    Promise<string | undefined> {
  try {
    const { address } = await lookup(DEFAULT_HOSTNAME, { family: 4 });
    if (await answersLikeAHeater(address)) return address;
  } catch {
    // no such name on this network; fall through to the scan
  }
  const hosts = candidateSubnets().flatMap((prefix) =>
    Array.from({ length: 254 }, (_, index) => `${prefix}${index + 1}`));
  let done = 0;
  let found: string | undefined;
  const queue = [...hosts];
  const worker = async () => {
    while (queue.length && !found) {
      const ip = queue.shift()!;
      if (await answersLikeAHeater(ip)) found = ip;
      done += 1;
      onProgress?.(done, hosts.length);
    }
  };
  await Promise.all(Array.from({ length: 64 }, worker));
  return found;
}
