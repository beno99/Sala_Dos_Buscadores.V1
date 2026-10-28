# Card Vídeo · 1.0

Somente horizontal, com imagem de fundo e desfoque escuro progressivo nas informações, sem painel branco. Moldura sólida de 24 px e mídia de 16 px nos quatro temas. Título, sala, tema, duração, episódio, data e progresso ilustrativo permanecem visíveis. Não há reprodução incorporada: o CTA abre um vídeo específico do YouTube em nova aba. A URL ainda não foi fornecida; o botão permanece desativado. Use `card-video.css` e valide o destino com `youtube-link.mjs`. Edite `data/video.json` e regenere o catálogo para ativar um destino válido.

O arquivo `preview.html` é a fonte do exemplo. Execute `node scripts/build.mjs` na raiz do design system após alterações.

## Extensão do portal (1.0.1)

Sem miniatura, use `<div class="video__placa sdb-plate--grafite|bordo">` com o arco em traço fino dentro, no lugar de `.video__image`. O botão só vira link com uma URL específica de vídeo do YouTube (`youtube.com/watch`, `youtu.be`, `shorts`); links de busca não contam e o botão fica com `aria-disabled="true"` e uma nota dizendo que o link do episódio ainda não foi cadastrado.

O card mede a própria largura (container queries em 700 e 430 px), e não a janela: funciona numa coluna estreita ao lado da navegação lateral e em grades.

## Player embutido (1.0.2)

Só no artigo de anfitrião com link do YouTube: o vídeo toca na própria página, acima do texto. Em qualquer outro lugar vale a regra do card (abre o YouTube em nova aba).

```html
<figure class="video-embed">
  <div class="video-embed__frame">
    <iframe src="https://www.youtube-nocookie.com/embed/ID" title="Vídeo: título do artigo" loading="lazy"
      allow="encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin"></iframe>
  </div>
  <figcaption class="video-embed__legenda">Vídeo indicado pelo anfitrião, no YouTube.</figcaption>
</figure>
```

- Use o domínio `youtube-nocookie.com` e o ID validado (`youtube-link.mjs` ou `extrairIdYoutube` no portal).
- Moldura com `radius-lg`, fundo `depth-fill` enquanto carrega e `shadow-card`. A legenda diz de onde vem o vídeo.
- Sem o player (por exemplo na prévia do catálogo), a moldura recebe a placa da marca (`.sdb-plate`).
- A mesma moldura (`.video-embed__frame` com `<img alt="">`) mostra a imagem de topo do artigo de anfitrião quando não há vídeo; sem imagem, a placa da marca.

## Progresso compartilhado

O elemento nativo `.video__progress` recebe o trilho escuro, o gradiente dourado e o halo definidos em `components/bundle.css`. Evite sobrescrever a cor no CSS do vídeo. A prévia identifica os dados ilustrativos; na integração, mostre progresso apenas quando a origem disponibilizar um valor real.
