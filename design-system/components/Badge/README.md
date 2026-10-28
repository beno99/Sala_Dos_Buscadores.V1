# Badge

Rótulo curto com ícone e cor semântica, não clicável, com cantos de 8 px. Para temas clicáveis use Chip de tema.

- Temas: `--topic` (azul, `glossario`); fonte: `--source` (verde, `fontePrimaria`); época: `--period` (âmbar, `linhaTempo`); idioma: `--language` (roxo, `artigo`); novidade: `--new` (roxo, `assistente`).
- `--neutral` é neutro; `--glass` é reservado à mídia. Os aliases `--solid` e `--ink` continuam compatíveis.
- Ícones em `sdb-icon--sm`, decorativos com `aria-hidden="true"`; o rótulo sempre identifica o significado. As cores vêm dos pares `tag-*-fill/ink`, ajustados ao tema.

## Status editorial

Os cinco estados do ciclo de publicação (curadoria e anfitriões), sempre com ícone e palavra:

| Status | Marcação |
| --- | --- |
| Rascunho | `sdb-badge sdb-badge--draft` + `artigo`, neutro |
| Em revisão | `sdb-badge sdb-badge--review` + `editar`, âmbar |
| Publicado | `sdb-badge sdb-badge--published` + `check`, verde |
| Reprovado | `sdb-badge sdb-badge--critical` + `devolver`: voltou ao autor com motivo |
| Arquivado | `sdb-badge sdb-badge--archived` + `cadeado`, neutro |

`--critical` é só para “Reprovado”; erro de formulário continua na mensagem de erro do campo. Não dependa apenas da cor.
