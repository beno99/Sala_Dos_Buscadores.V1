# Card Sala · 1.0

Normal e destaque nos formatos vertical e horizontal. Container de 24 px, imagem de 16 px e recuo de 8 px. O destaque recebe moldura e painel sólido ou translúcido sobre a imagem; o normal separa imagem e texto. Sobre a imagem ficam contagem e salvar. Título, descrição, nível, data e ação ficam no corpo. Use `card-sala.css` e `initializeSalaCards` de `card-sala.js`. O exemplo demonstra salvar e navegar localmente, sem alterar o portal.

O arquivo `preview.html` é a fonte do exemplo. Execute `node scripts/build.mjs` na raiz do design system após alterações.

## Extensões do portal (1.0.1)

- **Sem foto:** no lugar de `.sala__image`, use `<div class="sala__placa sdb-plate--bordo|grafite|bege">` com o arco (`SalaBuscadores.arc({on})`) dentro. A placa ocupa a mídia e o arco fica na base.
- **Etiquetas sobre a imagem:** envolva a contagem e outras etiquetas (ex.: "Para ampliar o olhar", com a mesma classe `.sala__count`) em `.sala__chips`, à esquerda do botão de salvar.
- **Progresso do membro:** no corpo, no lugar do nível e da data, use a barra `.sdb-progress` (trilho decorativo + legenda que carrega a informação). Ela ocupa a largura toda do corpo.
- No portal, o normal vertical é o padrão das faixas e grades de Salas.

## Sala de anfitrião (1.0.2)

Sala mantida por um anfitrião e aprovada pela curadoria. Logo depois de `.sala__description` (que traz "Sala de anfitrião · nome"), o Selo de proveniência compacto `sdb-seal sdb-seal--sm sdb-seal--anfitriao`, com `title="Anfitrião · revisado pela curadoria"`. A imagem é a enviada pelo anfitrião; sem ela, a placa da marca. Na página `/salas`, essas Salas ficam numa seção própria, "Salas de anfitriões", depois das "Salas da curadoria".

## Superfície (out 2026)
No Sólido claro, o card fica em `card-warm` (areia quente, #E3C998); nos outros temas, no material de antes.
