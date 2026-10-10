# Banner rotativo

Card largo no topo do Portal que alterna o slide de marca, episódios do canal e anúncios.

## Anatomia
- `section.sdb-banner[data-sdb-banner]` com `aria-roledescription="carrossel"`, `aria-label` e `data-interval` (ms, padrão 7000).
- `.sdb-banner__slides` (região viva: `aria-live="off"` enquanto roda, `polite` parado) com `.sdb-banner__slide` (`role="group"`, `aria-roledescription="slide"`, `aria-label="1 de 3"`).
- Cada slide: `.sdb-banner__text` (rótulo `.sdb-banner__label` em `meta`, título, `.sdb-banner__sub`, `.sdb-banner__actions` com botões em cápsula) e `.sdb-banner__media` (placa com o arco ou `<img alt="">` de `portal/public/imagens/banner/`, 5:2).
- Título de **marca**: `.sdb-banner__brand` (`display-caps`), só no slide de marca. Título de **episódio e anúncio**: `.sdb-banner__title` em serifa de dois tons (segunda parte num `<span>` em `label-secondary`).
- `.sdb-banner__controls`: anterior, pontos (`[data-banner-go]`), próximo e pausar (`[data-banner-toggle]`).

## Regras
- Gira a cada 7 s e **pausa** com o ponteiro em cima, com o foco dentro e pelo botão (WCAG 2.2.2). Com `prefers-reduced-motion`, começa parado. Também para com a aba oculta.
- Tudo operável por teclado; slides fora da vez ficam `inert`.
- Slide de anúncio (`--ad`): Badge "Publicidade" sempre visível, nome do anunciante, link "Por que estou vendo isto?" (abre a política num Modal) e `rel="sponsored"`. Sem selo de proveniência, sem contorno tracejado de IA, sem contagem regressiva ou urgência. Nenhuma marca real nos exemplos.
- O nome "A Sala dos Buscadores" em `display-caps` aparece uma vez por tela.
- `SalaBuscadores.showSlide(banner, i)` troca por código.
