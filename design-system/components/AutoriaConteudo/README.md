# Autoria do conteúdo

A coluna estreita da página de leitura: quem assina, um filete e os dados do conteúdo em linhas, com o rótulo à esquerda e o valor à direita. Fica à esquerda do texto, no topo da [leitura em duas colunas](../CorpoArtigo/README.md).

## Anatomia
- `section.sdb-authorship[aria-label="Autoria e dados"]`.
- `.sdb-authorship__who`: o [Avatar](../Avatar/README.md) de iniciais (48 px, dado pela peça) e, ao lado, `.sdb-authorship__name` (`headline`) com `.sdb-footnote.sdb-authorship__cred` embaixo. O filete (`--separator`) fecha o bloco.
- `dl.sdb-authorship__data`: uma `div` por dado, `dt` em semibold à esquerda e `dd` à direita. O `dd` quebra linha à direita quando o valor tem várias peças (Badges de tema).
- `dd.sdb-authorship__help`: a explicação do Selo de proveniência, um segundo `dd` na mesma linha, que quebra para baixo dela.

## Dados, nesta ordem
1. "Publicado em": `time` com a data.
2. "Leitura" ("9 min"); num vídeo, "Duração".
3. "Período", só se houver.
4. "Nível": [Selo de nível](../SeloNivel/README.md) simples (`--plain`).
5. "Temas": [Badges](../Badge/README.md) neutros.
6. "Proveniência": [Selo de proveniência](../SeloProveniencia/README.md), obrigatório, e a explicação embaixo.
7. "Compartilhar": o [botão de compartilhar](../Botao/README.md#compartilhar).

A Sala e o formato não entram: a Sala já está na trilha da barra superior e o formato é evidente.

## Variações
| Variação | O que muda |
| --- | --- |
| Curadoria | Avatar bordô; nome da equipe e "Curadoria". |
| Especialista | Avatar bordô; nome e credencial verificada. |
| Fonte primária | Avatar suave (`--soft`); a autoria declarada do documento ("Três Iniciados", "Autoria declarada, 1908"). |
| Anfitrião | O nome é um link (`a.sdb-authorship__name`) para a página pública do anfitrião. |

## Regras
- A autoria é texto com iniciais, nunca foto, nem ícones de redes sociais.
- Rótulos em português, verbo ou substantivo exato; sem "Date", "Read", "Share".
- Na leitura em uma coluna (abaixo de ~900 px de container), a peça ocupa a largura toda, logo abaixo do título.
