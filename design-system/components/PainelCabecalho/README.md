# Painel de cabeçalho

Abre uma seção grande do portal (Biblioteca): diz o que a página reúne e junta, à direita, os controles que mudam o que aparece abaixo.

## Anatomia
- `section.sdb-pagehead.sdb-card` com `aria-labelledby` no título. Na largura toda do container do conteúdo.
- `.sdb-pagehead__titles`: `.sdb-pagehead__eyebrow` (meta em caixa alta, com ícone: "Acervo completo") e `h1.sdb-pagehead__title` (`display-lower`, 40 px). É o `h1` da página: o título da barra superior é um `p`.
- `.sdb-pagehead__sub`: subtítulo na voz de leitura, até 40rem.
- `.sdb-pagehead__top`: slot de cima, à direita (ex.: segmentado de vistas "Conteúdos | Glossário").
- `.sdb-pagehead__bottom`: slot de baixo, à direita (ex.: Campo de busca compacto e o botão "Filtros", que mostra a contagem quando há filtros: "Filtros (2)").

## Responsivo
Decide pelo container (coloque o painel dentro de um elemento com `container-type: inline-size`).
- **< 900 px:** empilha na ordem slot de cima, rótulo, título, subtítulo, slot de baixo; o campo de busca ocupa o espaço que sobra.
- **< 520 px:** respiro de 16 px, título em 32 px, busca e botão na largura toda, um embaixo do outro.

## Regras
- Um só painel por página, no topo do conteúdo.
- O subtítulo descreve o que há, sem promessa: "Textos, fontes primárias e vídeos das cinco Salas, cada um com a sua procedência."
- Controles no slot só mudam o que aparece abaixo. Ações de sair da página não entram aqui.
- Exceção (curadoria, 1.0.3): numa página de lista da curadoria, o slot de cima pode levar a ação primária que cria o item da lista ("Nova Sala"), um botão `sdb-btn--primary` só. Os filtros continuam embaixo ou fora do painel.
