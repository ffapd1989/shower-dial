*Idioma: [English](PROTOCOL.md) · **Português***

# O protocolo local do módulo Wi-Fi

Tudo o que o plugin sabe sobre o módulo, para ninguém ter de redescobrir. Descoberto pela
comunidade do Home Assistant (ver agradecimentos no README) e confirmado contra um módulo
real, firmware datado de 26 ago 2024.

## Como encontrá-lo

O módulo pega endereço por DHCP e se anuncia com o hostname **`WIFI-RINNAI`**. O MAC
começa com um prefixo da Espressif. Quando o nome não resolve, o plugin pede `/tela_` a
cada endereço da /24 local e fica com o que responde como um aquecedor.

## Requisições

`GET http://<ip>/<caminho>` puro. Sem autenticação, sem TLS, respostas ao estilo HTTP/1.0.
Uma requisição leva cerca de 0,6 s.

| Caminho | Efeito | Resposta |
|---|---|---|
| `tela_` | Lê a "tela": os campos que o app do celular mostra | linha de tela |
| `bus` | Lê tudo, inclusive temperatura de entrada/saída e vazão | linha de bus |
| `inc` | Um toque no botão de **subir** | linha de tela |
| `dec` | Um toque no botão de **descer** | linha de tela |
| `lig` | Liga ou desliga o aquecedor | linha de tela |
| `ip:<IP>:pri` | Toma a trava de prioridade para `<IP>` | HTTP malformado, mas aplica |
| `ip:null:pri` | Solta a trava | HTTP malformado, mas aplica |
| `consumo`, `historico`, `erros` | Consumo semanal, histórico, log de erros | não usados aqui |

## A linha de tela (`tela_`, e o que `inc`/`dec`/`lig` devolvem)

Separada por vírgulas. Exemplo: `41,0,0,175,9600,0,null:pri,5,312583,26 Ago 2024,14,0,0,255,{ 0 - 0 }`

| Campo | Significado |
|---|---|
| 0 | Energia: `11` = desligado, `41`/`42` = ligado |
| 2 | `1` enquanto há água sendo aquecida (queimador aceso) |
| 6 | Prioridade: `<ip>:pri`, ou `null:pri` quando ninguém a tem |
| 7 | **Índice** do setpoint (tabela abaixo) |
| 9 | Data do firmware |

## A linha de bus (`bus`)

Mesmo formato, mais campos. Os que importam:

| Campo | Significado |
|---|---|
| 10 | Temperatura da água de entrada × 100 |
| 11 | Temperatura da água de saída × 100 |
| 12 | Vazão × 100, l/min |
| 15 | Setpoint **real** do aquecedor × 100 |
| 16 | IP do próprio módulo |
| 17 | Prioridade, como acima |
| 18 | Índice do setpoint, como acima |
| 37 | RSSI do Wi-Fi, dBm |

## Índice do setpoint → °C

O aquecedor não anda de grau em grau no topo da escala:

| Índice | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 16 | 18 | 19 | 20 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| °C | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 48 | 50 | 55 | 60 |

Os índices 15 e 17 não existem.

## Tempos, e as duas armadilhas

**Um toque leva cerca de 3 s para valer.** O `inc` responde na hora com o índice novo na
linha de tela, mas o setpoint real do aquecedor (`bus`, campo 15) só acompanha ~3 s depois,
e um segundo toque dentro dessa janela é **descartado em silêncio**. Por isso o plugin
espera 3 s entre toques. Não há caminho mais rápido: é o aquecedor, não a rede.

**Prioridade.** Com água correndo, só o IP que segura a trava de prioridade consegue mudar
a temperatura; os toques dos demais são ignorados. O app do celular toma a trava enquanto
está aberto e mostra um cadeado vermelho para todo mundo. O plugin faz o mesmo que o app:
toma a trava em seu próprio nome antes de uma caminhada, solta depois, e nunca passa por
cima de uma trava de outro.

**Cache de HTTP.** Alguns clientes HTTP fazem cache de um GET repetido à mesma URL. Um
segundo `inc` servido do cache nunca chega ao módulo e devolve a primeira resposta, o que
se parece exatamente com um toque descartado. Desligue o cache nessas requisições.
