# Movimento

Movimento a serviço da resposta: começa no toque, parte do valor atual e pode ser interrompido.

- Resposta no pressionar (`:active`, `scale(0.96)` em 90 ms), não no soltar.
- `spring-soft` (ressalto de 1,7%) para o que se desloca: polegares do switch e do segmentado, menus, sheets, toasts. `ease-standard` (sem ressalto) para o resto.
- Transições CSS, não keyframes, para tudo que pode ser repetido rápido: elas retomam do ponto atual.
- Entradas materializam: escala 0,92–0,94 + opacidade + desfoque. Saídas são mais rápidas e voltam pelo mesmo caminho.
- Popovers nascem do gatilho; modais, do centro. O command palette não anima.
- `prefers-reduced-motion`: deslocamentos viram esmaecimento; nada de ressalto.
