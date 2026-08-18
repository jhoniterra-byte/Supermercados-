# Um Traço

Um app (protótipo web/PWA, mobile-first) com uma ideia que, até onde
pesquisamos, não existe em nenhuma outra plataforma: **uma tela infinita e
coletiva onde cada pessoa, na vida inteira, só pode desenhar um único
traço** — uma linha contínua, sem levantar o dedo. Depois de usar o seu,
nunca mais é possível desenhar de novo naquela conta. Não existe apagar
nem recomeçar.

A obra cresce para sempre, um traço por pessoa, ad infinitum — um mural
onde cada risco tem peso porque é irrepetível.

## Por que isso é inédito

Telas colaborativas conhecidas (ex.: r/place) usam *cooldown*: você pode
sempre voltar a contribuir. Aqui a escassez é **vitalícia**, não temporal
— isso muda completamente o comportamento: cada traço vira uma decisão
única e definitiva, não um gesto repetível.

## O que já funciona neste protótipo

- Tela infinita com **pan** (arrastar) e **zoom** (pinça no celular, scroll
  no desktop).
- Fluxo "Deixar meu traço": arma o modo de desenho, captura uma única
  linha contínua (pointer down → move → up) e a grava permanentemente.
- Trava vitalícia por dispositivo via `localStorage` — depois de desenhar,
  o botão some e a ação fica bloqueada para sempre nesse navegador.
- Toque em qualquer traço existente mostra quando (tempo relativo) e
  simbolicamente de onde ele veio.
- Traços "seed" simulando outras pessoas ao redor do mundo, gerados de
  forma determinística para o protótipo.
- PWA instalável (manifest + service worker) — pode ser adicionado à tela
  inicial do celular e abrir em modo tela cheia, como um app nativo.

## Como rodar localmente

```bash
cd um-traco
python3 -m http.server 8000
```

Depois abra `http://localhost:8000/index.html` no navegador (idealmente
com as ferramentas de dispositivo móvel ativadas, ou direto no celular).

## Limitação atual e próximo passo real

Este protótipo é **local**: os traços de "outras pessoas" são simulados e
o seu próprio traço só existe no seu navegador. Para virar um app
mundialmente compartilhado de verdade, o próximo passo é um backend
mínimo (ex.: um endpoint serverless + banco de dados) que:

1. Recebe um traço novo (`POST /strokes`) e grava com timestamp e um
   identificador de dispositivo/conta.
2. Impede duas gravações do mesmo identificador (a regra "um traço por
   pessoa, para sempre").
3. Serve a lista de traços (`GET /strokes`) para todo mundo ver a mesma
   obra, em tempo real (ex.: websockets ou polling).

Com isso o app passa de "protótipo local" para a coisa real: uma única
obra viva, compartilhada pela humanidade inteira.
