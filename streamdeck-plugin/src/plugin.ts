// SPDX-FileCopyrightText: 2026 Felipe Drummond
// SPDX-License-Identifier: MIT
// Shower Dial — your gas water heater's temperature on one Stream Deck key.
//
// One press sets the everyday temperature; a quick double press turns the dial
// one notch, cycling through a range. One shared Heater object finds the Wi-Fi
// module, polls it while the key is on screen and presses the module's buttons
// on the key's behalf. Keys are SVG generated at runtime (keys.ts); the wire
// protocol lives in heater.ts.
import streamDeck, {
  action,
  SingletonAction,
  type DidReceiveSettingsEvent,
  type KeyUpEvent,
  type SendToPluginEvent,
  type WillAppearEvent,
  type WillDisappearEvent,
} from "@elgato/streamdeck";
import {
  discover, nextInCycle, readState, setTarget, TEMPERATURES, type HeaterState,
} from "./heater.ts";
import { keyText, pickLocale, type KeyText } from "./i18n.ts";
import { dialKey, noticeKey } from "./keys.ts";

const POLL_MS = 2000;
/** Two presses closer than this are one double press. */
const DOUBLE_MS = 400;
const RED = "#e8705c";

type GlobalSettings = {
  uiLang?: string;
  /** The module's IP once found or typed. */
  host?: string;
  /** True when the owner typed the address instead of letting us look. */
  manual?: boolean;
};

let global: GlobalSettings = {};

/** The panel owns `uiLang`, the plugin owns `host`/`manual`, and both write the
 *  same record. Writing a stale copy wipes the other side's field — the panel
 *  losing its language after a rescan, the plugin losing the heater after a
 *  language change — so every write starts from what is stored right now. */
async function remember(patch: Partial<GlobalSettings>): Promise<void> {
  const stored = ((await streamDeck.settings.getGlobalSettings()) ?? {}) as GlobalSettings;
  global = { ...stored, ...global, ...patch };
  await streamDeck.settings.setGlobalSettings(global);
}

function currentText(): KeyText {
  return keyText(pickLocale(global.uiLang, streamDeck.info?.application?.language,
                            Intl.DateTimeFormat().resolvedOptions().locale));
}

/** Everything the keys share: one module, one poll loop, one walk at a time. */
class Heater {
  state: HeaterState | undefined;
  scanning = false;
  progress = 0;
  /** Where the current walk is heading; undefined when idle. */
  goingTo: number | undefined;
  private timer: NodeJS.Timeout | null = null;
  private listeners = new Set<() => void>();

  onChange(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) listener();
    void this.tellInspector();
  }

  tellInspector(): Promise<void> {
    return streamDeck.ui.sendToPropertyInspector({
      evt: "heater",
      host: global.host ?? "",
      manual: !!global.manual,
      scanning: this.scanning,
      progress: this.progress,
      reachable: this.state !== undefined,
      temperatures: TEMPERATURES,
    });
  }

  async find(): Promise<void> {
    if (this.scanning) return;
    this.scanning = true;
    this.progress = 0;
    this.notify();
    const host = await discover((done, total) => {
      const percent = Math.round((done / total) * 100);
      if (percent !== this.progress) {
        this.progress = percent;
        void this.tellInspector();
      }
    });
    this.scanning = false;
    if (host) {
      await remember({ host, manual: false });
      streamDeck.logger.info(`heater found at ${host}`);
    } else {
      streamDeck.logger.warn("no heater answered on any local subnet");
    }
    await this.poll();
    this.notify();
  }

  async useHost(host: string): Promise<void> {
    await remember({ host, manual: true });
    this.state = undefined;
    await this.poll();
    this.notify();
  }

  async poll(): Promise<void> {
    if (this.goingTo !== undefined) return;
    const before = JSON.stringify(this.state);
    this.state = global.host ? await readState(global.host) : undefined;
    if (JSON.stringify(this.state) !== before) this.notify();
    else void this.tellInspector();
  }

  startPolling(): void {
    if (this.timer) return;
    this.timer = setInterval(() => void this.poll(), POLL_MS);
    void this.poll();
  }

  stopPolling(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  /** Points the walk at `target`. If one is already under way it bends towards
   *  the new target instead of finishing the old one. */
  async goTo(target: number): Promise<"done" | "locked" | "unreachable" | undefined> {
    if (!global.host) return "unreachable";
    if (this.goingTo !== undefined) {
      this.goingTo = target;
      this.notify();
      return undefined;
    }
    this.goingTo = target;
    this.notify();
    try {
      return await setTarget(global.host, global.host, () => this.goingTo ?? target, (state) => {
        this.state = state;
        this.notify();
      });
    } finally {
      this.goingTo = undefined;
      await this.poll();
      this.notify();
    }
  }
}

const heater = new Heater();

type DialSettings = {
  /** One press goes here. */
  home?: number;
  /** A double press walks one notch inside [low, high], wrapping round. */
  low?: number;
  high?: number;
  label?: string;
};

const DEFAULTS = { home: 37, low: 37, high: 42 };

function valid(celsius: unknown, fallback: number): number {
  const value = Number(celsius);
  return TEMPERATURES.includes(value) ? value : fallback;
}

@action({ UUID: "com.felipedrummond.shower-dial.dial" })
class DialKey extends SingletonAction<DialSettings> {
  private release: (() => void) | null = null;
  /** Settings never come back synchronously from the SDK, so a repaint driven
   *  by the heater needs its own copy per visible key. */
  private known = new Map<string, { action: any; settings: DialSettings }>();
  /** A short-lived word on one key: "phone in control", "no heater", "ready". */
  private flash = new Map<string, string>();
  /** A first press waiting to learn whether a second one follows. */
  private pending = new Map<string, NodeJS.Timeout>();

  private repaintAll(): void {
    const text = currentText();
    for (const entry of this.known.values()) this.paint(entry.action, entry.settings, text);
  }

  private paint(target: any, settings: DialSettings, text: KeyText): void {
    if (!target.isKey?.()) return;
    if (!global.host) {
      return void target.setImage(heater.scanning ? noticeKey([text.searching])
        : noticeKey([text.noHeater], RED));
    }
    const state = heater.state;
    if (!state) return void target.setImage(noticeKey([text.noHeater], RED));

    const locked = state.priorityIp !== null && heater.goingTo === undefined;
    const detail = this.flash.get(target.id) ?? (locked ? text.locked
      : !state.on ? text.off : state.heating ? text.heating : "");
    target.setImage(dialKey({
      setpoint: state.target,
      goingTo: heater.goingTo,
      on: state.on,
      heating: state.heating,
      locked,
      label: settings.label ?? "",
      detail,
    }));
  }

  private say(target: any, settings: DialSettings, word: string): void {
    this.flash.set(target.id, word);
    this.paint(target, settings, currentText());
    setTimeout(() => {
      this.flash.delete(target.id);
      this.paint(target, settings, currentText());
    }, 1500);
  }

  override async onWillAppear(event: WillAppearEvent<DialSettings>): Promise<void> {
    this.known.set(event.action.id, { action: event.action, settings: event.payload.settings });
    if (!this.release) this.release = heater.onChange(() => this.repaintAll());
    heater.startPolling();
    if (!global.host && !global.manual) void heater.find();
    this.paint(event.action, event.payload.settings, currentText());
  }

  override onWillDisappear(event: WillDisappearEvent<DialSettings>): void {
    this.known.delete(event.action.id);
    if (this.known.size) return;
    heater.stopPolling();
    this.release?.();
    this.release = null;
  }

  override onDidReceiveSettings(event: DidReceiveSettingsEvent<DialSettings>): void {
    this.known.set(event.action.id, { action: event.action, settings: event.payload.settings });
    this.paint(event.action, event.payload.settings, currentText());
  }

  /** One press: home. Two quick presses: one notch round the cycle. The first
   *  press waits DOUBLE_MS before it counts, which is the price of telling
   *  them apart. */
  override onKeyUp(event: KeyUpEvent<DialSettings>): void {
    const id = event.action.id;
    const settings = event.payload.settings;
    const waiting = this.pending.get(id);
    if (waiting) {
      clearTimeout(waiting);
      this.pending.delete(id);
      const low = valid(settings.low, DEFAULTS.low);
      const high = Math.max(low, valid(settings.high, DEFAULTS.high));
      const from = heater.goingTo ?? heater.state?.target;
      void this.walk(event.action, settings, nextInCycle(from, low, high));
      return;
    }
    this.pending.set(id, setTimeout(() => {
      this.pending.delete(id);
      void this.walk(event.action, settings, valid(settings.home, DEFAULTS.home));
    }, DOUBLE_MS));
  }

  private async walk(target: any, settings: DialSettings, celsius: number): Promise<void> {
    const text = currentText();
    const outcome = await heater.goTo(celsius);
    if (outcome === "locked") this.say(target, settings, text.locked);
    else if (outcome === "unreachable") this.say(target, settings, text.noHeater);
    else if (outcome === "done") this.say(target, settings, text.ready);
  }

  /** The panel asks for status, a rescan, or hands over a typed address. */
  override onSendToPlugin(event: SendToPluginEvent<any, DialSettings>): void {
    const payload = (event.payload ?? {}) as { ask?: string; host?: string };
    if (payload.ask === "status") void heater.tellInspector();
    else if (payload.ask === "rescan") void heater.find();
    else if (payload.ask === "setHost" && payload.host) void heater.useHost(payload.host.trim());
  }
}

streamDeck.settings.onDidReceiveGlobalSettings((event) => {
  const incoming = (event.settings ?? {}) as GlobalSettings;
  const merged = { ...global, ...incoming };
  // A panel that opened before the heater was found saves without `host`;
  // keep ours and put it back in the store rather than forgetting the heater.
  const lostHost = global.host && incoming.host !== global.host;
  global = merged;
  if (lostHost) void streamDeck.settings.setGlobalSettings(global);
  heater.startPolling();
});

streamDeck.actions.registerAction(new DialKey());
await streamDeck.connect();
global = ((await streamDeck.settings.getGlobalSettings()) ?? {}) as GlobalSettings;
