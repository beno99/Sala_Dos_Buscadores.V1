# Lista de destaques

Ranking curto de conteúdos ("Mais pesquisados") numa coluna estreita. O item apontado cresce e abre uma miniatura por cima do título; os outros encolhem e esmaecem. É ranking de conteúdo, nunca de pessoas.

## Anatomia
- `aside.sdb-toplist` com `aria-labelledby`. Fica na altura que a coluna der (`height: 100%`).
- `.sdb-toplist__head`: `h2.sdb-toplist__label` (meta em caixa alta, "Mais pesquisados") e `.sdb-toplist__caption` ("Mais pesquisados no acervo nos últimos 30 dias.").
- `ol.sdb-toplist__list[data-sdb-toplist]` com sete `li.sdb-toplist__item`, separados por filete. Cada item tem um `a.sdb-toplist__link` com `.sdb-toplist__thumb` (`aria-hidden`; `<img alt="">` ou a placa da marca com o arco), `.sdb-toplist__title` e `.sdb-toplist__meta` ("Biblioteca de Nag Hammadi · 212 buscas").
- `nav.sdb-toplist__pag`: botões de ícone "Página anterior" / "Próxima página" e "Página 1 de 3" (Paginação compacta).

## Comportamento
- `bundle.js` liga `[data-sdb-toplist]`: o item apontado pelo mouse ou com foco recebe `.is-active`, e a lista recebe `.has-active`. Em React, o estado faz o mesmo.
- Item ativo: cresce (`flex-grow` 2,6), a miniatura abre de 0 a 132 px, o título passa a `accent`. Demais itens: `flex-grow` 0,82 e 52% de opacidade.
- Movimento com a mola dos tokens (`--sdb-spring`, `--duration-spring`), por transição: é interrompível, e passar de um item a outro não espera a animação terminar.
- Itens com base natural e crescimento proporcional: numa coluna com altura, dividem o espaço; sem altura, ficam na altura natural.
- O foco por teclado produz o mesmo efeito que o mouse.
- Sem hover (`(hover: none)` ou ponteiro grosso, celular e tablet): a lista é só texto, sem miniatura, e nada expande.
- `prefers-reduced-motion`: a miniatura aparece e some sem animação.

## Regras
- Só conteúdo publicado. A meta diz a Sala e a contagem ("N buscas"), sem adjetivo: nada sugere que um conteúdo seja "mais verdadeiro" ou "melhor".
- A ordem é por contagem, decrescente; empate desfeito pelo título.
- Nunca ranking de pessoas, nem de Salas como juízo de valor.
