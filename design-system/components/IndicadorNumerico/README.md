# Indicador numérico

Um total e, se ajudar, como ele se divide ou quanto falta. No painel da curadoria e no Portal (progresso do membro).

- `div.sdb-stat` (material) > `.sdb-stat__label` (meta), `.sdb-stat__value` (34 px, algarismos tabulares) e `.sdb-stat__hint` opcional.
- Distribuição: `.sdb-stat__bar` com um `<i data-tone="1|2|3">` por parte e `--n` com a quantidade; legenda `.sdb-stat__legend` com marcador do mesmo tom, rótulo e número em `<b>`. A barra é decorativa (`aria-hidden`); a legenda carrega a informação.
- Tons: 1 `accent-fill`, 2 `label`, 3 `label-tertiary`. No máximo três partes; mais que isso vira lista.
- **Painel agrupado** (`section.sdb-stats.sdb-material`, com `aria-label`): várias `.sdb-stat` num único card, separadas por divisórias; 4 colunas, 2 abaixo de 1100 px e 1 abaixo de 480 px (`--cols` muda o padrão). Valor com complemento em `<small>` ("3 de 5"), barra opcional `.sdb-progress__track` (decorativa, `aria-hidden`) e dica `.sdb-stat__hint`. O número e o texto carregam a informação; a barra só complementa. Dentro do Painel de progresso, o grupo vira `div.sdb-stats` (`role="group"`) sem material próprio.
- Dados do acervo ou do próprio membro, sempre privados; nunca ranking nem comparação entre pessoas. Sem pontos, nível global ou certificados.
