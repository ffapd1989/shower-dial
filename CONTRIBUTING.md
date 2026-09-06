*Language: **English** · [Português](CONTRIBUTING.pt-BR.md)*

# Contributing

Issues and pull requests are welcome. Please keep them small and say what you tested on.

## Developing

Node.js 20+ and the Stream Deck app 6.5+.

```sh
cd streamdeck-plugin
npm install
npm run check     # typecheck
npm test          # unit tests (node:test, no framework)
npm run build     # bundle into the .sdPlugin folder
npx streamdeck link com.felipedrummond.shower-dial.sdPlugin   # once
npx streamdeck restart com.felipedrummond.shower-dial         # after each build
```

Logs land in `com.felipedrummond.shower-dial.sdPlugin/logs/`.

## Where things live

| File | What it is |
|---|---|
| `src/heater.ts` | The module's protocol: parsing, the press walk, discovery. The only file that knows the wire format. |
| `src/keys.ts` | How the key is drawn. Pure functions, SVG out. |
| `src/i18n.ts` | The words that appear on the key, in pt · en · es. |
| `src/plugin.ts` | The Stream Deck action: press handling, polling, panel messages. |
| `…sdPlugin/ui/inspector.html` | The panel, with its own pt · en · es table. |
| `docs/PROTOCOL.md` | The protocol as prose. Update it when `heater.ts` learns something new. |

## Rules of the house

- **Code, comments and commits in English.** Interface text in the three languages, in
  the tables — never a bare string in the logic.
- **Nothing personal in the repository.** No addresses, no network ranges, no machine
  names, not even in examples.
- **Key SVG is rasterised by QtSvg (SVG Tiny).** One `font-family`, unquoted; no CSS,
  gradients or filters. The browser masks these bugs, so test on the Deck.
- **Plugin icons** are `imgs/plugin/plugin.png` (256 px) and `plugin@2x.png` (512 px),
  rendered from `plugin.svg`. Any SVG renderer will do; headless Chrome works:
  `chrome --headless=new --screenshot=plugin.png --window-size=256,256 --default-background-color=00000000 file:///…/plugin.svg`.

## Code of conduct

[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
