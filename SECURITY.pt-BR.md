*Idioma: [English](SECURITY.md) · **Português***

# Segurança

## Como relatar

Relate vulnerabilidades em privado pelo
[relato privado de vulnerabilidade do GitHub](https://github.com/ffapd1989/shower-dial/security/advisories/new),
não numa issue pública. Você terá resposta em até uma semana.

## O que saber

**O módulo em si não tem autenticação.** Qualquer um na sua rede pode ler o estado do
aquecedor e apertar seus botões por HTTP; é assim que o app do celular funciona também, e
este plugin não pode mudar isso. Mantenha o módulo numa rede em que você confie.

**O plugin nunca rouba a trava.** Ele respeita uma trava de prioridade segurada por outro
dispositivo e só toma a trava em nome da máquina em que roda.

**Nada fica exposto.** O plugin não abre porta de escuta nem aceita conexões de entrada;
só faz requisições HTTP de saída para o IP do módulo na rede local.
