# Cartão de publicação

## Anatomia

`article.sdb-post`. Cabeçalho `.sdb-post__head` com Avatar, `.sdb-post__identity`, nome, tempo em `time[datetime]`, SeloNivel contextualizado por Sala, Badge Anfitrião e Menu. A identificação `.sdb-post__origin` é texto simples. Em seguida: chips, imagem opcional, BarraAcoesComunidade, texto, bloco do tipo e duas prévias de comentário.

## Uso e estados

Use `data-collapsed="true"` em `.sdb-post__text` para três linhas; botão com `aria-expanded` e `aria-controls` revela o texto inteiro. A imagem usa `community-media-ratio` (4:3), alt descritivo e crédito. O achado usa CardConteudo com `.sdb-community-linked`; citação usa BlocoCitacao. Nunca aplique selo editorial à publicação; a fonte declarada leva “Fonte informada pelo autor”. O Menu do exemplo é de leitor; Editar/Excluir só aparecem para o autor quando o servidor autorizar.

## Temas, acessibilidade e contrato

Cores: `material-regular`, `material-thick`, `fill`, `label`, `label-secondary`, `accent`, `accent-soft`, `focus-ring` e tokens dos componentes compostos. Nenhuma cor própria. Geometria em `tokens.json › community`; espaços em `space-*`, cantos em `radius-*`, sombras em `shadow-card`. Compatível com Sólido claro (areia), Sólido escuro, Vidro claro e Vidro escuro.

Use elementos nativos, rótulos explícitos, foco visível e alvos de 44 px. Controles não dependem de hover. Estados de carregamento, vazio e erro pertencem ao container e usam CarregamentoSala/EstadoSecao. Esconder ação não confere permissão: sessão, papel e posse são verificados no servidor nas fases seguintes.

[Exemplo gerado](../../exemplos/CardPublicacao.html). Fonte: `preview.html`; comportamento de demonstração: `../Comunidade/demo.js`. Gere com `node design-system/scripts/build.mjs`. React em `portal/src/components/ds/` emite as mesmas classes, com dados e callbacks do consumidor; não importa o JavaScript de demonstração.
