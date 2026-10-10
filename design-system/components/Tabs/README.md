# Tabs

Alterna vistas do mesmo objeto com o controle segmentado; navega entre seções com a barra de abas.

- **Segmentado**: `[data-sdb-tabs]` > `.sdb-segmented[role=tablist]` > `button[role=tab]` + painéis `role=tabpanel`. O polegar (`thumb`) é criado sozinho e desliza com mola até a aba escolhida; setas ← → navegam.
- Também serve para alternar modos sem painéis: `button[data-toggle][data-toggle-group]` dentro de `.sdb-segmented`.
- **Barra de abas** `.sdb-tabbar`: cápsula de vidro com ícone + rótulo; a ativa ganha `fill` e cor `accent`. Específica: nomes pelo conteúdo ("Salas", "Estante"), nunca "Início".
- **Barra de navegação entre páginas**: `nav.sdb-tabbar` > `a` com `aria-current="page"` na página atual (sem `role="tab"`). Mesmo visual da barra de abas.
- **Barra de abas do app** (`.sdb-tabbar--app`): no celular (< 900 px) substitui a Navegação lateral. Fixa embaixo, na camada flutuante (translúcida também nos temas sólidos), com até 5 destinos: Portal, Biblioteca, Trilhas, Estante e Mais. "Mais" é um `button` que abre um Drawer com o resto do menu. O Botão flutuante sobe para ficar acima dela; reserve espaço no fim da página para ela não cobrir conteúdo.
- A troca de painel é imediata; só o polegar se move.
