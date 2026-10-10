# Assistente · esfera armilar · 1.0

Núcleo de ouro líquido liso em WebGL, com ondulações lentas e três anéis. Em repouso ficam concêntricos no mesmo plano. No hover abrem em três ângulos fixos; ao sair se fecham, sem rotação contínua. Clique abre mini chat lateral. Acionador de 104 px (96 px no celular), raio do chat de 24 px, quatro temas. Pausa e movimento reduzido congelam a animação; fallback CSS mantém o componente utilizável sem WebGL. Escape e clique fora fecham o chat. O conteúdo é demonstrativo, sem IA conectada. Fontes: `AssistenteOrb/gold-orb.js`, `assistant-orb.js`, `assistant-orb.css` e `demo-responses.js`.

O arquivo `preview.html` é a fonte do exemplo. Execute `node scripts/build.mjs` na raiz do design system após alterações.

## No portal (1.0.1)

- O orbe (`.orb-launcher`) substitui o antigo botão de ícone e abre o mini chat (`.assistant-chat`).
- No portal, o mini chat usa o assistente do acervo, não as respostas de exemplo: cada resposta é uma Mensagem do assistente completa (identificada como IA, com trecho documental, interpretação editorial e síntese separados, fontes numeradas). O Aviso de neutralidade discreto fica no rodapé do chat, no lugar da nota "respostas de exemplo", até a primeira resposta; a partir daí cada resposta traz o seu, e o rodapé não o repete.
- Abaixo de 900 px, onde existe a barra de abas, use `.orb-launcher--acima-da-barra` e `.assistant-chat--acima-da-barra`.
- Some na página do assistente em tela cheia.
