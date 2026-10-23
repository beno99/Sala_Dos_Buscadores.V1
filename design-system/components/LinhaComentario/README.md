# Linha de comentário

## Anatomia

`article.sdb-comment`. Avatar pequeno, `.sdb-comment__body` com autoria, Badge Anfitrião, texto e `.sdb-comment__meta` (time, Responder, Curtir).

## Uso e estados

`.sdb-comment--host` destaca resposta de anfitrião em Pergunta; não se aplica automaticamente a todo comentário. `.sdb-comment--reply` recua somente um nível. `.sdb-comment__helped` mostra “Resposta que ajudou” com ícone check e palavra. Até 600 caracteres; contador apenas a partir de 480. Ordenação, posse e quem pode marcar a resposta pertencem ao consumidor/servidor. Texto é escapado, nunca HTML.

## Temas, acessibilidade e contrato

Cores: `material-regular`, `material-thick`, `fill`, `label`, `label-secondary`, `accent`, `accent-soft`, `focus-ring` e tokens dos componentes compostos. Nenhuma cor própria. Geometria em `tokens.json › community`; espaços em `space-*`, cantos em `radius-*`, sombras em `shadow-card`. Compatível com Sólido claro (areia), Sólido escuro, Vidro claro e Vidro escuro.

Use elementos nativos, rótulos explícitos, foco visível e alvos de 44 px. Controles não dependem de hover. Estados de carregamento, vazio e erro pertencem ao container e usam CarregamentoSala/EstadoSecao. Esconder ação não confere permissão: sessão, papel e posse são verificados no servidor nas fases seguintes.

[Exemplo gerado](../../exemplos/LinhaComentario.html). Fonte: `preview.html`; comportamento de demonstração: `../Comunidade/demo.js`. Gere com `node design-system/scripts/build.mjs`. React em `portal/src/components/ds/` emite as mesmas classes, com dados e callbacks do consumidor; não importa o JavaScript de demonstração.
