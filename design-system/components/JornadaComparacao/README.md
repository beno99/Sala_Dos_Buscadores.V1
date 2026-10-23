# Jornada · Comparação e assistente

Composição dos frames Figma `19537:23380`, `19537:23534` e `19537:23889` da Jornada do buscador.

Carregue `jornada-comparacao.css` depois de `bundle.css` e `CardComparativo/card-comparativo.css`. O CSS usa os tokens dos quatro temas e não modifica a apresentação das peças fora desta composição.

- `.sdb-journey-compare--welcome`: painel areia, introdução central e BarraBusca de até 736 px. O título principal continua sendo um `h1`.
- `.sdb-journey-compare`: a pergunta e a GradeComparativa vêm antes da busca. As respostas usam cartões creme. Dados, fontes, critérios e quantidade de Salas vêm do acervo; não copie os artigos repetidos como placeholder no frame.
- `.sdb-journey-compare__search`: envolve a BarraBusca existente, com modos, validação, sugestões e envio pela URL preservados.
- A lista de conteúdos relacionados e seus filtros seguem abaixo do painel, mantendo as opções já disponíveis no portal.
- `.sdb-journey-assistant`: conversa de até 818 px, com cabeçalho compacto. Os trechos documentais, editoriais e da IA seguem distinguíveis; fontes, ações e aviso de neutralidade continuam presentes.

No celular, a busca põe o botão em uma linha própria; a grade conserva o trilho horizontal contido e seus controles. O foco permanece visível. O painel do assistente continua na rota existente, sem adicionar um modal ou enviar perguntas automaticamente.

Veja a estrutura em `preview.html`. Os estados de consulta, interrupção, erro e atualização permanecem a cargo dos componentes originais.
