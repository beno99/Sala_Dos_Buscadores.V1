# Editor de texto marcado

Edita o corpo de um conteúdo parágrafo por parágrafo, com as duas marcações do acervo e pré-visualização. Não é um editor rico: não aceita HTML.

- `.sdb-editor` > blocos `.sdb-editor__block`: número do parágrafo (`.sdb-editor__num`), coluna principal `.sdb-editor__main` e ferramentas `.sdb-editor__tools` (subir, descer, remover, em botões-ícone pequenos; "subir" usa `chevronBaixo` com `.sdb-editor__up`).
- Na coluna principal: barra `.sdb-editor__bar` com dois botões secundários pequenos, **Termo** (envolve a seleção em `*…*`, vira `<dfn>`) e **Obra** (`_…_`, vira `<cite>`); a Área de texto do parágrafo; e `.sdb-editor__preview`, renderizada pelo mesmo componente de texto das páginas públicas.
- O bloco em foco ganha o anel duplo. Abaixo de 560 px as ferramentas vão para uma linha.
- "Adicionar parágrafo" é um botão Tinted no fim da lista.
- Rótulos: cada área de texto se chama "Parágrafo n"; os botões dizem o que fazem ("Marcar termo no parágrafo 2").
