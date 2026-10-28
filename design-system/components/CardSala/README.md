# Card Sala · imagem e vidro

Todo card de sala segue uma composição: imagem ocupando o fundo, contagem e salvar no topo, painel de vidro com título, descrição, metadados e ação. Os antigos tratamentos normal, destaque sólido e destaque translúcido foram substituídos por esse padrão. Os formatos vertical e horizontal conservam a mesma composição.

## Anatomia e materiais

- `article.sala` é identificado pelo título com `aria-labelledby`. O raio externo é 24 px, o recuo é 8 px e os raios da imagem e do painel são 16 px.
- `.sala__media` contém a imagem decorativa (`img.sala__image` com `alt=""`), `.sala__tools` e `.sala__body`. A altura mínima permite que o card cresça com o texto.
- `.sala__tools` reúne `.sala__count` e o botão independente de salvar. O botão usa `data-theme="solido-escuro"`, `data-save-room`, nome acessível estável e `aria-pressed`.
- `.sala__body[data-theme="solido-escuro"]` mantém o vidro escuro e os controles claros em todos os temas. O fundo é `rgb(17 19 19 / 62%)`, com desfoque de 24 px e saturação de 125%; a imagem continua perceptível atrás das informações. A moldura externa acompanha o tema da página.
- O nível usa `.sdb-level` e as cores compartilhadas de SeloNivel. Título, descrição, nível e data ficam em texto. Progresso e metadados são opcionais: use somente dados disponíveis, sem inventar nível ou atualização.
- A ação usa `.sdb-btn.sdb-btn--primary.sala__action`; salvar usa `.sdb-btn.sdb-btn--icon.sdb-btn--glass.sala__save`. Ambos herdam cantos de 12 px, foco dourado e pressão da família compartilhada. O CTA tem preenchimento claro fosco em repouso; hover com mouse/trackpad e foco por teclado acendem o preenchimento e uma luz branca suave em 200 ms. O texto mantém sua opacidade. Durante o pressionamento, a compressão e a camada da família Botão continuam ativas. Em telas de toque, o hover luminoso não fica preso após o toque.

## Versão com progresso de estudo

O card da página inicial pode substituir nível e data por `.sala__progress`, mantendo título, descrição e botão. O conjunto mostra rótulo, percentual, barra nativa `progress` e legenda da contagem. A barra ocupa a largura do painel e expõe o valor e a descrição para tecnologias assistivas. O trilho escuro e o gradiente dourado com halo usam os tokens compartilhados `progress-*` do `bundle.css`.

O valor segue o contrato do portal: `pct = conteúdos concluídos / total`, entre 0 e 1. O percentual visível é `Math.round(pct * 100)` e o preenchimento usa o valor exato. Exemplo demonstrativo: `2 / 3` → **67%** e “2 de 3 conteúdos lidos”. Não usar percentual de rolagem de uma leitura individual para representar o estudo da sala.

Estados: 0% (“Ainda não visitada”), progresso parcial e 100% (todos os conteúdos concluídos). São estados determinados, sem spinner ou animação de carregamento. Quando não houver dados de progresso, use a composição com nível/data. O exemplo e o carrossel apresentam dados ilustrativos; a integração real deve receber os valores do portal.

## Formatos e adaptação

O padrão vertical posiciona o painel na parte inferior da imagem. `.sala--horizontal` posiciona o mesmo painel à esquerda, com largura limitada; abaixo de 620 px ele volta a ocupar a largura disponível. Os componentes não têm altura máxima nem recortam o texto para igualar cards.

Sem suporte a `backdrop-filter`, com transparência reduzida ou com contraste aumentado, o painel recebe fundo grafite opaco. O contraste aumentado reforça as bordas; movimento reduzido desativa as transições. A preferência de transparência tem prioridade sobre o efeito de vidro.

## Uso e interação

Carregue `tokens.css`, `components/bundle.css`, `assets/themes.css`, `CardSala/card-sala.css` e `components/refinement.css`. Use `initializeSalaCards` de `card-sala.js`, ou o runtime gerado `components/refined.js` depois de `bundle.js`.

Salvar e remover são sincronizados pelo identificador da sala e preservam `aria-pressed`. A prévia usa armazenamento local próprio; não modifica a estante do portal. Os links demonstrativos com `data-preview-room` abrem um diálogo nativo. Na integração real, forneça a URL da sala e remova o interceptador da prévia.

O Carrossel de salas reutiliza esta mesma estrutura. O exemplo de CardSala demonstra os formatos vertical e horizontal, com abas operáveis por setas, Home/End e teclado.

`preview.html` é a fonte do exemplo. Execute `node scripts/build.mjs` na raiz do design system após alterações; não edite os exemplos gerados.
