# Navegação lateral

Navegação principal do portal e da curadoria: coluna com ícone e rótulo, recolhível para só ícones.

## Duas versões
- **App** (`nav.sdb-sidenav.sdb-sidenav--app`): a lateral do portal, de cima a baixo — marca e botão de recolher, cartão de perfil, mini card "Continuar de onde parou", itens em grupos e cartões no rodapé. Coluna em `material-thin` presa à borda esquerda, com divisória à direita; não é vidro, porque não flutua sobre o conteúdo.
- **Curadoria** (`nav.sdb-sidenav`): cápsula com título em `meta` (`.sdb-sidenav__head`), itens e `.sdb-sidenav__sep`.

## Anatomia (app)
- `.sdb-sidenav__brand`: arco + nome em `display-lower` (`.sdb-sidenav__name`) + botão `[data-sidenav-toggle="<id da nav>"]` com `aria-expanded` e `aria-controls`.
- `.sdb-sidenav__profile`: botão (pode ser o gatilho de um Menu; dentro da lateral, `.sdb-menu-wrap` ocupa a largura toda) com Avatar (iniciais), `.sdb-sidenav__who` (pseudônimo em `<b>`, "Membro desde set 2026") e chevron; abre o menu da conta.
- `.sdb-sidenav__resume`: miniatura (`.sdb-sidenav__thumb` com placa e arco), `.sdb-sidenav__resume-text` (título com `.sdb-card__link`, "Sala · 38%"), `.sdb-sidenav__dismiss` e `.sdb-progress__track` fino.
- `.sdb-sidenav__group`: título de grupo em `meta` (Acervo, Estudo, Ferramentas, Conta).
- `a.sdb-sidenav__item` (ou `button` para "Sair") com ícone, `.sdb-sidenav__label` e, opcional, `.sdb-sidenav__count` (número) ou `.sdb-sidenav__tag` ("nova").
- `.sdb-sidenav__foot`: cartões `.sdb-sidenav__card` (cabeçalho com ícone, rótulo e número; texto curto; link).

## Regras
- `nav` com `aria-label`; página atual com `aria-current="page"` (fundo `accent-soft`, cor `accent`).
- Recolhida (`.is-collapsed`): 64 px, rótulos só para leitores de tela, grupos viram divisórias, perfil e "Continuar" ficam só na imagem, rodapé some. O runtime põe `data-tip` (à direita) com o nome de cada item e troca o rótulo do botão ("Recolher navegação" / "Expandir navegação").
- `data-sidenav-store="<chave>"` guarda o estado no `localStorage` (protegido por try/catch) e o restaura no `hydrate()`. `SalaBuscadores.setSidenav(nav, recolhida)` faz o mesmo por código.
- No celular (< 900 px), a lateral sai e entra a barra de abas (Tabs › `.sdb-tabbar--app`) com Portal, Biblioteca, Trilhas, Estante e Mais; "Mais" abre um Drawer com a lista em `.sdb-sidenav--sheet`.
- A curadoria (`/admin`) mantém a própria casca e não ganha duas laterais.
