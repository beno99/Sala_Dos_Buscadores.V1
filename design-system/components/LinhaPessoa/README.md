# Linha de pessoa

## Anatomia

`div.sdb-person`. Avatar + `.sdb-person__body` (nome público em link, Badge opcional e contexto de estudo) + ação Seguir separada do link.

## Uso e estados

Nome longo quebra sem encobrir ação. Foto só enviada pela pessoa; sem foto, iniciais. Nunca convicção, e-mail, conquistas, histórico ou interesses privados. Seguir usa `aria-pressed`; o nome acessível muda para “Deixar de seguir {nome}”. Anfitrião aponta para /anfitrioes/<slug>; os links do catálogo abrem peças da biblioteca, sem simular rotas prontas.

## Temas, acessibilidade e contrato

Cores: `material-regular`, `material-thick`, `fill`, `label`, `label-secondary`, `accent`, `accent-soft`, `focus-ring` e tokens dos componentes compostos. Nenhuma cor própria. Geometria em `tokens.json › community`; espaços em `space-*`, cantos em `radius-*`, sombras em `shadow-card`. Compatível com Sólido claro (areia), Sólido escuro, Vidro claro e Vidro escuro.

Use elementos nativos, rótulos explícitos, foco visível e alvos de 44 px. Controles não dependem de hover. Estados de carregamento, vazio e erro pertencem ao container e usam CarregamentoSala/EstadoSecao. Esconder ação não confere permissão: sessão, papel e posse são verificados no servidor nas fases seguintes.

[Exemplo gerado](../../exemplos/LinhaPessoa.html). Fonte: `preview.html`; comportamento de demonstração: `../Comunidade/demo.js`. Gere com `node design-system/scripts/build.mjs`. React em `portal/src/components/ds/` emite as mesmas classes, com dados e callbacks do consumidor; não importa o JavaScript de demonstração.
