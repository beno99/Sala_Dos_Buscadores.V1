# Card de conteúdo

Resumo de um artigo, vídeo ou verbete: tipo, Sala de origem, título, tema, nível, autoria e procedência.

## O consumidor fornece
Ícone e rótulo do tipo (`artigo` · `video` · `glossario`, com duração), Sala de origem, título, resumo opcional, tema, nível (1–3), autoria em texto (**nome** · credencial) e o Selo de proveniência.

## Regras
- Título em `title-2` editorial (Fraunces 25), nunca truncado; resumo corta em 3 linhas.
- Autoria é só texto: sem foto, sem página de perfil.
- Selo de proveniência obrigatório.
- `.sdb-stack` envolve o card quando há mais itens agrupados (série, mesmo autor): duas folhas aparecem atrás, como uma pilha.
- Botão de estante por cima do link do card (`.sdb-over`).

## Em linha (`.sdb-card--row`)
- Para listas do Portal ("Continue de onde parou", "Publicados recentemente", "Para ampliar o olhar"): miniatura à esquerda (placa com o arco ou `<img alt="">` 4:3 de `portal/public/imagens/conteudos/`), tipo e Sala, título (Fraunces 20, nunca truncado), progresso opcional e `.sdb-card__actions`.
- Em leitura em andamento: `.sdb-progress__track` + `.sdb-resume-cta` "Retomar leitura". O link do card é o título; "Retomar leitura" é só o rótulo visível da ação.
- O Selo de proveniência continua obrigatório.

## Modo destaque compacto (`.sala--conteudo`)
Para vitrines editoriais (Destaques). Conserva a anatomia própria de conteúdo: container de 24 px, imagem de 16 px, recuo de 8 px e painel creme sobre a imagem. Carregue `CardSala/card-sala.css` e depois `CardConteudo/card-conteudo.css`.

- `article.sala.sala--conteudo.sala--destaque` > `.sala__media` com `<img class="sala__image" alt="">` ou `.sala__placa.sdb-plate--{bordo|grafite|bege}` com o arco; `.sala__tools` com `.sala__count` (tipo e duração: "Artigo · 12 min") e `.sala__save`; `.sala__body` com `.sala__onde` (Sala em caixa alta), `h3.sala__title` > `a.sala__link` (o link cobre o card), resumo opcional e o Selo de proveniência.
- **Vertical:** ocupa a altura que a grade der (mínimo de 280 px de imagem); painel embaixo. `sala--amplo` aumenta o título para o card alto. Só ele leva resumo (3 linhas).
- **Horizontal (`sala--horizontal`):** imagem à esquerda com o chip do tipo e salvar; painel à direita, na altura toda, com cerca de 54% da largura; sem resumo. Cabe em ~290 px de altura. Num container abaixo de 860 px (ou numa tela abaixo de 620 px) vira vertical, com o painel embaixo.
- **Normal compacto (`sala--conteudo.sala--normal`):** imagem 4:3 em cima com o chip, e embaixo Sala, título e selo.
- Título nunca truncado. Selo de proveniência obrigatório também no destaque.

## Com imagem (`.sala--conteudo.sala--normal.sala--acervo`)
Para as grades do acervo (Biblioteca). Anatomia própria de conteúdo, com imagem e texto separados.
- Imagem 16:10 em cima (`<img class="sala__image" alt="">` ou a placa da marca com o arco). Sobre ela, à esquerda, `.sala__chips` com o tipo ("Artigo", "Fonte primária", "Vídeo") e, se houver, o progresso ("38%" ou "Lido"); à direita, salvar na estante.
- Leitura em andamento: `.sala__barra` (decorativa, `aria-hidden`) na base da imagem; o chip carrega a informação.
- Corpo: `.sala__onde` (Sala), `h3.sala__title` > `a.sala__link` (nunca truncado; o link cobre o card), `.sala__info` com o nível (`.sdb-level--plain`) e a duração (`.sala__dur`, relógio, "11 min" ou "24:10") e o Selo de proveniência. Sem resumo.
- Vídeo: o link vai ao YouTube em nova aba só com URL específica de vídeo; sem ela, à Sala do vídeo. Vídeo não tem progresso.
- Grade: 4 colunas, 2 abaixo de ~900 px de container, 1 abaixo de ~520 px (nunca 3); espaço `--space-5` entre colunas e `--space-7` entre linhas.

## Superfície (out 2026)
O card padrão de conteúdo fica em `card-warm` no Sólido claro (pelo seletor `.sdb-card:has(> .sdb-card__body > .sdb-content__top)`). Citação, vídeo, glossário e fontes continuam em creme.

## Comunidade · Fase A

Dentro de um achado, use `.sdb-community-linked.sdb-card` com `.sdb-card__body`, Sala, título como link e SeloProveniencia do próprio conteúdo. Sem prévia externa e sem estender o selo à publicação. Exemplo em CardPublicacao.

## Nova home
Em `.sdb-home__leituras`, superfície creme, cards de 300 px com altura mínima de
505 px e crescimento livre. O consumidor pode omitir SeloNivel respeitando a
preferência da conta. Salvar continua sobre o link, com `.sdb-over`.

## Tags e progresso compartilhados

Temas usam `.sdb-badge--topic` com ícone; nível e procedência reutilizam SeloNivel e SeloProveniencia. A barra de leitura, inclusive `.sala__barra` na imagem, segue o trilho escuro e o dourado luminoso compartilhados. Preserve os dados reais, o percentual textual e a distinção entre leitura de um conteúdo e estudo completo de uma Sala.

As classes `.sala--conteudo` preservam seus formatos editorial, compacto e acervo; a nova composição única de imagem e vidro do CardSala aplica-se aos cards de Sala.
