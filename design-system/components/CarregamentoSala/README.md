# Carregamento de sala

Esqueleto da estrutura da página: banner, título e blocos de conteúdo. Use durante uma operação cujo total não é conhecido. Não invente porcentagem por tempo.

Em frameworks, emita a estrutura HTML do exemplo e reutilize o CSS compartilhado. No portal, use `CarregamentoSala` em `@/components/ds/EstadosInterface`.

Quando a resposta chegar, substitua pelo conteúdo, por EstadoSecao se a coleção estiver vazia, ou por um estado de erro contextual se a requisição falhar. Não deixe este componente montado sobre conteúdo já pronto.

A pulsação é desativada com `prefers-reduced-motion`. Quando existir total mensurável, use ProgressoReal separado. O CardSalaEsqueleto original continua disponível para carregar somente a grade de cards.
