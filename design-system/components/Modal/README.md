# Modal

Interrompe o fluxo para uma decisão (alerta) ou um formulário curto (sheet).

- `.sdb-overlay#id` > `.sdb-modal`. Abra com `data-open="id"` ou `SalaBuscadores.openOverlay(id)`; feche com `data-close`, Esc ou toque no véu (`scrim`). O foco entra no primeiro campo e volta ao gatilho.
- **Alerta** `--alert`: ícone em disco, título, texto e dois botões lado a lado (o seguro à esquerda). Destrutivo: `role="alertdialog"`, diga se é irreversível.
- **Sheet** `.sdb-sheet`: barra com Cancelar · título · ação principal, como no iOS.
- Materializa do centro (escala 0,92, desfoque 8 px) com mola; sai em 220 ms.
