# Banner da Sala

A imagem da Sala na largura toda do container, logo abaixo do [Cabeçalho da Sala](../CabecalhoSala/README.md).

## Anatomia
- `figure.sdb-roombanner`.
- `.video-embed__frame`: a mesma moldura do [Card Vídeo](../CardVideo/README.md) (cantos `--radius-lg`, sombra de card, fundo `--depth-fill`), com outra proporção. Dentro dela:
  - **com imagem:** `img` inteira (`object-fit: contain`): a moldura perde a proporção fixa e a altura acompanha o arquivo, até `min(72svh, 760px)`; acima disso a imagem cabe com fundo nas laterais (revisão de 31/10/2026);
  - **sem imagem:** `.sdb-plate.sdb-plate--{cor da Sala}` com o arco (`data-arc="line"`), em traço fino no canto inferior direito, `aria-hidden`.
- `figcaption.sdb-footnote.sdb-roombanner__credit` (opcional): o crédito da imagem. "Gravura do séc. XIX, frequentemente identificada como Hiparco em Alexandria; atribuição a confirmar."

## Responsivo
Sem imagem, a placa decide pelo container: 3:1; 2:1 abaixo de 900 px; 16:10 abaixo de 520 px. Com imagem, a altura acompanha o arquivo em qualquer largura; recomendação de envio: 2.400 × 800 px (3:1).

## Regras
- Só imagens de domínio público ou enviadas pelo anfitrião; nada gerado por IA.
- O texto alternativo e o crédito vêm do item de imagens do acervo. Sem ele, `alt=""` e sem legenda: nunca invente atribuição.
- Atribuição incerta fica incerta ("frequentemente identificada como…; atribuição a confirmar").

## Inicial editorial automática (31/10/2026)

A capa de fonte e o fallback de capa de artigo usam a primeira letra ou número Unicode do próprio título, em maiúscula, ignorando pontuação e espaços iniciais. Acentos e artigos gramaticais permanecem. A inicial não é editável; sem título utilizável usa o ícone neutro da biblioteca. Imagens disponíveis têm precedência. No BannerSala a variante de artigo recebe `tituloFallback`; o banner de Sala conserva o arco.
