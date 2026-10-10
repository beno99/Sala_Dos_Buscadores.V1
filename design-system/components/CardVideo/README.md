# Card Vídeo · 1.0

Somente horizontal, com imagem de fundo e desfoque escuro progressivo nas informações, sem painel branco. Moldura sólida de 24 px e mídia de 16 px nos quatro temas. Título, sala, tema, duração, episódio, data e progresso ilustrativo permanecem visíveis. Não há reprodução incorporada: o CTA abre um vídeo específico do YouTube em nova aba. A URL ainda não foi fornecida; o botão permanece desativado. Use `card-video.css` e valide o destino com `youtube-link.mjs`. Edite `data/video.json` e regenere o catálogo para ativar um destino válido.

O arquivo `preview.html` é a fonte do exemplo. Execute `node scripts/build.mjs` na raiz do design system após alterações.

## Extensão do portal (1.0.1)

Sem miniatura, use `<div class="video__placa sdb-plate--grafite|bordo">` com o arco em traço fino dentro, no lugar de `.video__image`. O botão só vira link com uma URL específica de vídeo do YouTube (`youtube.com/watch`, `youtu.be`, `shorts`); links de busca não contam e o botão fica com `aria-disabled="true"` e uma nota dizendo que o link do episódio ainda não foi cadastrado.

O card mede a própria largura (container queries em 700 e 430 px), e não a janela: funciona numa coluna estreita ao lado da navegação lateral e em grades.
