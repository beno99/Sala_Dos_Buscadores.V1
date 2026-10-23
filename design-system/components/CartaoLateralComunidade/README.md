# Cartão lateral de comunidade

## Anatomia

`section.sdb-community-side`. Cabeçalho com título identificado por `aria-labelledby`; corpo composto de LinhaPessoa, busca compacta, ChipTema e listas. Quatro montagens: Sua conta, Encontrar pessoas, Em debate nesta semana, Quem você acompanha.

## Uso e estados

Sua conta usa IndicadorNumerico em `.sdb-community-side__numbers`, três colunas: Publicações, Seguidores, Seguindo. São contagens contextuais, nunca placar. O nível é por assunto. Busca deve anunciar quantidade em role=status, sem revelar dados privados. Em debate mostra temas e Sala de origem, nunca pessoas por curtidas. A grade passa a uma coluna no celular; mantém todos os quatro cartões.

## Temas, acessibilidade e contrato

Cores: `material-regular`, `material-thick`, `fill`, `label`, `label-secondary`, `accent`, `accent-soft`, `focus-ring` e tokens dos componentes compostos. Nenhuma cor própria. Geometria em `tokens.json › community`; espaços em `space-*`, cantos em `radius-*`, sombras em `shadow-card`. Compatível com Sólido claro (areia), Sólido escuro, Vidro claro e Vidro escuro.

Use elementos nativos, rótulos explícitos, foco visível e alvos de 44 px. Controles não dependem de hover. Estados de carregamento, vazio e erro pertencem ao container e usam CarregamentoSala/EstadoSecao. Esconder ação não confere permissão: sessão, papel e posse são verificados no servidor nas fases seguintes.

[Exemplo gerado](../../exemplos/CartaoLateralComunidade.html). Fonte: `preview.html`; comportamento de demonstração: `../Comunidade/demo.js`. Gere com `node design-system/scripts/build.mjs`. React em `portal/src/components/ds/` emite as mesmas classes, com dados e callbacks do consumidor; não importa o JavaScript de demonstração.
