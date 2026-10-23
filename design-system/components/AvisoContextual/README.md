# Aviso contextual

Orientação persistente com ícone em volume compacto, título e texto. Corpo neutro, cores da marca e sombra concentrada no ícone.

Em frameworks, emita a estrutura HTML do exemplo e reutilize o CSS compartilhado. No portal, use `AvisoContextual` em `@/components/ds/EstadosInterface`.

HTML: `.sdb-ui-notice` com `data-ui-volume="escudo" data-ui-size="small"`, título em `strong` e mensagem em `p`.

Não use anúncio urgente para orientações permanentes. Se uma ação produzir uma mensagem dinâmica, o consumidor deve escolher uma região `role="status"` ou `role="alert"` conforme a urgência. O texto precisa comunicar o significado completo sem depender do ícone.
