# Menu

Lista de ações ligada a um botão, em material espesso.

- `.sdb-menu-wrap` > botão `data-menu-trigger` + `.sdb-menu` > `.sdb-menu__item` com `<span>` do rótulo, atalho opcional (`.sdb-kbd`) e ícone à direita (como no iOS). `role="menuitemcheckbox"` mostra a marca à esquerda.
- Abre a partir do canto do gatilho com mola (escala 0,9 → 1); fecha em 160 ms. `--right` e `--up` mudam a âncora. Setas navegam, Esc fecha e devolve o foco.
- Item destrutivo por último, separado, em `critical`.
