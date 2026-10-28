# Carrossel

Uma faixa horizontal de cards (Salas, conteúdos, episódios) com cabeçalho e setas, no mesmo padrão de rolagem da Grade comparativa. Quando o conteúdo é uma Sala, use sempre a composição do [Card Sala](../CardSala/README.md): imagem ao fundo, painel de vidro escuro e ação com o botão compartilhado.

## Anatomia
- `section.sdb-carousel[data-sdb-carousel]` com `aria-labelledby`.
- `.sdb-carousel__head`: `.sdb-carousel__titles` (título `title-2` e `.sdb-carousel__caption` em `meta`, ex.: "Acesso rápido às Salas · 5 abertas") e `.sdb-carousel__nav` com dois botões `[data-carousel-prev]` / `[data-carousel-next]` (ícone, `aria-label` com o verbo: "Ver mais Salas").
- Opcional entre cabeçalho e trilho: chips de filtro (Chip de tema).
- `.sdb-carousel__track` (`tabindex="0"` e `aria-label`): grade de uma linha com `scroll-snap`; largura dos itens em `--sdb-item` (padrão 280 px; até 82% da tela no celular).

## Regras
- A rolagem fica só no trilho: a página nunca rola de lado. A barra de rolagem fica oculta; setas, teclado (Tab entra no trilho; setas do teclado rolam) e toque continuam funcionando.
- As setas rolam uma tela e ficam desabilitadas nas pontas (o runtime confere ao rolar e ao redimensionar).
- Rolagem suave, ou instantânea com `prefers-reduced-motion`.
- Filtro sem resultado: diga o que remover ("Nenhuma Sala trata Meditação e Origem do universo juntas. Tire um dos temas.").
- Quando o carrossel é de Salas, a ordem tem regra explícita (em andamento, interesses, "Para ampliar o olhar"); nunca ordem de importância.

## Cards de sala

- Cada item é um `article.sala` com nome em `aria-labelledby`, imagem decorativa (`alt=""`), contagem e botão independente de salvar; o painel inferior contém nome, descrição e o progresso pessoal da sala, no lugar do nível e da data.
- `.sala__body[data-theme="solido-escuro"]` mantém texto claro sobre vidro escuro em todos os temas. Os botões usam `.sdb-btn`, com cantos de 12 px e foco dourado; a ação é `.sdb-btn--primary` e salvar é `.sdb-btn--icon.sdb-btn--glass`.
- A versão do Portal usa `.sala__progress`: cabeçalho com o rótulo “Estudo da sala” e percentual visível, `<progress class="sala__progress-bar">` em toda a largura e legenda de contagem. O progresso substitui o nível e a data; não muda a estrutura de imagem, vidro e ação.
- O valor da barra é a razão de conteúdos concluídos pelo total (`value` entre 0 e 1, `max="1"`). Arredonde apenas o percentual exibido: 2 de 3 conteúdos resultam em `value="0.6666666666666666"` e “67%”. A legenda e o percentual devem vir dos mesmos dados.
- Cada `<progress>` tem `id` exclusivo, `<label for>` associado, nome acessível que identifica a sala e `aria-valuetext` com o percentual e a contagem. O percentual visual tem `aria-hidden="true"` para evitar sua repetição junto da barra.
- Preserve o progresso e as contagens reais da sala. Os exemplos mantêm 2 de 3, 1 de 3 e os estados de 0% “Ainda não visitada”; não invente denominador ou transforme progresso indisponível em zero. Esta prévia usa dados ilustrativos e não grava estudo no Portal.
- Carregue `CardSala/card-sala.css` e o runtime `refined.js` junto dos estilos básicos. `data-save-room` identifica a sala para sincronizar o estado de estante entre os exemplos.
- Na prévia, os CTAs abrem um diálogo nativo com nome e descrição da sala escolhida. Para usar no portal, substitua o destino por uma URL real e remova `data-preview-room`.
- A amostra mantém a imagem existente de Corpus Hermeticum. As demais salas usam uma composição decorativa em SVG do arco e das cores da marca já presentes no projeto; ela não representa iconografia nem objetos dessas tradições. A imagem editorial de cada sala deve substituir esse recurso quando estiver disponível.
