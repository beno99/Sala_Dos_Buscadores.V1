# Cabeçalho da Sala

Abre a página de uma Sala: o nome grande à esquerda; à direita, a descrição e, embaixo, quem mantém a Sala e os dados dela.

## Anatomia
- `header.sdb-roomhead` (sem papel de região: o `h1` dentro dele já nomeia a página). Na largura toda do container do conteúdo. Duas colunas de mesma largura, com `--space-8` entre elas.
- `.sdb-roomhead__titles` (esquerda):
  - `p.sdb-meta` (secundário): "Sala · {tradição}" na Sala oficial ("Sala · Hermetismo greco-egípcio · séc. I–III"); só "Sala de anfitrião" na de anfitrião, porque o nome já está na assinatura.
  - `h1.sdb-large-title.sdb-roomhead__title`: o nome da Sala. Único `h1` da página (o título da barra superior é um `p`). Nunca truncado.
- `.sdb-roomhead__side` (direita): começa na altura do rótulo e espalha o conteúdo até a base do título.
  - `p.sdb-body-sm.sdb-roomhead__desc`: a descrição da Sala.
  - `.sdb-roomhead__line`: a linha de assinatura e dados, que quebra quando falta espaço, nesta ordem:
    1. **Sala de anfitrião:** `.sdb-roomhead__author` com o `Avatar` (iniciais, 40 px, `aria-hidden`), `.sdb-roomhead__who` (nome em `a.sdb-roomhead__name` para `/anfitrioes/[slug]` e a credencial em `span.sdb-footnote`) e o Selo de proveniência "Anfitrião".
       **Sala oficial:** sem assinatura (ela não tem um autor; o espaço é só do anfitrião). No lugar, `.sdb-roomhead__actions` com "Perguntar ao assistente sobre esta Sala" (`sdb-btn--tinted sdb-btn--sm`, ícone `ia`), só quando a Sala está na comparação. O texto do botão quebra a linha se precisar; nunca é cortado.
    2. `dl.sdb-roomhead__meta`: pares rótulo e valor numa linha (rótulo secundário, valor em `label`): "Nível predominante" com o Selo de nível simples (`sdb-level--plain`), "Período" e "Publicada em" com a data da primeira publicação. Sem ela, "Atualizada em".
    3. **Sala de anfitrião com site:** `.sdb-roomhead__actions` com "Site da Sala" (`sdb-btn--secondary sdb-btn--sm`, ícone `externo`, nova aba).
- `a.sdb-roomhead__back` (opcional, antes do cabeçalho): "‹ Salas", botão secundário pequeno com `chevronEsquerda`. Só aparece abaixo de 900 px de janela, quando a [Barra superior](../BarraSuperior/README.md) esconde a trilha.

## Responsivo
Decide pelo container (coloque o cabeçalho dentro de um elemento com `container-type: inline-size`). Abaixo de 900 px de container, empilha: rótulo, título, descrição, assinatura e dados.

## Regras
- Não repita aqui a trilha nem a contagem do acervo: as contagens ficam no filtro de níveis e nos títulos das seções.
- A data vai em português e por extenso abreviado ("3 set 2026").
- Assinatura com Avatar de iniciais é exclusiva da Sala de anfitrião; o nome é link para a página pública dele.
- Logo abaixo vem o [Banner da Sala](../BannerSala/README.md).
