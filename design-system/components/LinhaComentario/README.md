# Linha de comentário

## Anatomia

`article.sdb-comment`. Avatar pequeno, `.sdb-comment__body` com autoria, Badge Anfitrião, texto e `.sdb-comment__meta` (time, Responder, Curtir).

## Uso e estados

`.sdb-comment--host` destaca resposta de anfitrião em Pergunta; não se aplica automaticamente a todo comentário. `.sdb-comment--reply` recua somente um nível. `.sdb-comment__helped` mostra “Resposta que ajudou” com ícone check e palavra. Até 600 caracteres; contador apenas a partir de 480. Ordenação, posse e quem pode marcar a resposta pertencem ao consumidor/servidor. Texto é escapado, nunca HTML.

## Temas, acessibilidade e contrato

Cores: `material-regular`, `material-thick`, `fill`, `label`, `label-secondary`, `accent`, `accent-soft`, `focus-ring` e tokens dos componentes compostos. Nenhuma cor própria. Geometria em `tokens.json › community`; espaços em `space-*`, cantos em `radius-*`, sombras em `shadow-card`. Compatível com Sólido claro (areia), Sólido escuro, Vidro claro e Vidro escuro.

Use elementos nativos, rótulos explícitos, foco visível e alvos de 44 px. Controles não dependem de hover. Estados de carregamento, vazio e erro pertencem ao container e usam CarregamentoSala/EstadoSecao. Esconder ação não confere permissão: sessão, papel e posse são verificados no servidor nas fases seguintes.

[Exemplo gerado](../../exemplos/LinhaComentario.html). Fonte: `preview.html`; comportamento de demonstração: `../Comunidade/demo.js`. Gere com `node design-system/scripts/build.mjs`. React em `portal/src/components/ds/` emite as mesmas classes, com dados e callbacks do consumidor; não importa o JavaScript de demonstração.

## Refinamento visual · 29/10/2026

Referências inspecionadas: Figma `WtsqtkYXDtEKBZ3pYiBOE4`, desktop `103:615`, mobile `104:710`, comentários/composição `104:574` e biblioteca editável `104:933`. O CSS canônico complementar é `../Comunidade/comunidade.css`, carregado **depois** de `refinement.css`; os exemplos são gerados pelo build. Tokens `community-*` em `tokens.json`: superfície branca/escura opaca, interior neutro, contorno discreto, contexto lilás de pergunta, ritmo de 20 px e geometria de 776/352 px. General Sans e Gambetta são locais e ficam restritas à família Comunidade. Botões usam raio de 12 px; cards 24 px, interiores 16 px, tags 8 px. Os níveis mantêm os tokens aprovados e seus rótulos.

Os temas de vidro também usam cards sólidos nesta família. Não substituir globalmente os materiais do portal. O texto dourado foi ajustado de #8B652F para #825D29 no tema claro para atingir AA sobre areia e sobre o aviso. Ícones de coração, comentário e citação foram exportados do Figma e ficam em `Comunidade/assets`, como máscaras que acompanham o token de texto.

O portal deste checkout oferece **leitura**: busca, abas, perfis, links, expansão e painel de comentários. Publicação, resposta, seguir, reações e salvar ainda não possuem serviço de escrita conectado; os controles indisponíveis não simulam persistência. Os formulários interativos do catálogo são apenas demonstração e não foram transportados para produção.
