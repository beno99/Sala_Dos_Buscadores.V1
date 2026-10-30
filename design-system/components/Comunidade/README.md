# Comunidade — montagem de referência

## Anatomia

`div.sdb-community`. `.sdb-community__layout` contém `__feed` e `__aside`. O feed inclui Tabs Para você/Seguindo, busca, neutralidade dispensável, compositor e quatro tipos de publicação. A lateral compõe quatro CartaoLateralComunidade.

## Uso e estados

Abra o exemplo integrado e alterne os quatro temas pelo catálogo ou `?tema=solido-claro|solido-escuro|vidro-claro|vidro-escuro`. Abaixo de 900 px de container a lateral desce; abaixo de 600 px vira coluna única, com compositor no fluxo e tipos em duas linhas. O catálogo é demonstração: ações não persistem nem enviam dados. Nenhum ícone de mensagens diretas foi incluído. Fases B/C/D cuidam respectivamente de leitura, escrita e moderação.

## Temas, acessibilidade e contrato

Cores: `material-regular`, `material-thick`, `fill`, `label`, `label-secondary`, `accent`, `accent-soft`, `focus-ring` e tokens dos componentes compostos. Os papéis de cor específicos são isolados em `community-*`. Geometria em `tokens.json › community`; espaços em `space-*`, cantos em `radius-*`, sombras em `shadow-card`. Compatível com Sólido claro (areia), Sólido escuro, Vidro claro e Vidro escuro.

Use elementos nativos, rótulos explícitos, foco visível e alvos de 44 px. Controles não dependem de hover. Estados de carregamento, vazio e erro pertencem ao container e usam CarregamentoSala/EstadoSecao. Esconder ação não confere permissão: sessão, papel e posse são verificados no servidor nas fases seguintes.

[Exemplo gerado](../../exemplos/Comunidade.html). Fonte: `preview.html`; comportamento de demonstração: `../Comunidade/demo.js`. Gere com `node design-system/scripts/build.mjs`. React em `portal/src/components/ds/` emite as mesmas classes, com dados e callbacks do consumidor; não importa o JavaScript de demonstração.

## Verificação da demonstração

Execute `node --test design-system/scripts/test-comunidade.cjs` após instalar as dependências do portal. Os testes conferem referências acessíveis, campos obrigatórios por tipo, limite de temas, comentário vazio e contagem acessível das curtidas. A prévia não exige login; seus personagens não são contas do portal.

## Integração no portal

A grade limita a largura à soma dos tokens de feed, lateral e espaçamento; em molduras largas não deixa um intervalo vazio entre as colunas. Na etapa de leitura, a apresentação dos tipos é informativa e os botões que exigem persistência ficam desabilitados. Busca, abas, leitura de comentários e links continuam operáveis.

## Refinamento visual · 29/10/2026

Referências inspecionadas: Figma `WtsqtkYXDtEKBZ3pYiBOE4`, desktop `103:615`, mobile `104:710`, comentários/composição `104:574` e biblioteca editável `104:933`. O CSS canônico complementar é `../Comunidade/comunidade.css`, carregado **depois** de `refinement.css`; os exemplos são gerados pelo build. Tokens `community-*` em `tokens.json`: superfície branca/escura opaca, interior neutro, contorno discreto, contexto lilás de pergunta, ritmo de 20 px e geometria de 776/352 px. General Sans e Gambetta são locais e ficam restritas à família Comunidade. Botões usam raio de 12 px; cards 24 px, interiores 16 px, tags 8 px. Os níveis mantêm os tokens aprovados e seus rótulos.

Os temas de vidro também usam cards sólidos nesta família. Não substituir globalmente os materiais do portal. O texto dourado foi ajustado de #8B652F para #825D29 no tema claro para atingir AA sobre areia e sobre o aviso. Ícones de coração, comentário e citação foram exportados do Figma e ficam em `Comunidade/assets`, como máscaras que acompanham o token de texto.

O portal conecta publicação, comentários, reações, salvar, seguir, denúncia e moderação em `portal/src/server/comunidade/`. Os formulários interativos do catálogo continuam sendo demonstração.
