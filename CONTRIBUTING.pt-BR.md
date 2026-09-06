*Idioma: [English](CONTRIBUTING.md) · **Português***

# Contribuir

Issues e pull requests são bem-vindos. Mantenha-os pequenos e diga em que você testou.

## Desenvolver

Node.js 20+ e o app do Stream Deck 6.5+.

```sh
cd streamdeck-plugin
npm install
npm run check     # typecheck
npm test          # testes unitários (node:test, sem framework)
npm run build     # empacota na pasta .sdPlugin
npx streamdeck link com.felipedrummond.shower-dial.sdPlugin   # uma vez
npx streamdeck restart com.felipedrummond.shower-dial         # depois de cada build
```

Os logs caem em `com.felipedrummond.shower-dial.sdPlugin/logs/`.

## Onde cada coisa mora

| Arquivo | O que é |
|---|---|
| `src/heater.ts` | O protocolo do módulo: parsing, a caminhada de toques, descoberta. O único arquivo que conhece o formato de rede. |
| `src/keys.ts` | Como a tecla é desenhada. Funções puras, SVG na saída. |
| `src/i18n.ts` | As palavras que aparecem na tecla, em pt · en · es. |
| `src/plugin.ts` | A ação do Stream Deck: tratamento do toque, polling, mensagens do painel. |
| `…sdPlugin/ui/inspector.html` | O painel, com sua própria tabela pt · en · es. |
| `docs/PROTOCOL.md` | O protocolo em prosa. Atualize quando o `heater.ts` aprender algo novo. |

## Regras da casa

- **Código, comentários e commits em inglês.** Texto de interface nos três idiomas, nas
  tabelas — nunca uma string solta na lógica.
- **Nada pessoal no repositório.** Sem endereços, sem faixas de rede, sem nomes de
  máquina, nem em exemplo.
- **O SVG da tecla é rasterizado pelo QtSvg (SVG Tiny).** Uma `font-family` só, sem aspas;
  sem CSS, gradientes ou filtros. O navegador mascara esses bugs, então teste no Deck.
- **Ícones do plugin** são `imgs/plugin/plugin.png` (256 px) e `plugin@2x.png` (512 px),
  renderizados de `plugin.svg`. Qualquer renderizador de SVG serve; o Chrome headless
  funciona:
  `chrome --headless=new --screenshot=plugin.png --window-size=256,256 --default-background-color=00000000 file:///…/plugin.svg`.

## Código de conduta

[CODE_OF_CONDUCT.pt-BR.md](CODE_OF_CONDUCT.pt-BR.md).
