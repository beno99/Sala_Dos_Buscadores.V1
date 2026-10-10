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
- Abaixo de 900 px: título menor, sem saudação, busca só com a lupa (rótulo em `aria-label`).
