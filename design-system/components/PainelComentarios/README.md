# Painel de comentários

## Anatomia

`div.sdb-overlay.sdb-community-overlay > section.sdb-modal.sdb-community-dialog`. Título “Comentários” e fechar em `__head`, lista rolável em `__body`, campo e envio em `__foot`, fora da rolagem.

## Uso e estados

Modal no desktop, painel inferior no celular (até 86dvh), com cantos contínuos. Sem árvore profunda. O campo permanece na base; imagem opcional por CampoImagem. Publicar desabilitado sem texto. Foco preso, Escape fecha e foco retorna ao gatilho. No HTML reutiliza openOverlay/closeOverlay e foco local de demo.js; React reutiliza Sheet/useFocoPreso. Página de publicação com todos os comentários fica para B.

## Temas, acessibilidade e contrato

Cores: `material-regular`, `material-thick`, `fill`, `label`, `label-secondary`, `accent`, `accent-soft`, `focus-ring` e tokens dos componentes compostos. Nenhuma cor própria. Geometria em `tokens.json › community`; espaços em `space-*`, cantos em `radius-*`, sombras em `shadow-card`. Compatível com Sólido claro (areia), Sólido escuro, Vidro claro e Vidro escuro.

Use elementos nativos, rótulos explícitos, foco visível e alvos de 44 px. Controles não dependem de hover. Estados de carregamento, vazio e erro pertencem ao container e usam CarregamentoSala/EstadoSecao. Esconder ação não confere permissão: sessão, papel e posse são verificados no servidor nas fases seguintes.

[Exemplo gerado](../../exemplos/PainelComentarios.html). Fonte: `preview.html`; comportamento de demonstração: `../Comunidade/demo.js`. Gere com `node design-system/scripts/build.mjs`. React em `portal/src/components/ds/` emite as mesmas classes, com dados e callbacks do consumidor; não importa o JavaScript de demonstração.
