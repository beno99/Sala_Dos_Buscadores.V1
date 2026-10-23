# Tabela de dados

Lista editorial com colunas, ordenação e seleção, para a área de curadoria.

- `.sdb-table-wrap` (material regular, rola na horizontal se precisar) > `table.sdb-table` com `caption` que descreve a lista.
- Cabeçalho ordenável: `th[aria-sort]` > `button.sdb-table__sort` com o ícone `chevronBaixo`; a coluna ativa fica em `accent` e o ícone gira em ascendente. Só uma coluna ordenada por vez.
- Seleção: primeira coluna `.sdb-table__check` com `label.sdb-check`; a linha marcada ganha `aria-selected="true"` (fundo `fill`).
- Título em `.sdb-table__title` com link e `.sdb-table__sub` para a Sala ou o slug. Ações em `.sdb-table__actions` (botões pequenos ou Menu).
- Status pelo Badge com marcador (cheio, meio, vazio) e palavra, nunca só cor. Números em `.sdb-table__num`.
- Abaixo de 720 px a tabela vira lista: cada célula precisa de `data-label` com o nome da coluna.
- Vazio: uma linha com `.sdb-table__empty` que diz o que fazer. Carregando: linhas de `.sdb-skel`.

## Navegação em níveis (`.sdb-table--nav`)
Para listas em que cada linha abre o nível seguinte (anfitriões › Salas do anfitrião › Sala em revisão).

- `Breadcrumbs` acima da tabela mostra o caminho; o último nível é a página atual.
- `table.sdb-table.sdb-table--nav`: o link do `.sdb-table__title` cobre a linha inteira (clique em qualquer ponto abre o nível); foco do teclado desenha o anel na linha.
- Última coluna `td.sdb-table__go` com o ícone `chevronDireita` (`aria-hidden`), que anda 3 px no hover. O cabeçalho dela é só `<span class="sdb-sr">Abrir</span>`.
- Botões em `.sdb-table__actions` continuam clicáveis por cima do link.
- Filtros e contagem num `.sdb-table__toolbar` dentro do `.sdb-table-wrap`, antes da tabela (por exemplo o Switch "Só com pendências").
- Pendências: número em `.sdb-table__num` e, quando há espera, Badge "Em revisão" com o marcador de meio.
- No celular, o chevron fica à direita da linha, centralizado.

## Miniatura da Sala (1.0.3)
Na lista de Salas da curadoria, a primeira coluna junta a miniatura e o nome: `.sdb-table__sala` > `.sdb-table__thumb` (64 px, 16:10, com `<img alt="">` ou a placa `.sdb-plate.sdb-plate--{bordo|grafite|bege}` com o arco) e o bloco do título (`.sdb-table__title` e `.sdb-table__sub`). A miniatura é decorativa (`aria-hidden`); o nome é o link.
