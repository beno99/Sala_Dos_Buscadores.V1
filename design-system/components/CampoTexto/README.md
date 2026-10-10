# Campo de texto

Entrada de uma linha, com rótulo sempre visível acima.

- Estrutura: `.sdb-field` > `label.sdb-label` + `.sdb-control` > `input`. Fundo `fill`, raio `radius-sm`, sem borda.
- **Senha**: `<button class="sdb-control__btn" data-toggle-password>`. **Busca**: `.sdb-control--search` (cápsula) com ícone `busca` e `data-clear`.
- **Foco**: o campo ganha `material-thick` e anel duplo (`focus-ring` + `accent-soft`). **Erro**: anel `critical`, `aria-invalid` e mensagem com ícone que começa por "Erro:" e diz como corrigir. **Desabilitado**: 45%.
- Fonte do valor em 16 px (evita zoom no iOS).
