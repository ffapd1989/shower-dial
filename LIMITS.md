*Language: **English** · [Português](LIMITS.pt-BR.md)*

# Limits, and things that will bite you

Everything here is known and reproduced. Written to save you the debugging.

## What does not work, and why

**It is slow by design.** Each notch takes about 3 s, because that is how long the heater
takes to apply a press and it drops anything faster. One press from 42 °C to 37 °C is five
notches: fifteen seconds. The key shows the destination while it walks.

**The phone app wins.** While the app is open and holding the priority lock, the key shows
a red padlock and does nothing. Close the app, or wait for it to let go.

**Only one heater.** The plugin finds and talks to a single module. Two heaters on one
network are not supported; the manual address field lets you pick which one.

**Only the temperatures the heater has.** 35–46 °C by the degree, then 48, 50, 55, 60.
Nothing in between is offered because nothing in between exists.

**Tested on one model.** A single heater with the Wi-Fi module, firmware dated 26 Aug 2024.
Other firmware versions may lay the fields out differently; the parser rejects lines it
does not recognise rather than guessing.

**Windows only, in practice.** The manifest lists macOS and nothing in the code is
platform-specific, but it has never run there.

**No Marketplace build yet.** Installing needs Node.js and a terminal (see the README).
Packaging a `.streamDeckPlugin` for double-click install is the next step.

## Things that cost time to discover

**A network scan takes a while.** When the `WIFI-RINNAI` name does not resolve, the
plugin probes all 254 addresses of each local /24 — a few seconds on a normal home
network, longer if you have several interfaces. The panel shows the progress.

**The module's address can change.** It takes whatever DHCP gives it. If the key starts
saying *no heater*, press *Search again* in the panel, or give the module a fixed address
in your router.

**HTTP clients that cache.** A repeated GET served from a cache never reaches the module
and looks exactly like a dropped press. Node's `fetch` with `cache: "no-store"` is what the
plugin uses; if you script against the module yourself, watch for this.
