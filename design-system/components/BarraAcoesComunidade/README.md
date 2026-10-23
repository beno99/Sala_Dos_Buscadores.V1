# Barra de ações da comunidade

## Anatomia

`div.sdb-community-actions[role=group]`. Botões `.sdb-community-actions__button`: Curtir, Comentar, Reagir e Salvar (alinhado à direita). `.sdb-community-actions__reactions` contém Útil, Me fez pensar e Quero aprofundar.

## Uso e estados

Use ícones existentes `util`, `assistente`, `mais`, `estante`, `glossario`, `busca`. Sem emoji. Curtir/Salvar/Reações usam aria-pressed; Reagir usa aria-expanded e aria-controls. Contagens entram no nome acessível (“Curtir, 5 curtidas”). Alvo mínimo community-touch (44 px), mola curta e interrompível em transform; prefers-reduced-motion elimina transformação. Callback/estado no React; o catálogo simula apenas estado local.

## Temas, acessibilidade e contrato

Cores: `material-regular`, `material-thick`, `fill`, `label`, `label-secondary`, `accent`, `accent-soft`, `focus-ring` e tokens dos componentes compostos. Nenhuma cor própria. Geometria em `tokens.json › community`; espaços em `space-*`, cantos em `radius-*`, sombras em `shadow-card`. Compatível com Sólido claro (areia), Sólido escuro, Vidro claro e Vidro escuro.

Use elementos nativos, rótulos explícitos, foco visível e alvos de 44 px. Controles não dependem de hover. Estados de carregamento, vazio e erro pertencem ao container e usam CarregamentoSala/EstadoSecao. Esconder ação não confere permissão: sessão, papel e posse são verificados no servidor nas fases seguintes.

[Exemplo gerado](../../exemplos/BarraAcoesComunidade.html). Fonte: `preview.html`; comportamento de demonstração: `../Comunidade/demo.js`. Gere com `node design-system/scripts/build.mjs`. React em `portal/src/components/ds/` emite as mesmas classes, com dados e callbacks do consumidor; não importa o JavaScript de demonstração.
