# Painel de progresso

O progresso do membro, a leitura e o anúncio num contêiner só, na grade de quatro colunas dos indicadores. Fica na página Portal, logo abaixo do cabeçalho "Seu progresso".

## Anatomia
- Cabeçalho fora do contêiner: `h2` "Seu progresso" (`title-2`), a nota "Só você vê estes números." e as ações "Como os níveis funcionam" e "Ver conquistas" (só com níveis ligados).
- `section.sdb-panel.sdb-material` com `aria-labelledby` apontando para o `h2`. Raio `radius-xl`, borda fina e sombra de card vêm do material.
- **Linha 1:** `div.sdb-stats` (`role="group"`, `aria-label="Seu progresso no acervo"`) com as quatro células `.sdb-stat` do Indicador numérico. Dentro do painel, o grupo perde o fundo e a sombra próprios; as divisórias continuam.
- **Linha 2, colunas 1–2:** `.sdb-panel__main`, com um `.sdb-panel__block` por assunto. Cada bloco tem `.sdb-panel__head` com `h3.sdb-panel__title` e `.sdb-panel__sub`, seguido de uma Lista de conteúdos. Uma divisória separa os blocos.
- **Linha 2, colunas 3–4:** `.sdb-panel__ad` com o Espaço publicitário `--painel`, na altura toda da linha, encostado nas bordas.
- Sem anúncio, `.sdb-panel__main` é o último filho e ocupa as quatro colunas.

## Blocos da coluna de leitura (Portal)
1. "Continue de onde parou" (subtítulo "Retome a leitura no ponto em que parou."): um item compacto, a leitura em andamento mais recente, com barra e "Retomar leitura". Para quem ainda não leu nada, "Comece por aqui": três itens compactos de nível iniciante, de Salas diferentes, com "Começar a leitura".
2. "Publicados recentemente" (subtítulo "Conteúdos que entraram no acervo"): lista em linhas, com 5 conteúdos e a linha final "Ver tudo na Biblioteca".
3. "Para ampliar o olhar": uma linha, com o motivo no subtítulo. É o bloco que impede a bolha de conteúdo.

## Responsivo
- **≥ 1100 px:** indicadores em 4 colunas; embaixo, leitura nas colunas 1–2 e anúncio nas 3–4. A divisória entre as duas metades cai na divisória entre o 2º e o 3º indicador.
- **De 900 a 1099 px:** indicadores em 2×2; a leitura ocupa a largura toda e o anúncio vem depois, com a largura toda e pelo menos 360 px de altura.
- **< 900 px:** igual, com respiro de 16 px abaixo de 560 px; indicadores em 1 coluna abaixo de 480 px. As divisórias verticais viram horizontais.
- Os pontos de quebra são os do painel agrupado (`.sdb-stats`).

## Regras
- O contêiner é posicionado e recorta o que passa da borda. Assim, elementos absolutos, como o texto só para leitor de tela (`.sdb-sr`), não escapam e não alargam a página no celular.
- O número e o texto dos indicadores carregam a informação; barras só complementam.
- Os conteúdos editoriais do painel são sempre linhas ou itens compactos, nunca cards. Só o anúncio tem imagem cheia, o que o separa do acervo à primeira vista.
- Progresso privado: sem ranking, pontos, nível global nem comparação entre pessoas. Sem "Continue assim!" ou exclamações.
- Carregando: o mesmo contêiner com esqueletos (`.sdb-skel`) nos indicadores, nas linhas e na célula do anúncio.
