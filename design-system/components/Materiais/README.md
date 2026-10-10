# Materiais

Duas camadas, como no Liquid Glass da Apple: a camada de conteúdo usa materiais (fino, regular, espesso); a camada funcional, que flutua sobre o conteúdo, usa vidro.

## Temas
| Tema | Superfícies | Uso |
| --- | --- | --- |
| Vidro · claro / escuro | translúcidas, `backdrop-filter: blur(24px) saturate(150%)` (115% no escuro), filete de luz no topo | padrão do portal |
| Sólido · claro / escuro | opacas, sem desfoque, sombras mais curtas | páginas de leitura longa, dispositivos lentos, `prefers-reduced-transparency` |

## Regras
- Vidro (`.sdb-glass`, `glass-fill`) só em controles e navegação: botões flutuantes, chips, barras, toasts, menus. Nunca como fundo de um parágrafo longo.
- Conteúdo em material (`.sdb-material`, `material-thin | regular | thick`). Texto fino ou longo pede o espesso.
- Vidro claro (`glass-clear`, `.sdb-glass--clear`) só sobre mídia escura: placas de Sala e de vídeo. Texto em `on-media`.
- Não empilhe vidro claro sobre vidro claro. Controle sobre card usa `fill` (botão secundário), não vidro.
- O brilho ambiente (`ambient-a/b/c`) é o que o vidro refrata. Nos temas sólidos ele some.
- Com `prefers-reduced-transparency` todas as superfícies ficam opacas automaticamente.
