*Idioma: [English](LIMITS.md) · **Português***

# Limites, e coisas que vão te morder

Tudo aqui é conhecido e reproduzido. Escrito para te poupar o debug.

## O que não funciona, e por quê

**É lento de propósito.** Cada ponto leva cerca de 3 s, porque é o tempo que o aquecedor
leva para aplicar um toque e ele descarta o que vier mais rápido. Um toque de 42 °C para
37 °C são cinco pontos: quinze segundos. A tecla mostra o destino enquanto anda.

**O app do celular vence.** Enquanto o app está aberto segurando a trava de prioridade, a
tecla mostra um cadeado vermelho e não faz nada. Feche o app, ou espere ele soltar.

**Um aquecedor só.** O plugin encontra e fala com um único módulo. Dois aquecedores na
mesma rede não são suportados; o campo de endereço manual permite escolher qual.

**Só as temperaturas que o aquecedor tem.** 35–46 °C de grau em grau, depois 48, 50, 55,
60. Nada entre elas é oferecido porque nada entre elas existe.

**Testado em um modelo.** Um único aquecedor com o módulo Wi-Fi, firmware de 26 ago 2024.
Outras versões de firmware podem dispor os campos de outro jeito; o parser rejeita linhas
que não reconhece em vez de chutar.

**Windows só, na prática.** O manifesto lista macOS e nada no código é específico de
plataforma, mas nunca rodou lá.

**Ainda sem build para o Marketplace.** Instalar exige Node.js e terminal (ver README).
Empacotar um `.streamDeckPlugin` para instalar com dois cliques é o próximo passo.

## Coisas que custam tempo para descobrir

**A varredura de rede demora.** Quando o nome `WIFI-RINNAI` não resolve, o plugin sonda
os 254 endereços de cada /24 local — alguns segundos numa rede doméstica normal, mais se
você tiver várias interfaces. O painel mostra o progresso.

**O endereço do módulo pode mudar.** Ele pega o que o DHCP der. Se a tecla começar a dizer
*sem aquecedor*, aperte *Procurar de novo* no painel, ou fixe o endereço do módulo no seu
roteador.

**Clientes HTTP que fazem cache.** Um GET repetido servido do cache nunca chega ao módulo
e parece exatamente um toque descartado. O plugin usa o `fetch` do Node com
`cache: "no-store"`; se você for scriptar contra o módulo por conta própria, cuidado com
isso.
