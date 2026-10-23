# Imagens do portal

Imagens usadas pelo portal. Quando uma imagem não existe, a peça mostra a placa da marca com o arco.

## Pastas e formatos

| Pasta | O que vai | Nome do arquivo | Proporção de exibição |
| --- | --- | --- | --- |
| `banner/` | Slides do banner rotativo do Portal (marca, episódios) | `<id-do-slide>.webp` | área de mídia do banner, recortada com `object-fit: cover` |
| `salas/` | Capa de cada Sala (card e cabeçalho) | `<slug-da-sala>.webp` | 16:10 |
| `episodios/` | Miniatura dos episódios do canal | `<id-do-video>.webp` | 16:9 |
| `anuncios/` | Peças dos anunciantes | `<id-do-anuncio>.webp` | 5:2 (banner rotativo); no painel do Portal a peça cobre a célula inteira sob um véu, então deixe o assunto no centro |
| `conteudos/` | Miniatura de artigos e fontes | `<slug-do-conteudo>.webp` | 4:3 |

## Tratamento de cor

Toda imagem recebe o duotone da marca: escala de cinza com autocontraste (1%) mapeada de grafite `#111313` a bege `#F6E7CE`. Isso tira cores fora da paleta (como o roxo de algumas gravuras) e deixa o conjunto coerente. Para uma imagem nova:

```bash
python3 scripts/duotone-imagens.py <original> public/imagens/<pasta>/<nome>.webp
```

O comando é rodado de dentro de `portal/` e precisa de Python 3 com Pillow. Os originais ficam em `docs/imagens-originais/`, fora do que o portal publica.

## Manifesto das imagens recebidas (07 out 2026)

| Arquivo no portal | Original | O que mostra | Texto alternativo | Foco (`object-position`) | Origem e direitos |
| --- | --- | --- | --- | --- | --- |
| `banner/marca.webp` | `estudioso-no-atril-gravura.webp` | Estudioso de manto lendo um grande livro aberto num atril, com ampulheta e esfera armilar no chão | "Gravura de um estudioso lendo um grande livro aberto num atril, ao lado de uma janela gótica" | `55% 35%` | Gravura do séc. XIX; autoria a confirmar (assinatura no canto inferior direito) |
| `banner/v-poimandres.webp`, `episodios/v-poimandres.webp` | `astronomo-alexandria-gravura-colorida.webp` | Astrônomo observando as estrelas com uma balestilha, ao lado de uma esfera armilar, num terraço de templo egípcio | "Gravura de um astrônomo que mede as estrelas com uma balestilha num terraço de templo egípcio" | `50% 30%` | Gravura colorida do séc. XIX; atribuição a confirmar |
| `banner/v-caibalion-principios.webp`, `episodios/v-caibalion-principios.webp`, `conteudos/sete-principios-hermeticos.webp` | `grande-simbolo-de-salomao-levi.webp` | "O grande símbolo de Salomão": uma figura e seu reflexo invertido na água, dentro de um ouroboros | "Gravura de uma figura coroada e seu reflexo invertido na água, dentro de uma serpente que morde a própria cauda" | `50% 45%` | Éliphas Lévi, *Dogme et rituel de la haute magie* (1854–1856), domínio público; a coloração é posterior, autoria a confirmar |
| `salas/corpus-hermeticum.webp` | `observatorio-alexandria-gravura.png` | Astrônomo diante de uma grande esfera armilar e de um globo celeste, num observatório com esfinges e pirâmides ao fundo | "Gravura de um astrônomo junto a uma esfera armilar num observatório egípcio, com pirâmides ao fundo" | `45% 55%` | Gravura do séc. XIX, frequentemente identificada como Hiparco em Alexandria; a confirmar |
| `salas/caibalion.webp` | `templo-alquimico-sete-degraus-pintura.webp` | Templo alquímico no alto de sete degraus com os nomes das operações (calcinação, sublimação, solução, putrefação, destilação, coagulação, tintura) | "Pintura de um templo no alto de sete degraus, cada um com o nome de uma operação alquímica" | `50% 60%` | Pintura alquímica, provavelmente séc. XVII; acervo e autoria a confirmar |
| `salas/urantia.webp` | `figura-subindo-escada-estrela.webp` | Figura de manto subindo uma longa escada entre rochedos, sob um céu estrelado | "Ilustração de uma figura de manto que sobe uma longa escada entre rochedos, sob um céu estrelado" | `50% 70%` | Ilustração contemporânea de autoria desconhecida, possivelmente gerada por IA. **Direitos a confirmar antes de publicar** |

## Recebida com o layout do Figma (20 out 2026)

| Arquivo no portal | Original | O que mostra | Texto alternativo | Foco | Origem e direitos |
| --- | --- | --- | --- | --- | --- |
| `banner/marca-colunata.webp` (slide de marca do Portal) | `colunata-gravura-figma.png` | Colunata monumental vista entre colunas em primeiro plano, com figuras pequenas num pátio | "Gravura de uma colunata monumental vista entre colunas em primeiro plano, com figuras pequenas no pátio" | `60% 50%` | Gravura arquitetônica tirada do arquivo do Figma, provavelmente séc. XVIII–XIX. **Autoria e direitos a confirmar antes de publicar.** A anterior (`banner/marca.webp`) fica como reserva. |

## Ainda faltam

- `salas/nag-hammadi.webp` e `salas/apocrifos-cristianismo-primitivo.webp`
- `episodios/v-nag-hammadi-descoberta.webp`, `episodios/v-urantia-mansoes.webp` e `episodios/v-evangelho-maria.webp`
- todas as peças de `anuncios/`
- miniaturas dos demais conteúdos

As imagens recebidas têm no máximo 736 px de largura. Servem bem nos cards, mas ficam suaves no banner em telas grandes. Troque por versões com 2000 px ou mais quando houver.

## Regras da marca

Ver `design-system/DIRETRIZES.md`, seção Imagem. Gravuras, pinturas e documentos de época, livros, manuscritos, arquitetura de biblioteca, mãos e gestos de estudo. Elementos astronômicos (sol, lua, estrelas) são aceitos quando fazem parte de uma imagem histórica. Nunca como decoração mística: cristais, mandalas, velas, fumaça, gradiente roxo. Toda imagem mostra o crédito quando ele é conhecido e só vai ao ar com o direito de uso confirmado.
