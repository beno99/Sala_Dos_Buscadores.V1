# Barra superior

Topo da área de conteúdo do portal: título da página e saudação à esquerda; busca, aparência e conta à direita.

## Anatomia
- `header.sdb-topbar[data-sdb-topbar]`: fixa no topo da coluna de conteúdo (`position: sticky`), com a mesma margem lateral da página (`--sdb-gutter`, padrão 32 px).
- `.sdb-topbar__titles`: `h1.sdb-topbar__title` (nome da seção: "Portal", "Biblioteca", "Trilhas"…) e `.sdb-topbar__greeting` ("Boas-vindas de volta, {pseudônimo}." só no Portal).
- `.sdb-topbar__actions`: `button.sdb-topbar__search` (lupa, "Buscar no acervo" e `kbd` ⌘K; abre o Painel de busca), botão de aparência (claro ou escuro) e `button.sdb-topbar__account` com Avatar (abre o menu da conta).

## Regras
- Em repouso, sem fundo. Ao rolar, o runtime põe `.is-scrolled` e a barra entra na camada flutuante (`float-*`: translúcida com desfoque também nos temas sólidos; opaca com `prefers-reduced-transparency`).
- `data-shortcut-k` na lupa: ⌘K / Ctrl K aciona o botão. Declare `aria-keyshortcuts`.
- A página chama-se "Portal", nunca "Home" ou "Início". Saudação sem exclamação.
- Sem sininho por enquanto: `TODO(notificacoes)` no lugar.
- Abaixo de 900 px: título menor, sem saudação nem trilha, busca só com a lupa (rótulo em `aria-label`).

## Com trilha (páginas de detalhe)
Nas páginas de detalhe dentro da moldura (ex.: a página da Sala), a segunda linha mostra a trilha no lugar da saudação. Ela **substitui a cápsula de `Breadcrumbs`** nessas páginas: não use as duas.
- `nav.sdb-topbar__trail[aria-label="Trilha"] > ol > li`: os itens anteriores são links ("Salas" → `/salas`); o último é `span[aria-current="page"]` e corta com reticências se faltar espaço.
- 14 px, secundária; o item atual em `label`; separador "/" terciário, desenhado pelo CSS.
- O título da barra continua sendo a seção ("Salas") e é um `p`: o `h1` é o título da página.
- Trilha e saudação se excluem: uma página tem uma ou outra.
- Abaixo de 900 px a trilha some. A página põe no topo do conteúdo um botão secundário pequeno "‹ Salas" (`.sdb-roomhead__back` no [Cabeçalho da Sala](../CabecalhoSala/README.md)), que só aparece nessa largura.

## Paleta areia (out 2026)
Em repouso, filete de 1 px em `topbar-edge` embaixo; a busca fica em `card-warm` com a tecla ⌘K em `kbd-warm`, e o botão de aparência também em `card-warm`. Ao rolar, a camada flutuante de sempre.
