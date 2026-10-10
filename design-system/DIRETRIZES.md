# Diretrizes da marca e da interface

A Sala dos Buscadores é um portal de estudo que organiza tradições religiosas, espirituais e filosóficas em Salas, com busca comparativa por tema e um assistente de IA que consulta o próprio acervo. A marca age como curadora de museu, não como pregadora: organiza fontes, contextos e caminhos e deixa a conclusão com quem lê. Ideia-guia: **a porta está aberta; a escada é de quem sobe.**

A interface segue a linguagem de design da Apple (Human Interface Guidelines e Liquid Glass) vestida com as cores, as fontes e o arco da marca. Existem duas versões do mesmo sistema: **Sólido**, opaca e padrão do portal, e **Vidro**, translúcida. As duas têm modo claro e escuro.

## Conteúdo e tom de voz

A voz é precisa, serena, didática e firme. Nunca dogmática, sensacionalista, condescendente ou decorativa.

- Toda afirmação é atribuída: "Segundo o Poimandres…", "Nos textos de Nag Hammadi…", "O livro descreve…". Nunca "A verdade é…".
- Descreva, não prometa. Nada de "desperte", "segredos revelados", urgência ou exclamações.
- Quando a fonte não trata de algo, diga isso e não preencha a lacuna.
- Datas incertas ficam incertas: "c. 350", "séc. I – III".
- Controles com verbo exato ("Comparar", "Copiar citação", "Concluir degrau III"); confirmações no passado ("Citação copiada").
- Erros dizem o que houve e como resolver, começando por "Erro:". Sem desculpas.
- Nomes específicos em vez de genéricos: "Salas", "Estante", "Assistente", nunca "Início".
- Sem emoji. Caixa-alta só em `display-caps` e `meta`.

## Fundamentos visuais

### Tema padrão: Sólido claro
- `data-theme="solido-claro"` é o padrão; `solido-escuro` é a opção escura. Os temas de vidro continuam disponíveis na biblioteca.
- Fundo bege chapado (grafite no escuro), sem brilho ambiente nem gradiente.
- Contraste leve: cards e painéis em creme um passo acima do bege (`material-regular`), contorno sutil (`glass-edge`) e sombra curta (`shadow-card`). Limpo, sem moldura pesada.
- Layout de painel: tudo preso à mesma grade, com a mesma borda esquerda, as mesmas larguras de coluna e o mesmo ritmo vertical. Texto alinhado à esquerda; nunca `text-align: justify`.

### Camada flutuante
- O que passa por cima do conteúdo (botão flutuante do assistente, barra superior quando o conteúdo rola por baixo, barra de abas do celular) usa os tokens `float-*` e `blur-float`: translúcido e desfocado **também nos temas sólidos** (`.sdb-float`).
- Só essas peças. Conteúdo, lateral, cards e listas ficam opacos.
- `prefers-reduced-transparency`: a camada flutuante fica opaca (`float-solid`).

### Duas camadas, dois materiais
- **Camada de conteúdo** (cards, listas, citações): materiais `material-thin`, `material-regular`, `material-thick`, classe `.sdb-material`.
- **Camada funcional** (botões flutuantes, chips, barras, toasts, menus, sheets): Liquid Glass `glass-fill`, classe `.sdb-glass`, com `glass-sheen` no topo, `glass-rim` de 1 px e `glass-edge` em volta.
- Sobre mídia escura (placas de Sala e vídeo): vidro claro `glass-clear` com texto `on-media`.
- Nos temas **Vidro**, as superfícies desfocam (`blur-glass` 24 px, `blur-thick` 44 px; saturação 150% no claro e 115% no escuro, para o bordô não virar vermelho) o brilho ambiente do canvas (`ambient-a/b/c`). Nos temas **Sólido**, os mesmos tokens viram superfícies opacas e o brilho some.
- Não empilhe vidro claro sobre vidro claro. Controle dentro de card usa `fill` (botão `--secondary`).
- `prefers-reduced-transparency` deixa tudo opaco; `prefers-contrast: more` adiciona contorno.

### Cor
- 60% `bg-canvas` (bege no claro, grafite no escuro), 25% `depth-fill` (bordô), 10% texto, 5% `gold`.
- Texto: `label`, `label-secondary`, `label-tertiary` (vibrantes, legíveis sobre todos os materiais). Destaque e links em `accent`.
- Pares de texto permitidos: grafite sobre bege ou branco, bordô sobre bege, branco sobre grafite, bege sobre bordô. Os tokens `on-accent`, `on-prominent`, `on-depth` e `on-critical` garantem isso nos quatro temas.
- Botão primário em `prominent-fill` (grafite no claro, branco no escuro); seleção em `accent-fill` (bordô no claro, bege no escuro).
- Ouro é emblema (disco ou selo com glifo preto em `on-gold`), filete ou progresso sobre placa escura. Nunca texto, nunca fundo de leitura.
- Erro é bordô com ícone e a palavra "Erro", nunca vermelho puro, nunca só cor.

### Forma
- Grid estrutural de 8 pontos: espaços de 8, 16, 24, 32, 48 e 64 px. 4 px é reservado para ajustes ópticos pequenos.
- Cantos contínuos e generosos: `radius-sm` e `radius-md` 16 (campos, itens e interiores), `radius-lg` e `radius-xl` 24 (cards, painéis, modais), `radius-pill` (botões, chips, barras).
- Raios concêntricos: o que fica dentro de um card recuado 8 px usa o raio do card menos 8 (placas de Sala).
- Separação por material e sombra suave (`shadow-card`, `shadow-float`); divisórias só dentro de listas, recuadas 24 px.
- Foco: anel de 3 px em `focus-ring` (bordô no claro, ouro no escuro), afastado 2 px; campos em foco ganham anel duplo com `accent-soft`.

### Tipografia
- `display-caps` (Gambetta, caixa-alta) só para momentos de marca: `.sdb-display-xl`, `.sdb-display-l`.
- `display-lower` (Hident; Fraunces até a entrega dos arquivos licenciados) para títulos editoriais: `.sdb-large-title` 56, `.sdb-title-1` 34, `.sdb-title-2` 24, com tracking negativo.
- `reading` (Source Serif 4) para tudo que vem do acervo: leitura 19/1.6, resumos 16, citações 26.
- `ui` (Inter, no papel do SF Pro) para interface e para o texto escrito pela IA: `.sdb-headline` 17, `.sdb-callout` 15, `.sdb-footnote` 13.
- `meta` (Inter caixa-alta +6%) só para rótulos de seção e localização de fonte.

### Movimento
- Resposta no pressionar: `scale(0.96)` em `duration-press`, volta com mola.
- `spring-soft` (ressalto de 1,7%) para o que se desloca: polegares, menus, modais, toasts, drawer. `ease-standard` (sem ressalto) para o resto.
- Entradas materializam (escala 0,92–0,94 + opacidade + desfoque); saídas mais rápidas pelo mesmo caminho. Popovers nascem do gatilho; modais, do centro.
- Transições CSS (interrompíveis) em vez de keyframes. Command palette sem animação.
- `prefers-reduced-motion`: deslocamento vira esmaecimento, sem ressalto.

### Imagem
Acervos reais, livros, manuscritos, gravuras, arquitetura de biblioteca, mãos e gestos de estudo. Sem fotos disponíveis, use as placas da marca (bordô, grafite, bege) com o arco. Nunca cristais, mandalas, lua, velas, fumaça ou gradiente roxo.

No portal, as fotos ficam em `portal/public/imagens/{banner,salas,episodios,anuncios,conteudos}` (nomes e proporções no `LEIA-ME.md` da pasta). Toda peça com imagem aceita `<img alt="">` e cai na placa da marca quando o arquivo não existe. Só imagens com direito de uso registrado.

## Iconografia

- Conjunto próprio de ícones de traço 1,7 px em grade de 24 px, pontas arredondadas, no espírito dos SF Symbols e neutros entre tradições. `SalaBuscadores.icon(nome)` ou `<span data-icon="nome">`.
- O símbolo é o arco com escada de degraus, com cor invertida conforme o fundo: branco sobre grafite, bordô sobre bege, bege sobre bordô, preto sobre ouro (`SalaBuscadores.arc({on})`). Aparece em discos bordô, emblemas de ouro e placas.
- Não há logotipo em vetor neste sistema: o logotipo vertical "SALA / DOS / Buscadores" usa glifos alternativos ainda não entregues. Até lá, escreva o nome em `display-lower` e use o arco como marca.
- Ícones reservados à proveniência: `fontePrimaria`, `curado`, `especialista`, `comunidade`, `ia`.

## Uso dos componentes

Componentes em HTML + CSS (`components/bundle.css`, classes `sdb-*`) com um runtime sem dependências (`components/bundle.js`, global `SalaBuscadores`) que liga comportamentos por atributos: `data-open`/`data-close` (modal, drawer), `data-menu-trigger`, `data-acc-trigger`, `data-sdb-tabs`, `data-toggle` (+ `data-toggle-group`), `data-copy`, `data-toast`, `data-tip`. O polegar dos segmentados é criado e posicionado sozinho. Depois de inserir HTML dinâmico, chame `SalaBuscadores.hydrate(elemento)`.

Defina o tema com `data-theme` no `<html>`: `solido-claro` (padrão), `solido-escuro`, `vidro-claro`, `vidro-escuro`. Nos temas de vidro, ponha `.sdb-ambient` (ou `.sdb-stage`) no contêiner da página para o brilho que o vidro refrata; nos sólidos, o mesmo contêiner fica chapado.

As peças maiores são montagens das básicas: a Grade comparativa usa placas, Selo de nível, Selo de proveniência e Toast; os Filtros usam Accordion, linhas de opção, Chips e o segmentado; a Mensagem do assistente usa Avatar, Selo, linhas de Card de fonte e Tooltip; a Trilha usa o emblema de ouro, arcos e a lista de tarefas.

## Refinamento 1.0

Os quatro materiais e os exemplos de Card Sala, Card Vídeo, Grade Comparativa e Botão Flutuante seguem os componentes aprovados no estudo v0.6. O assistente usa um núcleo de ouro líquido em WebGL e três anéis concêntricos: abrem no hover e fecham ao sair. O ouro permanece decorativo e nunca é fundo de leitura. O mini chat é uma demonstração local, sem IA conectada.
