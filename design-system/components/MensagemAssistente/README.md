# Mensagem do assistente

Resposta do assistente, identificada como IA, com três tipos de trecho visualmente distintos, fontes numeradas e ações.

| Trecho | Classe | Tipografia | Superfície |
| --- | --- | --- | --- |
| Documental | `.sdb-seg--doc` | Source Serif itálico 18 | material regular; rótulo em `accent` com a localização |
| Interpretação editorial | `.sdb-seg--editorial` | Source Serif 16,5 | `accent-soft`; rótulo com quem assina |
| Síntese da IA | `.sdb-seg--ai` | Inter 15 | contorno tracejado, o mesmo do selo de IA |

Acervo em serifa; o que a IA escreve em Inter e tracejado.

## Regras
- Cabeçalho: avatar de vidro com o arco, "Assistente de IA" e o selo "Síntese por IA". Nunca um nome humano.
- Toda afirmação da síntese aponta uma referência `[n]` (`.sdb-ref`) ligada a uma linha de fonte citada (Card de fonte, variante linha).
- Ações em círculos de vidro: copiar (texto + fontes), útil / não útil (exclusivos, com toast), gerar novamente (passa pelo Indicador de consulta).
- O balão da pessoa (`.sdb-bubble`) fica à direita em `accent-fill`.
- Linguagem: "Segundo o Tratado I…", "O texto não diz…". Nunca "A verdade é…".
