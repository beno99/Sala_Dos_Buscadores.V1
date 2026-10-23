# Estados e orientação

Módulo compartilhado de IconeVolume, EstadoSecao, CarregamentoSala, ProgressoReal, AvisoContextual e DialogoContextual.

Carregue `estados-interface.css` depois dos estilos principais e `estados-interface.js` antes dos scripts consumidores. `SalaInterface.hydrate(elemento)` preenche ícones em conteúdo dinâmico; `SalaInterface.atualizarProgresso(elemento, concluidos, total)` atualiza a barra sem simular progresso.

Edite `runtime.modelo.js` e `icones.json`, depois rode `node design-system/scripts/build.mjs`. O arquivo `estados-interface.js` é gerado. Os glifos SVG são do Phosphor e saem de `scripts/icones-phosphor.mjs`; licença MIT em `../Iconografia/LICENCA-PHOSPHOR.txt`.

Importado de Sala_BuscadoresV3, commit `479e989df5ec99d6e15078b8da6ff92a640b045d`, com superfícies, contraste, raios e controles adaptados aos tokens da biblioteca principal. Os ícones com volume preservam as cores opacas, os gradientes de iluminação e as sombras originais da V3. Os componentes React correspondentes estão integrados no portal.
