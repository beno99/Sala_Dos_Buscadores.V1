# Seletor de tema

Escolha da aparência no diálogo "Aparência" (layout do Figma "Jornada do buscador", out 2026): quatro cartões com a miniatura da interface em cada tema.

## Anatomia
- `div.sdb-themepick[role="radiogroup"][aria-label="Tema"]`.
- Cada opção: `button.sdb-themepick__opt[role="radio"][aria-checked]` com `span.sdb-themepick__mini[data-theme="<tema>"]` (miniatura desenhada com os tokens daquele tema: fundo, lateral, card e linhas) e o nome embaixo ("Areia", "Escuro", "Vidro claro", "Vidro escuro").
- Setas ← → movem a escolha; só a opção marcada fica no Tab.

## No diálogo Aparência
- Modal em sheet: título "Aparência", "Tema" com subtítulo "Escolha as cores da interface" e o seletor; "Barra lateral" com Switch "Deixar a barra lateral translúcida" (`data-lateral="translucida"` no `<html>`); rodapé "Cancelar" (secundário) e "Salvar" (primário).
- A escolha só vale ao salvar; cancelar ou Esc mantém o que estava.
- O tema e a lateral ficam em cookies (`sdb_tema`, `sdb_lateral`), para o HTML já sair no tema certo.
