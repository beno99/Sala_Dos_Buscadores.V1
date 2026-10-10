# Tabela de dados

Lista editorial com colunas, ordenação e seleção, para a área de curadoria.

- `.sdb-table-wrap` (material regular, rola na horizontal se precisar) > `table.sdb-table` com `caption` que descreve a lista.
- Cabeçalho ordenável: `th[aria-sort]` > `button.sdb-table__sort` com o ícone `chevronBaixo`; a coluna ativa fica em `accent` e o ícone gira em ascendente. Só uma coluna ordenada por vez.
- Seleção: primeira coluna `.sdb-table__check` com `label.sdb-check`; a linha marcada ganha `aria-selected="true"` (fundo `fill`).
- Título em `.sdb-table__title` com link e `.sdb-table__sub` para a Sala ou o slug. Ações em `.sdb-table__actions` (botões pequenos ou Menu).
- Status pelo Badge com marcador (cheio, meio, vazio) e palavra, nunca só cor. Números em `.sdb-table__num`.
- Abaixo de 720 px a tabela vira lista: cada célula precisa de `data-label` com o nome da coluna.
- Vazio: uma linha com `.sdb-table__empty` que diz o que fazer. Carregando: linhas de `.sdb-skel`.
