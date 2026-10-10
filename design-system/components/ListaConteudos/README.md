# Lista de conteúdos

Conteúdos do acervo em linhas, sem card: uma tabela leve para listas curtas (publicados, sugestões) e um item compacto para retomar ou começar uma leitura.

## Lista em linhas
- `ul.sdb-rows` com um `li` por conteúdo. Cada `li` tem um único `a.sdb-rows__link` que ocupa a linha inteira.
- Dentro do link: `.sdb-rows__text` com `.sdb-rows__title` (serifa do acervo, 18 px) e `.sdb-rows__meta` ("Sala · Tipo · publicado em 3 out 2026"); o Selo de proveniência compacto (`.sdb-seal--sm`), obrigatório; e o chevron `.sdb-rows__go` (`aria-hidden`).
- Divisórias recuadas de 16 px, como na lista agrupada. Somem em volta da linha sob o ponteiro ou com foco.
- Linha final opcional `a.sdb-rows__link.sdb-rows__link--more` ("Ver tudo na Biblioteca"), em `accent`.
- Sem card, sem sombra, sem miniatura. Abaixo de 560 px o selo desce para baixo da meta.

## Item compacto
- `ul.sdb-entries` > `li` > `div.sdb-entry`: `.sdb-entry__thumb` (imagem `alt=""` ou a placa da marca com o arco), `.sdb-entry__body` com `.sdb-entry__where` ("Artigo · O Livro de Urântia"), `h4.sdb-entry__title` com `a.sdb-entry__link` (o link cobre o item todo), progresso opcional e a ação.
- Raio concêntrico: item `radius-md` (16) com respiro de 8 px, miniatura `radius-xs` (8).
- Progresso: `.sdb-entry__progress` com `.sdb-progress__track` (decorativa, `aria-hidden`) e o texto "Lido até 50%", que carrega a informação.
- Ação: `.sdb-resume-cta` com o verbo exato ("Retomar leitura", "Começar a leitura") e o ícone `seta`.

## Regras
- Um link por linha ou item; o título dá o nome acessível.
- Foco visível dentro da linha (contorno recuado), para não ser cortado por um contêiner que recorta.
- Movimento só na resposta: fundo `accent-soft` ao passar ou pressionar e o chevron andando 3 px.
- Nada de anúncio no formato de linha: publicidade nunca imita conteúdo editorial.
