# Carrossel

Uma faixa horizontal de cards (Salas, conteúdos, episódios) com cabeçalho e setas, no mesmo padrão de rolagem da Grade comparativa.

## Anatomia
- `section.sdb-carousel[data-sdb-carousel]` com `aria-labelledby`.
- `.sdb-carousel__head`: `.sdb-carousel__titles` (título `title-2` e `.sdb-carousel__caption` em `meta`, ex.: "Acesso rápido às Salas · 5 abertas") e `.sdb-carousel__nav` com dois botões `[data-carousel-prev]` / `[data-carousel-next]` (ícone, `aria-label` com o verbo: "Ver mais Salas").
- Opcional entre cabeçalho e trilho: chips de filtro (Chip de tema) ou de ação, em `.sdb-carousel__chips`.
- Sem espaço, o `.sdb-carousel__nav` quebra para baixo do título; a página nunca rola de lado.
- Opcional no `.sdb-carousel__nav`, antes das setas: um botão `plain` pequeno que leva à lista completa ("Ver todos", com chevron).
- `.sdb-carousel__track` (`tabindex="0"` e `aria-label`): grade de uma linha com `scroll-snap`; largura dos itens em `--sdb-item` (padrão 280 px; até 82% da tela no celular).

## Regras
- A rolagem fica só no trilho: a página nunca rola de lado. A barra de rolagem fica oculta; setas, teclado (Tab entra no trilho; setas do teclado rolam) e toque continuam funcionando.
- As setas rolam uma tela e ficam desabilitadas nas pontas (o runtime confere ao rolar e ao redimensionar).
- Rolagem suave, ou instantânea com `prefers-reduced-motion`.
- Filtro sem resultado: diga o que remover ("Nenhuma Sala trata Meditação e Origem do universo juntas. Tire um dos temas.").
- Quando o carrossel é de Salas, a ordem tem regra explícita (em andamento, interesses, "Para ampliar o olhar"); nunca ordem de importância.

## Jornada do buscador
No Portal (Figma `19537:21623`), use `--sdb-item: 392px`: dois cards completos e parte do próximo na área de 1088 px. No celular, o limite de 82% continua valendo. As setas secundárias usam `chip-warm` e `on-chip-warm`, como os filtros de tema.
