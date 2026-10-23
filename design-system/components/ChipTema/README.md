# Chip de tema transversal

Tema que atravessa várias Salas ("morte", "meditação", "origem do universo", "alma"). Clicar filtra ou abre a comparação daquele tema.

- `<button class="sdb-chip" data-toggle aria-pressed="false">Tema <span class="sdb-count">n</span></button>`: cápsula de vidro regular.
- Estados: padrão, hover (contorno), pressionado (0,94 com mola), selecionado (`accent-fill` + `on-accent`), desabilitado (tema sem conteúdo).
- `--sm` para filtros ativos (com `.sdb-chip__x`) e para Salas relacionadas (com o arco).
- Nunca use termos de uma só tradição como tema transversal.
- Chip que navega (filtro por link): `a.sdb-chip` com `aria-current="true"` no filtro ativo; mesmo visual do selecionado.

## Abas de Sala (`.sdb-chiprow`)
Chips de seleção única com contagem (`.sdb-count`), numa linha que não quebra e rola na horizontal quando não cabe. Na Biblioteca: "Todas 20 · Apócrifos 4 · …", em ordem alfabética (a ordem não indica importância), com nomes curtos; a contagem acompanha a vista (conteúdos ou verbetes).

## Areia (`.sdb-chip--sand`, out 2026)

Chips de filtro por tema com contagem, nas linhas de "Salas recomendadas", "Salas da curadoria" e "Minhas Salas": fundo `chip-warm` e texto `on-chip-warm` (marrom; o branco 60% do Figma não passava AA). Selecionado, continua em `accent-fill`.
