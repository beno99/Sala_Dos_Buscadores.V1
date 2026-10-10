# Espaço publicitário

Anúncio identificado, em três versões: painel (dentro do Painel de progresso do Portal), coluna e banner. Também entra como slide do Banner rotativo.

## Anatomia
- `aside.sdb-ad` (`aria-label="Publicidade"`) com `--painel`, `--column` ou `--banner`.
- `.sdb-ad__head`: `.sdb-ad__label` "Publicidade" (sempre visível) e `.sdb-ad__advertiser` com o nome do anunciante.
- `.sdb-ad__media`: imagem `<img alt="">` de `portal/public/imagens/anuncios/` (cheia no painel, 4:5 na coluna, 5:2 no banner) ou a placa da marca.
- `.sdb-ad__title` (Inter, nunca a serifa editorial), `.sdb-ad__text` e `.sdb-ad__foot` com o link do anunciante (`rel="sponsored noopener"`, ícone `externo`) e "Por que estou vendo isto?", que abre a política num Modal.

## Regras
- Política (DRS): curadoria editorial; vedados charlatanismo, promessa de cura e manipulação religiosa.
- Visual distinto do acervo: fundo `fill` com contorno, sem sombra de card, sem Selo de proveniência, sem contorno tracejado de IA.
- Nunca dentro da Grade comparativa, das respostas do assistente ou da leitura de um conteúdo.
- Sem contagem regressiva, urgência ou exclamação.
- Nos exemplos, só anunciantes fictícios marcados como tais ("Edições Pórtico (anunciante fictício)"). Nenhuma marca real.

## Variante painel (`--painel`)
- Mora em `.sdb-panel__ad`, na altura toda da linha de leitura do Painel de progresso, e encosta nas bordas da célula. O contêiner recorta o canto externo, então só o canto inferior direito acompanha o raio dele; os outros cantos são internos.
- `.sdb-ad__media` cobre a célula: a peça do anunciante (`portal/public/imagens/anuncios/<id>.webp`, com o duotone da marca) ou a placa bordô ou grafite com o arco. Por cima, um véu em degradê de `veil-media` a `veil-media-deep`; o texto em `on-media` passa AA mesmo sobre a luz mais clara do duotone (`contraste.mjs` confere). Com `prefers-reduced-transparency`, o véu fica opaco.
- Conteúdo: `.sdb-ad__head` no topo, à esquerda, sempre visível ("Publicidade" em cápsula clara e o anunciante); `.sdb-ad__center` centralizado com o título (Inter), o texto, até duas cápsulas `.sdb-ad__attrs` > `.sdb-ad__attr` com ícone ("Domínio público", "Notas de tradução"), o botão claro em cápsula `.sdb-btn.sdb-btn--lg.sdb-ad__cta` (ícone `externo`, `rel="sponsored noopener"`, nova aba) e `.sdb-ad__why` "Por que estou vendo isto?".

### Por que ela pode encostar nas bordas e ter imagem cheia
No painel, todo conteúdo editorial é linha ou item compacto, nunca card com imagem. A única área com imagem cheia é o anúncio, então a diferença de forma já separa publicidade de acervo. Além disso o rótulo "Publicidade" e o anunciante ficam sempre visíveis no topo, e o anúncio não tem Selo de proveniência nem o tracejado da IA, que marcam conteúdo do acervo.
