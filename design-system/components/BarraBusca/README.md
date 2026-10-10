# Barra de busca

Ponto de partida da busca comparativa, com dois modos: por Sala/tradição ou por tema/pergunta.

- Painel em material espesso, raio `radius-xl`. Em cima, o segmentado de modo; no meio, o campo em `reading` 20 px (a pergunta é conteúdo) e o botão principal; embaixo, sugestões em chips.
- **Por Sala**: chips com o arco selecionam as Salas. **Por tema ou pergunta**: chips de tema preenchem o campo.
- Estados: padrão, foco (anel duplo), carregando (indicador no botão, `aria-busy`), erro (busca vazia: anel `critical` e instrução), resultado (quantas Salas responderam).
