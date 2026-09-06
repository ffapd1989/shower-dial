*Language: **English** · [Português](README.pt-BR.md)*

# Shower Temp Dial — your water heater's temperature on one key

[![License](https://img.shields.io/badge/license-MIT-3B6FD4)](LICENSE)
![Platform](https://img.shields.io/badge/platform-Windows%2010%20%2F%2011-0078D4)
![Stream Deck](https://img.shields.io/badge/Stream%20Deck-6.5%2B-101014)
![Interface](https://img.shields.io/badge/interface-pt%20%C2%B7%20en%20%C2%B7%20es-2E7D74)
![Works with](https://img.shields.io/badge/works%20with-Rinnai%C2%AE%20Wi--Fi%20module-5A6B7C)
![Marketplace](https://img.shields.io/badge/Elgato%20Marketplace-not%20there%20yet-8a8a90)

**Works with Rinnai® gas water heaters fitted with the Wi-Fi module** — the one the
*Rinnai Brasil* phone app talks to. The plugin talks to that module **directly over your
network**; nothing goes through the internet. Not affiliated with Rinnai — see
[Trademarks](#trademarks).

One Stream Deck key shows the heater's **live setpoint**, lights up amber while water is
being heated, and:

- **Press once** → the heater goes to your everyday temperature (37 °C by default), turning
  on first if it was off.
- **Press twice, quickly** → the dial turns one notch up through a range you choose
  (37 → 38 → … → 42, then back to 37 by default).

If someone has the phone app open with the temperature lock, the key shows a red padlock
and does nothing — the phone stays in charge.

## Install

**From a release.** Download the `.streamDeckPlugin` file from
[Releases](https://github.com/ffapd1989/shower-dial/releases) and double-click it.

**From source.** Node.js 20+ and the Stream Deck app 6.5+.

```sh
cd streamdeck-plugin
npm install
npm run build
npx streamdeck link com.felipedrummond.shower-dial.sdPlugin
```

## Set up

Drag **Shower Temp Dial → Water Heater Temperature** onto a key. The panel looks for the module on your network by
itself — it takes a few seconds the first time — and shows the address it found. If the
module is on another network, or the search fails, click *type the address* and enter its
IP. Then choose the one-press temperature and the double-press range. That is all.

The panel is in Portuguese, English or Spanish, following the Stream Deck app; the 🌐
selector at the top overrides that.

## How it works

The module exposes a small unauthenticated HTTP API on the LAN — status, a button press
up or down, on/off, and a *priority* lock. There is no "set temperature" call: the plugin
presses the up or down button one notch at a time, waiting the ~3 s the heater needs to
apply each press. Walking five notches therefore takes about fifteen seconds; the key
shows where it is heading while it walks. The whole protocol, as reverse-engineered by the
community and confirmed here, is in [docs/PROTOCOL.md](docs/PROTOCOL.md).

Things that do not work, and why: [LIMITS.md](LIMITS.md).

## Privacy

No server, no account, no telemetry. The only thing stored is the module's IP, inside the
Stream Deck's own settings. Details: [PRIVACY.md](PRIVACY.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Security reports: [SECURITY.md](SECURITY.md).

## Trademarks

Rinnai® is a trademark of Rinnai Corporation. This project is an independent, unofficial
tool that interoperates with the Wi-Fi module's local interface. It is not made, endorsed
or supported by Rinnai, and "works with" describes compatibility only.

## Acknowledgements

The module's protocol was worked out by the Home Assistant community, and this plugin
stands on that work:

- [ale-jr/rinnai_br_homeassistant](https://github.com/ale-jr/rinnai_br_homeassistant) —
  Alexandre Jr., MIT. The endpoint list, the temperature index table and the priority
  lock semantics come from here.
- [mukaschultze/ha-aquecedor-rinnai](https://github.com/mukaschultze/ha-aquecedor-rinnai)
  — Samuel Schultze.
- The [Home Assistant Brasil forum thread](https://homeassistantbrasil.com.br/t/controlar-aquecedor-de-gas-boiler-rinnai-wifi/7914)
  that first documented the `bus` fields.

Runtime and build dependencies, with licences: [THIRD-PARTY.md](THIRD-PARTY.md).

## License

[MIT](LICENSE) © 2026 Felipe Drummond
