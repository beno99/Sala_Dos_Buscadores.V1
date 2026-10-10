# Painel de busca

Sobreposição no topo da tela, aberta pela lupa da Barra superior ou por ⌘K / Ctrl K: a Barra de busca com os dois modos e sugestões ao vivo abaixo.

## Anatomia
- `.sdb-overlay.sdb-overlay--top` > `.sdb-searchpanel` (`role="dialog"`, `aria-modal`, `aria-label`).
- Dentro: a Barra de busca (`form.sdb-searchbar`, modos "Por Sala" e "Por tema ou pergunta", botão "Comparar") e `.sdb-searchpanel__results` (`role="listbox"`), que reaproveita os grupos e itens do Command palette (`.sdb-palette__group`, `.sdb-palette__item` com `role="option"`).
- Grupos, nesta ordem: **Temas** ("Comparar «tema» entre as Salas"), **Salas**, **Conteúdos**, **Assistente** ("Perguntar ao assistente: «texto»"). Rodapé `.sdb-searchpanel__foot` com as teclas.

## Regras
- Sem animação de entrada ou saída, como o Command palette: aparece na hora (uso frequente, aberto por teclado).
- O campo é um `combobox` com `aria-activedescendant`; ↑ ↓ navegam, ↵ abre, esc fecha e devolve o foco à lupa.
- "Comparar" leva à Grade comparativa (`/comparar`). Busca por tema cobre o RF-17.
- Sem resultados: diga o que tentar ("Nada no acervo com «x». Tente um tema: Morte, Alma, Meditação.").
