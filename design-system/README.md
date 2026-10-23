# Design system · A Sala dos Buscadores

Biblioteca de componentes do portal: tokens, estilos, comportamentos e exemplos, na linguagem de design da Apple (Liquid Glass) com as cores, as fontes e o arco da marca. HTML + CSS + JavaScript puro, sem dependências, então funciona com qualquer tecnologia.

Versão 1.0: evolução local baseada nos componentes aprovados no estudo v0.6. A biblioteca reúne componentes do acervo, do portal e da Comunidade, mantém HTML/CSS/JavaScript puro e abre tanto por arquivo local quanto por HTTP.

## Ver a biblioteca

Abra `catalogo.html` no navegador (no VS Code: botão direito › *Reveal in Finder* e dois cliques, ou a extensão Live Server › *Open with Live Server*). Use a busca por nome ou descrição (atalho `/`), navegue pelas famílias e expanda um componente para carregar sua prévia. O tema é propagado sem recarregar os exemplos nem perder seus estados. "Guia" abre a documentação e "Abrir exemplo" mostra a peça sozinha.

## Usar numa página

```html
<html lang="pt-BR" data-theme="solido-claro">
<head>
  <link rel="stylesheet" href="design-system/tokens.css">
  <link rel="stylesheet" href="design-system/components/bundle.css">
  <link rel="stylesheet" href="design-system/assets/themes.css">
  <link rel="stylesheet" href="design-system/components/refinement.css">
  <script src="design-system/components/bundle.js"></script>
</head>
<body class="sdb-ambient">
  <button class="sdb-btn sdb-btn--primary">Entrar na Sala</button>
</body>
</html>
```

- **Tema**: `data-theme` no `<html>`: `solido-claro` (padrão), `solido-escuro`, `vidro-claro`, `vidro-escuro`. Sem o atributo, segue o modo claro/escuro do sistema com os temas sólidos.
- **Fundo**: nos temas sólidos o fundo é bege (ou grafite) chapado, sem brilho. `.sdb-ambient` no contêiner só acende o brilho que o vidro refrata nos temas de vidro.
- **Camada flutuante**: `.sdb-float` (e as peças que flutuam: barra de abas, botão flutuante, barra superior ao rolar) mantém translucidez e desfoque em todos os temas; fica opaca com `prefers-reduced-transparency`.
- **Classes**: tudo começa com `sdb-`. Copie a estrutura HTML do exemplo da peça (`exemplos/<Nome>.html`) e siga o guia (`components/<Nome>/README.md`).
- **Comportamentos por atributo**: `data-open="id"` / `data-close` (modal, drawer), `data-menu-trigger`, `data-acc-trigger`, `data-sdb-tabs`, `data-toggle` + `data-toggle-group`, `data-copy`, `data-share`, `data-toast`, `data-tip`.
- **JavaScript**: `SalaBuscadores.toast("Mensagem")`, `.openOverlay(id)`, `.closeOverlay(id)`, `.icon(nome)`, `.arc({on})`, `.hydrate(elemento)` (chame depois de inserir HTML dinâmico), `.syncSeg(segmentado)`.
- **Fontes**: Gambetta vem em `fonts/` (licença ITF Free Font License, uso comercial permitido, arquivo ao lado). Fraunces, Source Serif 4 e Inter vêm do Google Fonts pelo `bundle.css`.

## Gerar e conferir

```bash
node scripts/build.mjs           # tokens.css, exemplos/*.html e catalogo.html
node scripts/build.mjs --check   # sai com 1 se algum arquivo gerado estiver desatualizado
node scripts/contraste.mjs       # pares de texto WCAG AA nos quatro temas
```

`tokens.css`, `exemplos/` e `catalogo.html` são gerados: mude `tokens.json`, `components/<Nome>/preview.html` (o cabeçalho `@dsCard` dá grupo, altura e legenda) ou a tabela de peças abaixo (dá a ordem do catálogo) e rode o gerador.

## Em React, Vue ou outro framework

Não reescreva o CSS. Crie componentes que emitem as mesmas classes `sdb-*` e os mesmos atributos, importe `tokens.css` e `components/bundle.css` uma vez no layout raiz e carregue `components/bundle.js` no cliente (ou reimplemente o comportamento da peça no framework seguindo o guia dela).

## Linguagem visual 1.0

- Grid de 8 px; containers de 24 px, interiores de 16 px e recuo de 8 px.
- Quatro temas: sólido claro/escuro e translúcido claro/escuro, com contraste verificado.
- `catalogo.css` e `catalogo.js`: navegação, pesquisa e prévias sob demanda.
- `components/refinement.css`: ajustes da família original; `assets/themes.css`: materiais aprovados.
- `components/refined.js`: gerado dos módulos dos novos componentes e de `scripts/refined-entry.js`. Runtime clássico para funcionar também em `file://`; não editar diretamente.
- Os novos exemplos preservam os componentes independentes em suas pastas. Para usar um deles, carregue seu CSS específico e `components/refined.js` depois de `bundle.js`.
- O mini chat usa respostas locais demonstrativas. O CTA do vídeo continua desativado até existir uma URL específica válida do YouTube.

## Arquivos

| Caminho | O que é |
| --- | --- |
| `tokens.json` | fonte dos tokens (cores dos 4 temas, tipografia, espaço, raios, sombras, desfoque, tempos, curvas) |
| `tokens.css` | os tokens como variáveis CSS, gerados do `tokens.json` |
| `scripts/build.mjs` · `scripts/contraste.mjs` | gerador dos arquivos derivados · conferência de contraste |
| `components/bundle.css` | todos os estilos das peças |
| `components/bundle.js` | ícones, arco e comportamentos (global `SalaBuscadores`) |
| `components/<Nome>/README.md` | guia de uso da peça |
| `components/<Nome>/preview.html` | fonte do exemplo (fragmento, com o cabeçalho `@dsCard`) |
| `exemplos/<Nome>.html` | exemplo completo, abre sozinho (`?tema=vidro-escuro` troca o tema) |
| `catalogo.html` | todas as peças numa página |
| `DIRETRIZES.md` | marca, voz, materiais, cor, forma, tipografia, movimento, iconografia |
| `fonts/` | Gambetta variável + licença |

## Peças

### Fundamentos

| Peça | Para quê |
| --- | --- |
| [IconeVolume](components/IconeVolume/README.md) · [exemplo](exemplos/IconeVolume.html) | Ícones neutros em camadas, com sombra e detalhes da marca, para orientar em estados e diálogos. |
| [Arco](components/Arco/README.md) · [exemplo](exemplos/Arco.html) | O arco com escada de degraus é o símbolo da marca: a porta aberta e a escada que cada pessoa sobe sozinha. |
| [Iconografia](components/Iconografia/README.md) · [exemplo](exemplos/Iconografia.html) | Conjunto próprio de ícones de traço, no espírito dos SF Symbols: peso único, pontas arredondadas, neutros entre tradições. |
| [Materiais](components/Materiais/README.md) · [exemplo](exemplos/Materiais.html) | Duas camadas, como no Liquid Glass da Apple: a camada de conteúdo usa materiais (fino, regular, espesso); a camada funcional, que flutua sobre o conteúdo, usa vidro. |
| [Movimento](components/Movimento/README.md) · [exemplo](exemplos/Movimento.html) | Movimento a serviço da resposta: começa no toque, parte do valor atual e pode ser interrompido. |
| [Proporcao](components/Proporcao/README.md) · [exemplo](exemplos/Proporcao.html) | Quanto de cada cor aparece em uma tela e quais pares de texto são permitidos. |
| [Tipografia](components/Tipografia/README.md) · [exemplo](exemplos/Tipografia.html) | O acervo fala em serifa; a interface e a IA falam em Inter. |

### Componentes básicos

| Peça | Para quê |
| --- | --- |
| [EstadoSecao](components/EstadoSecao/README.md) · [exemplo](exemplos/EstadoSecao.html) | Container padrão para seção vazia, nenhum resultado e erro, com ação contextual. |
| [CarregamentoSala](components/CarregamentoSala/README.md) · [exemplo](exemplos/CarregamentoSala.html) | Esqueleto da página enquanto o conteúdo carrega; sem porcentagem simulada. |
| [ProgressoReal](components/ProgressoReal/README.md) · [exemplo](exemplos/ProgressoReal.html) | Progresso acessível em degradê, calculado por etapas concluídas e total conhecido. |
| [AvisoContextual](components/AvisoContextual/README.md) · [exemplo](exemplos/AvisoContextual.html) | Orientação com título, texto e ícone em volume compacto. |
| [DialogoContextual](components/DialogoContextual/README.md) · [exemplo](exemplos/DialogoContextual.html) | Diálogo de orientação com ícone em volume, ações, foco e Escape. |
| [Accordion](components/Accordion/README.md) · [exemplo](exemplos/Accordion.html) | Revela conteúdo por partes dentro de uma lista agrupada (inset grouped). |
| [Alerta](components/Alerta/README.md) · [exemplo](exemplos/Alerta.html) | Mensagem persistente na página, ligada ao conteúdo ao redor. |
| [AreaTexto](components/AreaTexto/README.md) · [exemplo](exemplos/AreaTexto.html) | Várias linhas para notas, contribuições e justificativas. |
| [Avatar](components/Avatar/README.md) · [exemplo](exemplos/Avatar.html) | Identifica quem assina: iniciais em círculo; nunca foto de perfil. |
| [Badge](components/Badge/README.md) · [exemplo](exemplos/Badge.html) | Rótulo curto, não clicável, em cápsula. Para temas clicáveis use Chip de tema. |
| [Botao](components/Botao/README.md) · [exemplo](exemplos/Botao.html) | Ação em forma de cápsula; o rótulo diz exatamente o que acontece. |
| [Breadcrumbs](components/Breadcrumbs/README.md) · [exemplo](exemplos/Breadcrumbs.html) | Mostra o caminho até a página atual (Acervo › Sala › Coleção › Conteúdo) numa cápsula de vidro. |
| [CampoTexto](components/CampoTexto/README.md) · [exemplo](exemplos/CampoTexto.html) | Entrada de uma linha, com rótulo sempre visível acima. |
| [CampoImagem](components/CampoImagem/README.md) · [exemplo](exemplos/CampoImagem.html) | Envio de uma imagem com prévia, troca, remoção e erro de tipo ou tamanho. |
| [Checkbox](components/Checkbox/README.md) · [exemplo](exemplos/Checkbox.html) | Seleciona zero ou mais opções independentes. |
| [Drawer](components/Drawer/README.md) · [exemplo](exemplos/Drawer.html) | Painel para filtros, detalhes de fonte ou navegação secundária, sem sair da página. |
| [Menu](components/Menu/README.md) · [exemplo](exemplos/Menu.html) | Lista de ações ligada a um botão, em material espesso. |
| [Modal](components/Modal/README.md) · [exemplo](exemplos/Modal.html) | Interrompe o fluxo para uma decisão (alerta) ou um formulário curto (sheet). |
| [Paginacao](components/Paginacao/README.md) · [exemplo](exemplos/Paginacao.html) | Navega entre páginas de resultados (numerada) ou entre destaques de um carrossel (pontos). |
| [Radio](components/Radio/README.md) · [exemplo](exemplos/Radio.html) | Escolha única quando todas as opções cabem na tela (até 5). |
| [Select](components/Select/README.md) · [exemplo](exemplos/Select.html) | Escolha única com o `<select>` nativo (teclado, leitor de tela e roda nativa no iOS). |
| [Slider](components/Slider/README.md) · [exemplo](exemplos/Slider.html) | Valor dentro de um intervalo contínuo, como período histórico ou tamanho de leitura. |
| [Switch](components/Switch/README.md) · [exemplo](exemplos/Switch.html) | Preferência de efeito imediato, sem botão de salvar. |
| [Tabs](components/Tabs/README.md) · [exemplo](exemplos/Tabs.html) | Alterna vistas do mesmo objeto com o controle segmentado; navega entre seções com a barra de abas. |
| [Toast](components/Toast/README.md) · [exemplo](exemplos/Toast.html) | Confirmação breve, em cápsula de vidro centralizada embaixo. |
| [Tooltip](components/Tooltip/README.md) · [exemplo](exemplos/Tooltip.html) | Nomeia um controle só com ícone ou expande uma sigla. |

### Componentes do acervo

| Peça | Para quê |
| --- | --- |
| [BlocoCitacao](components/BlocoCitacao/README.md) · [exemplo](exemplos/BlocoCitacao.html) | Trecho de fonte primária com original, tradução, referência e ação de copiar. |
| [CardConteudo](components/CardConteudo/README.md) · [exemplo](exemplos/CardConteudo.html) | Resumo de um artigo, vídeo ou verbete: tipo, Sala de origem, título, tema, nível, autoria e procedência. Em linha, em modo destaque compacto para vitrines e com imagem para as grades do acervo. |
| [AutoriaConteudo](components/AutoriaConteudo/README.md) · [exemplo](exemplos/AutoriaConteudo.html) | Coluna da página de leitura: avatar, nome e credencial, filete e dados em linhas (data, leitura, nível, temas, proveniência, compartilhar). |
| [CorpoArtigo](components/CorpoArtigo/README.md) · [exemplo](exemplos/CorpoArtigo.html) | Texto em blocos (lead, parágrafo, intertítulo, destaque e imagem) e a leitura em duas colunas com autoria e extras. |
| [CardFonte](components/CardFonte/README.md) · [exemplo](exemplos/CardFonte.html) | Uma obra usada pelo acervo ou pelo assistente, apresentada como um livro: capa, título, autor, tradição, tipo e referência. |
| [CardSala](components/CardSala/README.md) · [exemplo](exemplos/CardSala.html) | Porta de entrada de uma Sala: placa com o arco, nome, tradição, volume, nível predominante e última atualização. |
| [CardVideo](components/CardVideo/README.md) · [exemplo](exemplos/CardVideo.html) | Vídeo do canal com miniatura, duração, Sala ou tema e a ação de assistir (abre o YouTube em nova aba). |
| [ChipTema](components/ChipTema/README.md) · [exemplo](exemplos/ChipTema.html) | Tema que atravessa várias Salas ("morte", "meditação", "origem do universo", "alma"). Clicar filtra ou abre a comparação daquele tema. |
| [LinhaDoTempo](components/LinhaDoTempo/README.md) · [exemplo](exemplos/LinhaDoTempo.html) | Eventos e documentos em ordem, ligados por arcos cuja altura mostra quanto tempo separa um do outro. |
| [SeloNivel](components/SeloNivel/README.md) · [exemplo](exemplos/SeloNivel.html) | Nível de aprofundamento como uma pequena escada de três degraus, sempre com a palavra. |
| [ListaConteudos](components/ListaConteudos/README.md) · [exemplo](exemplos/ListaConteudos.html) | Conteúdos em linhas, sem card (título, meta, selo compacto, chevron), e o item compacto para retomar ou começar uma leitura. |
| [SeloProveniencia](components/SeloProveniencia/README.md) · [exemplo](exemplos/SeloProveniencia.html) | Diz de onde vem cada conteúdo. Obrigatório em cards, citações, colunas da grade comparativa e respostas do assistente. |
| [TrilhaEstudo](components/TrilhaEstudo/README.md) · [exemplo](exemplos/TrilhaEstudo.html) | Sequência de etapas que leva do iniciante ao avançado dentro de uma Sala, desenhada como degraus ligados por arcos que sobem. |
| [VerbeteGlossario](components/VerbeteGlossario/README.md) · [exemplo](exemplos/VerbeteGlossario.html) | Termo de uma tradição com origem, definição atribuída e as Salas onde aparece, organizado por letra. |

### Busca comparativa

| Peça | Para quê |
| --- | --- |
| [BarraBusca](components/BarraBusca/README.md) · [exemplo](exemplos/BarraBusca.html) | Ponto de partida da busca comparativa, com dois modos: por Sala/tradição ou por tema/pergunta. |
| [CommandPalette](components/CommandPalette/README.md) · [exemplo](exemplos/CommandPalette.html) | Atalho de teclado para ir a qualquer Sala, tema ou ação, como o Spotlight. |
| [FiltrosBusca](components/FiltrosBusca/README.md) · [exemplo](exemplos/FiltrosBusca.html) | Refinam os resultados por Sala, tema, nível, tipo de conteúdo e formato. |
| [GradeComparativa](components/GradeComparativa/README.md) · [exemplo](exemplos/GradeComparativa.html) | Uma pergunta central e a resposta de cada Sala lado a lado, sem produzir síntese única. |

### Assistente de IA

| Peça | Para quê |
| --- | --- |
| [AvisoNeutralidade](components/AvisoNeutralidade/README.md) · [exemplo](exemplos/AvisoNeutralidade.html) | Lembrete permanente de que a IA não determina qual crença é verdadeira e de que toda resposta aponta suas fontes. |
| [CampoPerguntaIA](components/CampoPerguntaIA/README.md) · [exemplo](exemplos/CampoPerguntaIA.html) | Onde a pessoa escreve para o assistente: cresce com o texto, oferece temas em chips e alterna entre enviar e interromper. |
| [IndicadorConsulta](components/IndicadorConsulta/README.md) · [exemplo](exemplos/IndicadorConsulta.html) | Mostra que o assistente está consultando o acervo, há quanto tempo e em que etapa. |
| [MensagemAssistente](components/MensagemAssistente/README.md) · [exemplo](exemplos/MensagemAssistente.html) | Resposta do assistente, identificada como IA, com três tipos de trecho visualmente distintos, fontes numeradas e ações. |

### Estrutura do portal

| Peça | Para quê |
| --- | --- |
| [NavegacaoLateral](components/NavegacaoLateral/README.md) · [exemplo](exemplos/NavegacaoLateral.html) | Navegação principal do portal e da curadoria: perfil, "Continuar", itens em grupos e rodapé; recolhível para só ícones. |
| [BarraSuperior](components/BarraSuperior/README.md) · [exemplo](exemplos/BarraSuperior.html) | Título da página e saudação ou trilha; busca, aparência e conta. Entra na camada flutuante ao rolar. |
| [BannerRotativo](components/BannerRotativo/README.md) · [exemplo](exemplos/BannerRotativo.html) | Card largo no topo do Portal que alterna marca, episódios e anúncios, com pausa. |
| [Carrossel](components/Carrossel/README.md) · [exemplo](exemplos/Carrossel.html) | Faixa horizontal de cards com cabeçalho, setas e scroll-snap. |
| [PainelBusca](components/PainelBusca/README.md) · [exemplo](exemplos/PainelBusca.html) | Busca no topo da tela (lupa ou ⌘K) com sugestões de Salas, temas, conteúdos e o assistente. |
| [BotaoFlutuante](components/BotaoFlutuante/README.md) · [exemplo](exemplos/BotaoFlutuante.html) | Atalho de vidro para o assistente sobre qualquer página. |
| [Onboarding](components/Onboarding/README.md) · [exemplo](exemplos/Onboarding.html) | Primeiro acesso em etapas: boas-vindas, interesses, religião ou convicção (opcional) e resumo. |
| [ListaDestaques](components/ListaDestaques/README.md) · [exemplo](exemplos/ListaDestaques.html) | Ranking curto ("Mais pesquisados") em que o item apontado cresce e abre a miniatura. |
| [CabecalhoPerfil](components/CabecalhoPerfil/README.md) · [exemplo](exemplos/CabecalhoPerfil.html) | Abre o Perfil do buscador: capa, foto, papel, números de estudo e ações. |
| [SeletorTema](components/SeletorTema/README.md) · [exemplo](exemplos/SeletorTema.html) | Quatro temas em miniatura para o diálogo de Aparência, com a opção de lateral translúcida. |
| [CabecalhoSala](components/CabecalhoSala/README.md) · [exemplo](exemplos/CabecalhoSala.html) | Abre a página da Sala: nome à esquerda; descrição, assinatura do anfitrião (ou o assistente) e dados à direita. |
| [BannerSala](components/BannerSala/README.md) · [exemplo](exemplos/BannerSala.html) | Imagem da Sala na largura toda (3:1, 2:1, 16:10 pelo container) ou a placa com o arco, com crédito. |
| [PainelCabecalho](components/PainelCabecalho/README.md) · [exemplo](exemplos/PainelCabecalho.html) | Abre uma seção grande: rótulo, título e subtítulo, com vistas, busca e filtros à direita. |
| [PainelProgresso](components/PainelProgresso/README.md) · [exemplo](exemplos/PainelProgresso.html) | Indicadores, leitura e anúncio num contêiner só, na grade de quatro colunas dos indicadores. |
| [Conquista](components/Conquista/README.md) · [exemplo](exemplos/Conquista.html) | Marco de estudo privado: emblema de ouro obtido ou bloqueado com o critério. |
| [EspacoPublicitario](components/EspacoPublicitario/README.md) · [exemplo](exemplos/EspacoPublicitario.html) | Anúncio identificado, no painel, em coluna ou banner, distinto do acervo. |
| [Rodape](components/Rodape/README.md) · [exemplo](exemplos/Rodape.html) | Marca e frase, colunas de links e linha final. |

### Comunidade

| Peça | Para quê |
| --- | --- |
| [Comunidade](components/Comunidade/README.md) · [exemplo](exemplos/Comunidade.html) | Comunidade — montagem de referência. |
| [CardPublicacao](components/CardPublicacao/README.md) · [exemplo](exemplos/CardPublicacao.html) | Cartão de publicação. |
| [CompositorComunidade](components/CompositorComunidade/README.md) · [exemplo](exemplos/CompositorComunidade.html) | Compositor da comunidade. |
| [LinhaComentario](components/LinhaComentario/README.md) · [exemplo](exemplos/LinhaComentario.html) | Linha de comentário. |
| [LinhaPessoa](components/LinhaPessoa/README.md) · [exemplo](exemplos/LinhaPessoa.html) | Linha de pessoa. |
| [CartaoLateralComunidade](components/CartaoLateralComunidade/README.md) · [exemplo](exemplos/CartaoLateralComunidade.html) | Cartão lateral de comunidade. |
| [BarraAcoesComunidade](components/BarraAcoesComunidade/README.md) · [exemplo](exemplos/BarraAcoesComunidade.html) | Barra de ações da comunidade. |
| [PainelComentarios](components/PainelComentarios/README.md) · [exemplo](exemplos/PainelComentarios.html) | Painel de comentários. |

### Curadoria

| Peça | Para quê |
| --- | --- |
| [TabelaDados](components/TabelaDados/README.md) · [exemplo](exemplos/TabelaDados.html) | Lista editorial com colunas, ordenação e seleção; vira lista no celular. |
| [BarraFormatacao](components/BarraFormatacao/README.md) · [exemplo](exemplos/BarraFormatacao.html) | Barra no topo do campo de texto longo: ênfase, termo, obra, chamada de fonte e limpar formatação, sem HTML. |
| [EditorTextoMarcado](components/EditorTextoMarcado/README.md) · [exemplo](exemplos/EditorTextoMarcado.html) | Edita o corpo parágrafo por parágrafo, com estilos, listas, alinhamento, marcações de trecho e pré-visualização. |
| [ChecklistPublicacao](components/ChecklistPublicacao/README.md) · [exemplo](exemplos/ChecklistPublicacao.html) | O que falta para um item ir ao ar; pendências bloqueiam a publicação, alertas de voz só avisam. |
| [IndicadorSalvamento](components/IndicadorSalvamento/README.md) · [exemplo](exemplos/IndicadorSalvamento.html) | Cápsula discreta que diz se o rascunho está salvo. |
| [IndicadorNumerico](components/IndicadorNumerico/README.md) · [exemplo](exemplos/IndicadorNumerico.html) | Um total do acervo e como ele se divide, para o painel da curadoria. |

## Estados e orientação importados da V3

As seis peças novas usam `components/EstadosInterface/estados-interface.css` e `components/EstadosInterface/estados-interface.js`, carregados automaticamente nos exemplos. Em páginas consumidoras, carregue os dois depois do bundle. Para conteúdo dinâmico, use `SalaInterface.hydrate(elemento)`. O runtime é gerado de `runtime.modelo.js` e `icones.json`; os glifos são do Phosphor (licença MIT em `components/Iconografia/LICENCA-PHOSPHOR.txt`).

Origem: https://github.com/gustavoffca-code/Sala_BuscadoresV3, commit `479e989df5ec99d6e15078b8da6ff92a640b045d`. A integração adiciona peças ausentes, preservando os componentes locais existentes. Os exemplos HTML estão disponíveis no catálogo; os componentes React correspondentes estão em `portal/src/components/ds/EstadosInterface.tsx` e `DialogoContextual.tsx`.

Verificação dos novos exemplos e limites de progresso: `node design-system/scripts/test-estados-interface.cjs` a partir da raiz (usa o jsdom já instalado em `portal/node_modules`).

## Formatação de texto longo

A Barra de formatação usa `components/BarraFormatacao/marcacao.mjs` como gramática única. O gerador inclui essa fonte e `runtime.js` no bundle; o sincronizador leva o módulo puro para o portal. `conteudo.json` define o limite real do resumo do lead, usado pela regra do portal e pelo exemplo gerado. A atualização da barra requer republicar a biblioteca.
