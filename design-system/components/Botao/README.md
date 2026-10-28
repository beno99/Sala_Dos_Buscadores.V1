# Botão

Ação com cantos de 12 px (`radius-button`); o rótulo diz exatamente o que acontece. O mesmo raio vale para todos os tamanhos e botões de ícone.

## Variantes
| Variante | Classe | Uso |
| --- | --- | --- |
| Primário | `--primary` | preenchimento `prominent-fill` (grafite no claro, branco no escuro). Uma por área. |
| Secundário | `--secondary` | preenchimento `fill`. Ações de mesmo peso; botões dentro de cards. |
| Vidro | `--glass` | Liquid Glass regular. Controles que flutuam sobre o canvas ou barras. |
| Tinted | `--tinted` | `accent-soft` + `accent`. Ação de apoio com cor da marca. |
| Discreto | `--plain` | só texto em `accent`. Terciária, links de ação. |
| Destrutivo | `--destructive` | bordô com bege, sempre com ícone e verbo explícito. |
| Ícone | `--icon` | quadrado de cantos de 12 px; combine com `--secondary` ou `--primary`. Exige `aria-label` e `data-tip`. |
| Sobre mídia | `.sdb-glass--clear` | vidro claro, só sobre placas escuras. |
| Dourado | `--gold` | degradê `gold-action-from` → `gold-action-to` com `on-gold-action`, cantos de 12 px. Ação principal sobre as camadas douradas (Onboarding). |
| Areia escura | `--warm` | `action-warm` com `on-action-warm`, cantos de 12 px. Ação secundária ao lado do dourado. |

Tamanhos `--sm` (34), padrão (44), `--lg` (54), `--block` para largura total.

## Estados
Hover: camada de `currentColor` a 8% (só ponteiro fino). Pressionado: `scale(0.96)` em 90 ms e camada a 14%; volta com mola. Foco: anel dourado de 2 px em `button-focus-ring`, afastado 3 px, com filete e halo (`button-focus-rim/glow`). A forma do foco acompanha o raio do botão. Desabilitado: 36%. Bloqueado mas explicável: `aria-disabled="true"` tem o mesmo visual, continua focável e o clique mostra o que falta (ex.: Publicar com pendências no checklist). Carregando: `.is-loading` + `aria-busy`; o rótulo desfoca e o indicador aparece no mesmo lugar, sem mudar a largura.

## Compartilhar
Botão secundário pequeno que copia o endereço da página e, onde existe o menu do sistema (`navigator.share`), abre esse menu.

```html
<button class="sdb-btn sdb-btn--secondary sdb-btn--sm sdb-share" type="button" data-share data-share-title="Os sete princípios, em linguagem simples">
  <span class="sdb-share__copy"><span data-icon="copiar" class="sdb-icon--sm"></span>Copiar link</span>
  <span class="sdb-share__native"><span data-icon="compartilhar" class="sdb-icon--sm"></span>Compartilhar</span>
</button>
```

- `data-share-url` opcional; sem ele, o endereço atual. `data-share-title` vai para o menu do sistema.
- O runtime põe `.is-native` onde houver `navigator.share`: o rótulo vira "Compartilhar", com o ícone `compartilhar`, e o clique abre o menu com o título e o link. Cancelar não mostra nada.
- Sem menu do sistema: copia e confirma com o [Toast](../Toast/README.md) "Link copiado.". Se a área de transferência for recusada, o toast "Não foi possível copiar" mostra o link pronto para selecionar (`SalaBuscadores.toast(msg, {select: url})`).
- `SalaBuscadores.share(botao)` faz o mesmo por código.
- Nunca ícones de marca (Instagram, X, YouTube).

## Ação do CardSala

`.sala__action` usa o botão primário compartilhado sobre o painel escuro. O preenchimento claro é fosco em repouso e fica mais luminoso no hover com ponteiro fino e no foco por teclado; o texto não perde opacidade. A compressão ao pressionar continua ativa. Não reproduza o hover em telas de toque.
