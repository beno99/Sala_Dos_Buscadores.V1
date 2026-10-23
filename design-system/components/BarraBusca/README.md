# Barra de busca

Ponto de partida da busca comparativa, com dois modos: por Sala/tradição ou por tema/pergunta.

- Painel em material espesso, raio `radius-xl`. Em cima, o segmentado de modo; no meio, o campo em `reading` 20 px (a pergunta é conteúdo) e o botão principal; embaixo, sugestões em chips.
- **Por Sala**: chips com o arco selecionam as Salas. **Por tema ou pergunta**: chips de tema preenchem o campo.
- Estados: padrão, foco (anel duplo), carregando (indicador no botão, `aria-busy`), erro (busca vazia: anel `critical` e instrução), resultado (quantas Salas responderam).

## Compacta (`.sdb-searchfield`)
Só o campo em cápsula, com a lupa, para filtrar o conteúdo de uma página (Biblioteca, glossário). Sem modos nem sugestões: a busca global continua no Painel de busca (⌘K).
- `label.sdb-searchfield` > ícone `busca`, rótulo `.sdb-sr` ("Buscar na Biblioteca") e `input type="search"` com placeholder que termina em reticências.
- 48 px de altura, na mesma linha dos botões; foco com o anel `focus-ring`.
- Filtra enquanto se digita; a contagem de resultados vai numa região `aria-live` da página.
