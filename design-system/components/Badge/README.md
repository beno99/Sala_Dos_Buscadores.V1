# Badge

Rótulo curto, não clicável, em cápsula. Para temas clicáveis use Chip de tema.

- Padrão: `accent-soft` + `accent`. `--neutral` (`fill`), `--solid` (bordô), `--ink` (grafite/branco), `--critical` (`critical-soft` + `critical`), `--glass` sobre mídia.
- Status pela forma do marcador (cheio, meio, vazio) ou ícone, e pela palavra; nunca só pela cor.
- No máximo um `--solid` por card.

## Status editorial
Os cinco estados do ciclo de publicação (curadoria e anfitriões), sempre com marcador ou ícone e a palavra:

| Status | Marcação |
| --- | --- |
| Rascunho | `sdb-badge sdb-badge--neutral` + `sdb-badge__dot--hollow` |
| Em revisão | `sdb-badge` + `sdb-badge__dot--half` |
| Publicado | `sdb-badge` + `sdb-badge__dot` |
| Reprovado | `sdb-badge sdb-badge--critical` + ícone `devolver` (`sdb-icon--sm`): voltou ao autor com motivo |
| Arquivado | `sdb-badge sdb-badge--neutral` + ícone `cadeado` |

`--critical` é só para "Reprovado"; erro de formulário continua na mensagem de erro do campo.
