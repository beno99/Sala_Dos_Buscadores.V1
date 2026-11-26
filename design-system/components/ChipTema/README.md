# Chip de tema transversal

Tema que atravessa várias Salas ("morte", "meditação", "origem do universo", "alma"). Clicar filtra ou abre a comparação daquele tema.

- `<button class="sdb-chip" data-toggle aria-pressed="false">Tema <span class="sdb-count">n</span></button>`: cápsula de vidro regular.
- Estados: padrão, hover (contorno), pressionado (0,94 com mola), selecionado (`accent-fill` + `on-accent`), desabilitado (tema sem conteúdo).
- `--sm` para filtros ativos (com `.sdb-chip__x`) e para Salas relacionadas (com o arco).
- Nunca use termos de uma só tradição como tema transversal.
- Chip que navega (filtro por link): `a.sdb-chip` com `aria-current="true"` no filtro ativo; mesmo visual do selecionado.

## Linha de filtros de Sala (`.sdb-chiprow`)
Chips de seleção única com contagem (`.sdb-count`), numa linha que não quebra e rola na horizontal quando não cabe. Na Biblioteca: "Todas 20 · Apócrifos 4 · …", em ordem alfabética (a ordem não indica importância), com nomes curtos; a contagem acompanha a vista (conteúdos ou verbetes).

## Areia (`.sdb-chip--sand`, out 2026)

Chips de filtro por tema com contagem, nas linhas de "Salas recomendadas", "Salas da curadoria" e "Minhas Salas": fundo `chip-warm` e texto `on-chip-warm` (marrom; o branco 60% do Figma não passava AA). Selecionado, continua em `accent-fill`.


## Filtros horizontais com controles (`.sdb-chiprow--filters`)

Variante reutilizável para grupos de filtros por tema, aplicada em Salas e no filtro de Salas do Portal. Reaproveita `.sdb-chiprow`; não altera tags de metadados, formulários nem chips isolados. Veja a estrutura completa na [prévia](preview.html) e no [exemplo gerado](../../exemplos/ChipTema.html).

- Contêiner `.sdb-chipfilters[data-sdb-chipfilters]`, trilho `.sdb-chiprow.sdb-chiprow--filters` e botões irmãos com `data-chipfilters-prev` / `data-chipfilters-next`. IDs únicos ligam `aria-controls` ao trilho. Use `role="group"` e um nome acessível; filtros são botões com `aria-pressed`, não abas ARIA.
- Flex sem quebra, largura mínima zero, overflow horizontal nativo e chips sem encolher. Rótulos e contagens nunca quebram. O alvo mede ao menos 44 px e cresce com o texto. Os 8 px de padding mantêm o anel de foco dentro da área rolável, inclusive nas extremidades.
- O recorte natural deixa o próximo chip parcialmente visível quando ele cruza a borda. Não há máscara, snap, loop nem autoplay; o primeiro e o último chip são totalmente alcançáveis. Um nome maior que a janela pode ser lido por deslocamento horizontal.
- `data-overflow` é medido pelo runtime. Os controles aparecem com ponteiro fino/hover quando há overflow e são desabilitados nas extremidades. Trackpad e rolagem horizontal continuam nativos; a roda vertical não é convertida.
- Foco e clique revelam somente o trecho necessário do chip, alterando apenas `scrollLeft`. Selecionar/remover não reinicia o trilho. Os botões avançam 80% da janela, com rolagem suave; movimento reduzido torna o avanço imediato. Revelação de foco é sempre imediata.
- Um gesto local de mais de 8 px cancela somente o clique subsequente do ponteiro. Não há captura de ponteiro, drag-and-drop, `preventDefault` no movimento, `touch-action: pan-y` nem eventos globais. A rolagem vertical da página permanece nativa.
- `ResizeObserver` acompanha trilho e chips (inclui fontes, texto ampliado e a abertura de `<details>`); mutações de conteúdo atualizam as medidas sem restaurar a posição inicial. Zero/um tema não exige controles. Na tela, o grupo pode ser omitido quando vazio.
- HTML: chame `SalaBuscadores.hydrate()` após inserir o grupo. React: use `FiltrosTema` de `portal/src/components/ds/FiltrosTema.tsx`, mantendo seleção e filtragem na tela consumidora. Não carregue `bundle.js` no portal.

As cores continuam exclusivamente em `chip-warm` / `on-chip-warm` e `accent-fill` / `on-accent`; os quatro temas preservam seus pares de contraste. Não substituir a paleta pela cor de uma referência de comportamento.
