# Redesign · Fase A (design system) Implementation Plan

> **For agentic workers:** executado inline nesta sessão (superpowers:executing-plans), com parada para revisão visual do usuário ao fim da fase. Passos em checkbox.

**Goal:** Deixar `design-system/` pronto para o redesign do portal: tema Sólido claro como padrão com contraste leve, camada flutuante, peças estendidas e peças novas, cada uma com CSS, guia, exemplo e entrada no catálogo.

**Architecture:** Um gerador sem dependências (`design-system/scripts/build.mjs`) passa a produzir `tokens.css` (de `tokens.json`), `exemplos/<Nome>.html` (de `components/<Nome>/preview.html`) e `catalogo.html` (dos cabeçalhos `@dsCard` das prévias), com `--check` para CI. Estilos novos entram em `components/bundle.css`; comportamentos novos (lateral recolhível, carrossel, banner, etapas do onboarding) em `components/bundle.js`, por atributos `data-*`, no mesmo padrão delegado do runtime atual.

**Tech Stack:** HTML + CSS + JS puro (ES5 no runtime, como o atual); Node ≥ 20 para os scripts.

**Spec:** `docs/superpowers/specs/2026-10-07-redesign-portal-design.md` + `docs/prompts/redesign-portal.md` (seções 1 e 2).

## Global Constraints

- Nada de cor, raio, sombra ou curva solto em peça nova: só `var(--token)`. (Exceções já existentes no bundle, como placas e emblema de ouro, ficam como estão.)
- Classes `sdb-*`; comportamento por `data-*`; `SalaBuscadores.hydrate()` depois de HTML dinâmico.
- Temas: `vidro-claro`, `vidro-escuro`, `solido-claro`, `solido-escuro`. Padrão passa a ser `solido-claro` (escuro do sistema → `solido-escuro`).
- Vidro só no que flutua (camada `float-*`); conteúdo em material opaco nos temas sólidos.
- Texto à esquerda, sem `justify`. Sem emoji, sem exclamação. "Portal", nunca "Home"/"Início".
- Ouro só emblema/filete; pares de texto: grafite/bege, grafite/branco, bordô/bege, branco/grafite, bege/bordô.
- `prefers-reduced-motion` (sem deslocamento, sem ressalto, sem rotação automática) e `prefers-reduced-transparency` (camada flutuante opaca) em toda peça nova.
- Conteúdo de exemplo real do acervo (Corpus Hermeticum, Nag Hammadi, O Caibalion, O Livro de Urântia, Apócrifos), nunca lorem ipsum. Anunciantes fictícios marcados como tais.

---

### Task A1: Gerador do design system

**Files:**
- Create: `design-system/scripts/build.mjs`

**Interfaces:**
- Produces: `node design-system/scripts/build.mjs` (escreve) e `--check` (sai 1 se algo diverge). Gera `tokens.css`, `exemplos/*.html`, `catalogo.html`.

- [x] Escrever o gerador reproduzindo o formato atual: cabeçalho de `tokens.css`, blocos por tema (`:root, [data-theme="<padrão>"]`, demais temas, `@media (prefers-color-scheme: dark) :root:not([data-theme])`), bloco `:root` com espaço, raio, desfoque, duração, curva e famílias; `{ref}` vira `var(--ref)`.
- [x] Exemplo = moldura atual (doctype, links, script de `?tema=`, `<body>`, prévia sem a linha `@dsCard`, script de altura).
- [x] Catálogo = cabeçalho atual + grupos na ordem do README, cada `article` com `group/height/subtitle` do `@dsCard`.
- [x] Rodar `--check` sobre o repositório atual **antes de mudar qualquer token**: precisa dar zero diferenças (prova de que o gerador reproduz o que existe).

### Task A2: Tokens · tema Sólido padrão, contraste leve e camada flutuante

**Files:**
- Modify: `design-system/tokens.json` (tema padrão, `solido-claro`, `solido-escuro`, novos `float-*`)
- Create: `design-system/scripts/contraste.mjs`
- Regenerar: `tokens.css`

- [x] `tokens.json`: campo `"default": "solido-claro"` e `"defaultDark": "solido-escuro"`; o gerador usa isso no `:root` e no `prefers-color-scheme`.
- [x] Sólido claro com contraste leve (ref. 06): canvas bege chapado; materiais em creme claro um passo acima do bege (não branco puro), contorno `glass-edge` sutil, `shadow-card` curta.
- [x] Sólido escuro: superfícies um passo acima do grafite, sombra curta.
- [x] Novos tokens por tema: `float-fill`, `float-edge`, `float-rim`, `float-shadow` e o valor `blur-float` (desfoque e saturação da camada flutuante, que vale também nos sólidos).
- [x] `contraste.mjs`: compõe rgba sobre o fundo e calcula a razão WCAG de `label`, `label-secondary`, `accent`, `on-accent`, `on-prominent`, `on-depth` e `critical` sobre `bg-canvas` e cada material, nos quatro temas; sai 1 se algum texto ficar abaixo de 4,5:1 (e `label-tertiary` só informativo).

### Task A3: CSS base · camada flutuante e canvas chapado

**Files:** Modify `design-system/components/bundle.css`

- [x] `.sdb-float`: `background-color: var(--float-fill)`, `backdrop-filter: var(--blur-float)`, contorno e sombra `float-*`. `.sdb-tabbar` passa a usar a camada flutuante.
- [x] `.sdb-ambient` / `.sdb-stage` nos temas sólidos: só `var(--bg-canvas)` (sem gradiente).
- [x] `prefers-reduced-transparency`: `.sdb-float` e peças flutuantes ficam opacas.
- [x] Nos sólidos, `.sdb-sidenav` deixa de ser vidro e vira material (a lateral não flutua sobre conteúdo).

### Task A4: Peças estendidas

**Files:** `bundle.css`, `bundle.js`, `components/<Nome>/{README.md,preview.html}` de NavegacaoLateral, IndicadorNumerico, CardSala, CardConteudo, SeloNivel

- [x] **NavegacaoLateral:** marca no topo; `.sdb-sidenav__group` (título em `meta`); `.sdb-sidenav__profile` (avatar, pseudônimo, "Membro desde", menu); `.sdb-sidenav__resume` (mini card "Continuar" com barra fina e dispensar); `.sdb-sidenav__tag` ("nova") além de `__count`; `.sdb-sidenav__foot` com cartões; recolhida 64 px com `data-tip`. JS: `[data-sidenav-toggle]` alterna `.is-collapsed`, `aria-expanded` e guarda em `localStorage` (try/catch).
- [x] **IndicadorNumerico:** `.sdb-stats` (um card, células com divisórias; vira 2×2 e 1 coluna) com `.sdb-stat__label`, `__value`, `__track` (barra de progresso opcional, `aria-hidden`) e `__hint`. Guia: "dados do acervo ou do próprio membro, sempre privados; nunca ranking nem comparação entre pessoas".
- [x] **CardSala:** `.sdb-plate--img` (imagem com `object-fit`), `.sdb-progress` (barra fina + legenda "Iniciante · 2 de 6 lidos"), etiqueta "Para ampliar o olhar" (`.sdb-badge--outline`).
- [x] **CardConteudo:** `.sdb-card--row` (miniatura 4:3 com placa de fallback, Sala, título, `.sdb-progress`, botão "Retomar leitura", selo de proveniência).
- [x] **SeloNivel:** `.sdb-level-progress` (selo + barra de degraus + "Faltam 2 leituras para Avançado").

### Task A5: Peças novas de estrutura

**Files:** `bundle.css`, `bundle.js`, `components/<Nome>/{README.md,preview.html}`

- [x] **BarraSuperior** (`.sdb-topbar`): título/saudação à esquerda; lupa (com `kbd` ⌘K), aparência, conta à direita; `.is-scrolled` aplica a camada flutuante. Comentário `TODO(notificacoes)` no exemplo.
- [x] **BotaoFlutuante** (`.sdb-fab`): círculo 56 px, camada flutuante, ícone `assistente`, `data-tip`; `--above-tabbar` no celular.
- [x] **Rodape** (`.sdb-footer`): marca + frase, colunas de links, linha final.
- [x] **Carrossel** (`.sdb-carousel`): cabeçalho (título, legenda, setas), trilho com scroll-snap; JS `[data-sdb-carousel]` liga setas (rolam uma página, desabilitam nas pontas). Sem rolagem lateral da página.
- [x] **BannerRotativo** (`.sdb-banner`): card largo `radius-xl`, texto à esquerda (rótulo, título serifado com segunda linha em `label-secondary`, subtítulo, botões), mídia à direita (placa ou imagem); controles pontos, setas e pausar. JS `[data-sdb-banner]`: troca a cada `data-interval` (7000), pausa em hover/foco/botão, não roda com `prefers-reduced-motion`, `aria-live="off"` enquanto roda e `polite` pausado, setas e pontos por teclado. Variante de slide `--ad` com rótulo "Publicidade".
- [x] **PainelBusca** (`.sdb-searchpanel`): sobreposição no topo com `BarraBusca` e lista de sugestões agrupadas (Salas, temas "Comparar «tema» entre as Salas", conteúdos, "Perguntar ao assistente: «texto»"); sem animação.
- [x] **Conquista** (`.sdb-achv`): emblema de ouro com glifo preto (obtida) ou `fill-strong` com cadeado e critério (bloqueada); versões mini e linha.
- [x] **Onboarding** (`.sdb-onboarding`): sheet com `.sdb-dots` de etapa, "Etapa N de 4" anunciado, área de consentimento destacada, ações "Pular" e "Continuar"; JS `[data-sdb-steps]` avança/volta e move o foco para o título.
- [x] **EspacoPublicitario** (`.sdb-ad`): versões `--banner` e `--column`; rótulo "Publicidade", anunciante, link "Por que estou vendo isto?"; visual distinto de card editorial (sem selo, sem tracejado).
- [x] Ícones novos em `bundle.js`: `pausar`, `sair`, `ajustes`, `destaques`, `biblioteca`, `menuLateral`.

### Task A6: Documentação, catálogo e sincronização

- [x] Grupo novo "Estrutura do portal" no catálogo e no README (BarraSuperior, BannerRotativo, Carrossel, PainelBusca, BotaoFlutuante, Rodape, Onboarding, Conquista, EspacoPublicitario); NavegacaoLateral passa para esse grupo.
- [x] `DIRETRIZES.md`: tema padrão Sólido claro, fundo chapado, camada flutuante, regra de imagens com `portal/public/imagens/`.
- [x] `design-system/README.md`: tema padrão, scripts `build.mjs` e `contraste.mjs`.
- [x] `CLAUDE.md`: linha de linguagem visual.
- [x] `node design-system/scripts/build.mjs --check`, `node design-system/scripts/contraste.mjs`, `cd portal && npm run ds:sync && npm run check`.
- [x] Conferência visual do catálogo nos quatro temas em 1440 e 390 px.
- [x] Parar e pedir revisão ao usuário; lembrar de atualizar o artifact publicado.
