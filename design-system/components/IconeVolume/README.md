# Ícone com volume

Segundo nível da iconografia, aprovado no piloto: camadas neutras, sombra curta e detalhe na paleta do portal. Use em estados vazios, avisos e diálogos; navegação, pesquisa e controles continuam usando ícones simples.

HTML: carregue `EstadosInterface/estados-interface.css` e `EstadosInterface/estados-interface.js`, depois use `<span data-ui-volume="pasta"></span>`. Para o tamanho compacto, acrescente `data-ui-size="small"`. Conteúdo dinâmico: `SalaInterface.hydrate(container)`.

Em frameworks, emita a estrutura HTML do exemplo e reutilize o CSS compartilhado. No portal, use `IconeVolume` em `@/components/ds/EstadosInterface`.

Símbolos: pasta, historico, busca, livro, alerta, sucesso e escudo. Tamanhos: 78 × 72 px e 52 × 50 px. O ícone é decorativo (`aria-hidden`); a mensagem ou o controle fornece o significado acessível.

Os glifos são do Phosphor. A licença está em `../Iconografia/LICENCA-PHOSPHOR.txt`. O SVG é vetorial, sem imagens raster ou fontes de ícones.
