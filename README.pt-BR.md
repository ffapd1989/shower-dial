*Idioma: [English](README.md) · **Português***

# Shower Temp Dial — a temperatura do aquecedor numa tecla

[![Licença](https://img.shields.io/badge/license-MIT-3B6FD4)](LICENSE)
![Plataforma](https://img.shields.io/badge/platform-Windows%2010%20%2F%2011-0078D4)
![Stream Deck](https://img.shields.io/badge/Stream%20Deck-6.5%2B-101014)
![Interface](https://img.shields.io/badge/interface-pt%20%C2%B7%20en%20%C2%B7%20es-2E7D74)
![Funciona com](https://img.shields.io/badge/works%20with-Rinnai%C2%AE%20Wi--Fi%20module-5A6B7C)
![Marketplace](https://img.shields.io/badge/Elgato%20Marketplace-ainda%20n%C3%A3o-8a8a90)

**Funciona com aquecedores de passagem a gás Rinnai® que tenham o módulo Wi-Fi** — o mesmo
com que o app *Rinnai Brasil* conversa. O plugin fala com esse módulo **diretamente pela sua
rede**; nada passa pela internet. Sem vínculo com a Rinnai — ver
[Marcas](#marcas).

Uma tecla do Stream Deck mostra a **temperatura setada ao vivo**, acende em âmbar enquanto
há água sendo aquecida, e:

- **Um toque** → o aquecedor vai para a sua temperatura de todo dia (37 °C por padrão),
  ligando antes se estava desligado.
- **Dois toques rápidos** → o dial gira um ponto para cima dentro de uma faixa que você
  escolhe (37 → 38 → … → 42, e volta para 37, por padrão).

Se alguém estiver com o app do celular aberto segurando a prioridade, a tecla mostra um
cadeado vermelho e não faz nada — o celular continua no comando.

## Instalar

**De uma release.** Baixe o arquivo `.streamDeckPlugin` em
[Releases](https://github.com/ffapd1989/shower-dial/releases) e dê dois cliques.

**Do código.** Node.js 20+ e o app do Stream Deck 6.5+.

```sh
cd streamdeck-plugin
npm install
npm run build
npx streamdeck link com.felipedrummond.shower-dial.sdPlugin
```

## Configurar

Arraste **Shower Temp Dial → Water Heater Temperature** para uma tecla. O painel procura o módulo na sua rede
sozinho — leva alguns segundos na primeira vez — e mostra o endereço encontrado. Se o
módulo estiver em outra rede, ou a busca falhar, clique em *digite o endereço* e informe o
IP. Depois escolha a temperatura do toque único e a faixa do toque duplo. Só isso.

O painel está em português, inglês ou espanhol, seguindo o app do Stream Deck; o seletor
🌐 no topo sobrepõe essa escolha.

## Como funciona

O módulo expõe uma pequena API HTTP sem autenticação na rede local — estado, um toque no
botão de subir ou descer, liga/desliga e uma trava de *prioridade*. Não existe chamada
"setar temperatura": o plugin aperta o botão de subir ou descer um ponto por vez,
esperando os ~3 s que o aquecedor leva para aplicar cada toque. Andar cinco pontos leva,
portanto, uns quinze segundos; a tecla mostra para onde está indo enquanto anda. O
protocolo inteiro, descoberto pela comunidade e confirmado aqui, está em
[docs/PROTOCOL.pt-BR.md](docs/PROTOCOL.pt-BR.md).

O que não funciona, e por quê: [LIMITS.pt-BR.md](LIMITS.pt-BR.md).

## Privacidade

Sem servidor, sem conta, sem telemetria. A única coisa guardada é o IP do módulo, dentro
das configurações do próprio Stream Deck. Detalhes: [PRIVACY.pt-BR.md](PRIVACY.pt-BR.md).

## Contribuir

Ver [CONTRIBUTING.pt-BR.md](CONTRIBUTING.pt-BR.md). Relatos de segurança:
[SECURITY.pt-BR.md](SECURITY.pt-BR.md).

## Marcas

Rinnai® é marca registrada da Rinnai Corporation. Este projeto é uma ferramenta
independente e não oficial que interopera com a interface local do módulo Wi-Fi. Não é
feito, endossado nem suportado pela Rinnai, e "funciona com" descreve apenas
compatibilidade.

## Agradecimentos

O protocolo do módulo foi descoberto pela comunidade do Home Assistant, e este plugin se
apoia nesse trabalho:

- [ale-jr/rinnai_br_homeassistant](https://github.com/ale-jr/rinnai_br_homeassistant) —
  Alexandre Jr., MIT. A lista de endpoints, a tabela de índices de temperatura e a
  semântica da trava de prioridade vêm daqui.
- [mukaschultze/ha-aquecedor-rinnai](https://github.com/mukaschultze/ha-aquecedor-rinnai)
  — Samuel Schultze.
- O [tópico do fórum Home Assistant Brasil](https://homeassistantbrasil.com.br/t/controlar-aquecedor-de-gas-boiler-rinnai-wifi/7914)
  que documentou primeiro os campos do `bus`.

Dependências de execução e de build, com licenças: [THIRD-PARTY.md](THIRD-PARTY.md).

## Licença

[MIT](LICENSE) © 2026 Felipe Drummond
