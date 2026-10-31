# Card de fonte consultada

Uma obra usada pelo acervo ou pelo assistente, apresentada como um livro: capa, título, autor, tradição, tipo e referência.

## O consumidor fornece
Título, autor/editor/tradutor com o papel entre parênteses, tradição, tipo de fonte (fonte primária · tradução comentada · estudo acadêmico · comentário), referência (editora, ano, ISBN, documento) e link interno ou externo.

## Variantes
- **Card** (`.sdb-card.sdb-source`): bibliografias e páginas de Sala. Chevron para link interno; seta diagonal para link externo (nova aba).
- **Linha numerada** (`.sdb-source--row` dentro de `.sdb-list`): fontes citadas pelo assistente de IA, com o número da referência.
- A capa (`.sdb-cover`) usa as placas da marca com a inicial em Gambetta; nunca a capa real de uma editora sem licença.

## Citação de anfitrião (1.0.2)

Quando o assistente cita um artigo de anfitrião, a linha numerada (`.sdb-source--row`) traz, depois da referência, o Selo de proveniência compacto `sdb-seal sdb-seal--sm sdb-seal--anfitriao` dentro de `.sdb-source__info`. O selo diz de onde vem a leitura; a capa continua a placa da marca.

## Conteúdo longo
A coluna central usa `minmax(0, 1fr)`. Título, autor e referência quebram palavras/URLs longas sem truncar. As tags podem ocupar várias linhas, incluindo “Hermetismo moderno e Novo Pensamento”; não use reticências, `line-clamp` ou `nowrap` nestas tags. Conferir também a coluna lateral de 20rem da leitura e zoom de 200%.

## Inicial editorial automática (31/10/2026)

A capa de fonte e o fallback de capa de artigo usam a primeira letra ou número Unicode do próprio título, em maiúscula, ignorando pontuação e espaços iniciais. Acentos e artigos gramaticais permanecem. A inicial não é editável; sem título utilizável usa o ícone neutro da biblioteca. Imagens disponíveis têm precedência. No BannerSala a variante de artigo recebe `tituloFallback`; o banner de Sala conserva o arco.
