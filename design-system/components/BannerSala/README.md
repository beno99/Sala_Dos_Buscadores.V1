# Banner da Sala

A imagem da Sala na largura toda do container, logo abaixo do [Cabeçalho da Sala](../CabecalhoSala/README.md).

## Anatomia
- `figure.sdb-roombanner`.
- `.video-embed__frame`: a mesma moldura do [Card Vídeo](../CardVideo/README.md) (cantos `--radius-lg`, sombra de card, fundo `--depth-fill`), com outra proporção. Dentro dela:
  - **com imagem:** `img` com `object-fit: cover`; o foco vem em `style="object-position: …"` do item de imagens do acervo;
  - **sem imagem:** `.sdb-plate.sdb-plate--{cor da Sala}` com o arco (`data-arc="line"`), em traço fino no canto inferior direito, `aria-hidden`.
- `figcaption.sdb-footnote.sdb-roombanner__credit` (opcional): o crédito da imagem. "Gravura do séc. XIX, frequentemente identificada como Hiparco em Alexandria; atribuição a confirmar."

## Responsivo
Decide pelo container: 3:1; 2:1 abaixo de 900 px; 16:10 abaixo de 520 px.

## Regras
- Só imagens de domínio público ou enviadas pelo anfitrião; nada gerado por IA.
- O texto alternativo e o crédito vêm do item de imagens do acervo. Sem ele, `alt=""` e sem legenda: nunca invente atribuição.
- Atribuição incerta fica incerta ("frequentemente identificada como…; atribuição a confirmar").
