*Idioma: [English](PRIVACY.md) · **Português***

# Privacidade

Versão curta: este plugin não tem servidor, não coleta nada e só fala com o módulo Wi-Fi
do aquecedor na sua própria rede.

## O que é guardado, e onde

Uma coisa: o endereço IP do módulo, mais a informação de se você o digitou ou o plugin o
encontrou, e o seu idioma de interface. Tudo isso vive no armazenamento de configurações
do próprio app do Stream Deck para este plugin. Por tecla, as temperaturas que você
escolheu e o rótulo que digitou são guardados do mesmo jeito. Nada é gravado em outro
lugar.

## O que sai da sua máquina

Nada sai da sua rede local. O plugin envia requisições HTTP ao IP do módulo e lê as
respostas. Quando precisa procurar o módulo, envia uma pequena requisição a cada endereço
da sua sub-rede local, uma vez.

Não há telemetria, analytics, relatório de falhas nem verificação de atualização. Nenhum
autor deste plugin vê nada sobre o seu aquecedor, a sua rede ou o seu uso.

## Logs

O app do Stream Deck guarda os arquivos de log do plugin dentro da pasta do plugin
(`logs/`). Eles podem conter o IP do módulo. Ficam na sua máquina; apague quando quiser.
