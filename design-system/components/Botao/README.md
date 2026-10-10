# Botão

Ação em forma de cápsula; o rótulo diz exatamente o que acontece.

## Variantes
| Variante | Classe | Uso |
| --- | --- | --- |
| Primário | `--primary` | cápsula `prominent-fill` (grafite no claro, branco no escuro). Uma por área. |
| Secundário | `--secondary` | preenchimento `fill`. Ações de mesmo peso; botões dentro de cards. |
| Vidro | `--glass` | Liquid Glass regular. Controles que flutuam sobre o canvas ou barras. |
| Tinted | `--tinted` | `accent-soft` + `accent`. Ação de apoio com cor da marca. |
| Discreto | `--plain` | só texto em `accent`. Terciária, links de ação. |
| Destrutivo | `--destructive` | bordô com bege, sempre com ícone e verbo explícito. |
| Ícone | `--icon` | círculo; combine com `--secondary` ou `--primary`. Exige `aria-label` e `data-tip`. |
| Sobre mídia | `.sdb-glass--clear` | vidro claro, só sobre placas escuras. |

Tamanhos `--sm` (34), padrão (44), `--lg` (54), `--block` para largura total.

## Estados
Hover: camada de `currentColor` a 8% (só ponteiro fino). Pressionado: `scale(0.96)` em 90 ms e camada a 14%; volta com mola. Foco: anel de 3 px em `focus-ring`. Desabilitado: 36%. Bloqueado mas explicável: `aria-disabled="true"` tem o mesmo visual, continua focável e o clique mostra o que falta (ex.: Publicar com pendências no checklist). Carregando: `.is-loading` + `aria-busy`; o rótulo desfoca e o indicador aparece no mesmo lugar, sem mudar a largura.
