# Breadcrumbs

Mostra o caminho até a página atual (Acervo › Sala › Coleção › Conteúdo) numa cápsula de vidro.

- `nav.sdb-crumbs` > `ol` > `li`; o último item tem `aria-current="page"` e trunca em 34 caracteres (título completo no `title`).
- Mais de 4 níveis: recolha os do meio num botão "…" com tooltip.

- Nas páginas de detalhe dentro da moldura do portal (ex.: a página da Sala), a trilha vai na segunda linha da [Barra superior](../BarraSuperior/README.md) e a cápsula não aparece.
