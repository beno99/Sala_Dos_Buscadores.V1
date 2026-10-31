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

## Cheio (`.sdb-banner--cheio`, out 2026)
Layout do Figma "Jornada do buscador": a imagem (ou a placa) ocupa o card inteiro, com véu `veil-media` e desfoque progressivo à esquerda; rótulo, título e subtítulo em `on-media`; botões de 48 px com canto de 12 px; setas em bege e ponto atual dourado. Abaixo de 760 px, o véu vem de baixo e o texto encosta na base. O véu garante o AA do texto branco sobre qualquer imagem (conferido em `contraste.mjs`, pior caso sobre bege). Padrão no Portal.

O frame `19537:21623` usa 1088 × 496 px no desktop. O texto começa a 48 px do topo, com 72 px reservados embaixo para os controles; a altura pode crescer com textos maiores. O desfoque e o véu ocupam camadas distintas para não escurecer a imagem duas vezes. O véu mantém sua intensidade em toda a largura do texto. A composição estreita responde à largura do próprio banner (container `sdb-banner`, até 760 px), inclusive em tablets com a lateral aberta.

No banner cheio, a ação discreta “Por que estou vendo isto?” usa `on-media`, como os demais textos sobre a imagem.

## Arte pronta (`.sdb-banner__slide--arte`, out 2026)
Para peça que já traz o texto na imagem: sem véu nem desfoque, imagem ancorada à esquerda para o texto não ser cortado, e o mesmo texto em `h2.sdb-sr` para leitor de tela. As ações ficam na base, logo acima dos controles. Mantenha o texto da arte na metade esquerda e fora dessa faixa. Até 480 px de largura do banner, a arte aparece inteira (`contain`) sobre a placa grafite.
