# Corpo do artigo

O texto de um conteúdo em blocos, na ordem gravada pela curadoria ou pelo anfitrião, e a leitura em duas colunas que o acompanha na página do artigo.

## Blocos
`div.sdb-articlebody` (com `data-leitura`, que o progresso de leitura mede) contém, em qualquer ordem depois do lead:

| Bloco | Marcação | Forma |
| --- | --- | --- |
| Lead | `p.sdb-articlebody__lead` | O primeiro parágrafo. Letra de leitura maior (22 px; 19 px abaixo de 520 px de container), peso médio. Sempre o primeiro bloco. |
| Parágrafo | `p.sdb-body` | Leitura 19/1.6, com as marcações do texto marcado: `strong` (`**negrito**`), `dfn` (`*termo*`), `cite` (`::obra::`), link (`[texto](endereço)`, só https) e a chamada de fonte `[n]` em `.sdb-ref`, na ordem das obras citadas. |
| Intertítulo | `h2.sdb-title-2` | Abre um novo trecho. Um pouco mais de espaço antes. |
| Destaque | `figure.sdb-pullquote` > `span.sdb-pullquote__mark` + `div` > `blockquote` + `figcaption.sdb-footnote` | Entre dois filetes (`--separator`), aspa grande em `label-tertiary` (nunca ouro), frase em Fraunces 30 px (24 px no celular), atribuição obrigatória embaixo. |
| Imagem | `figure.sdb-articlebody__figure` > `img` + `figcaption.sdb-footnote` | Na largura da coluna, cantos `--radius-lg`. Texto alternativo e crédito obrigatórios; a legenda é opcional e vem antes do crédito, cada um num `span`. |

Ritmo: `--space-5` entre blocos; intertítulo, destaque e imagem ganham mais respiro antes.

## Destaque ou Bloco de citação?
- **Destaque** é uma frase do próprio artigo, ou da fonte que ele cita, repetida em tamanho grande para marcar a ideia do trecho. Sempre com atribuição ("*O Caibalion*, cap. II (1908), em tradução da equipe"). Nunca uma frase de fora do assunto, nem uma citação célebre decorativa.
- **[Bloco de citação](../BlocoCitacao/README.md)** é o trecho de fonte primária, com original, tradução, referência completa e "Copiar citação". Fica na coluna lateral ("Trecho de fonte primária"), não no meio do texto.

## Leitura em duas colunas
`article.sdb-article` organiza a página:
- `h1.sdb-large-title.sdb-article__title`: o título, nunca truncado.
- `.sdb-article__byline`: a [Autoria do conteúdo](../AutoriaConteudo/README.md).
- `.sdb-article__body`: o corpo (até 46rem, alinhado à esquerda; o que sobra fica à direita).
- `aside.sdb-article__extras`: blocos `section.sdb-article__block` ("Vídeos do assunto" em `.sdb-article__videos`, "Trecho de fonte primária", "Fontes" em `.sdb-article__stack`), com `--space-8` entre eles. Cada bloco some quando está vazio.

A ordem no HTML é título, autoria, texto e extras: é a ordem do leitor de tela e do celular. No desktop a grade usa as áreas `"autor titulo" "autor texto" "extras texto"` e as linhas `auto auto 1fr`, então o título fica alinhado ao topo da autoria e os extras começam logo abaixo dos dados. Lateral de 20rem, `--space-8` entre as colunas.

Abaixo de ~900 px de container vira uma coluna: título, autoria, texto, vídeos (grade automática de no mínimo ~17rem), trecho e fontes. A peça decide pelo container mais próximo (`container-type: inline-size` no conteúdo da página).

## Continuar a busca
Na largura toda, depois da leitura: `section.sdb-carousel.sdb-article__continue` (filete em cima e `--space-8` de respiro). O [Carrossel](../Carrossel/README.md) com título em `title-1`, legenda "Outros conteúdos sobre {temas} · primeiro das outras Salas", "Ver todos" (botão `plain` pequeno com chevron) antes das setas, e entre o cabeçalho e o trilho os chips "Comparar: {tema}" e "Perguntar ao assistente" (`.sdb-carousel__chips`). Sem relacionados, o trilho e as setas somem e ficam os chips e o assistente.

## Regras
- Imagens só de domínio público, de licença aberta ou enviadas pelo anfitrião com o aceite registrado; nunca geradas por IA. Atribuição incerta fica incerta.
- Texto alinhado à esquerda; sem capitular, sem caixa-alta nos títulos.
- A nota de divergência ([Alerta](../Alerta/README.md) de aviso) e "Ler no site" vêm depois dos blocos, no fim da coluna do texto.
