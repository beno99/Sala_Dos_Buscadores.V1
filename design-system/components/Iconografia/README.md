# Iconografia

A família de 24 ícones da Sala é plana, preenchida e monocromática. Esta orientação substitui 3D, duotone, contornos decorativos e hover dourado. Fonte oficial: `sala.json`; grade 256. Recortes são subcaminhos transparentes com `fill-rule="evenodd"`, nunca áreas brancas.

## Família e nomes públicos

| Nome | Desenho |
| --- | --- |
| `inicio` | Portal: arco com uma folha de porta aberta. |
| `salas` | Salas: dois painéis sobrepostos. |
| `artigo` | Artigos: documento com dobra e recortes de texto. |
| `video` | Vídeos: claquete (barra listrada e corpo com reprodução recortada). |
| `biblioteca` | Biblioteca: um único livro aberto, com páginas separadas por espaço negativo. |
| `destaques` | Destaques: estrela editorial. |
| `anfitrioes` | Anfitriões: retrato em moldura. |
| `grupo` | Comunidade: grupo de pessoas (uma à frente, duas atrás, separadas por espaço). |
| `trilha` | Trilhas: arco alongado (altura 200, largura 144), abertura ampla e trapézio curto separado das laterais. |
| `estante` | Estante: itens guardados (caixa com alça recortada e tampa). |
| `jornada` | Minha Jornada: passos (duas pegadas, antepé e calcanhar). |
| `comparar` | Comparar: dois painéis lado a lado. |
| `assistente` | Assistente do acervo: um balão de conversa. |
| `mensagens` | Mensagens: duas correspondências sobrepostas, separadas por espaço. |
| `curadoria` | Curadoria: prancheta com verificação recortada. |
| `sair` | Sair: porta com seta de saída, mesma cor semântica da família. |
| `reticencias` | Mais: três pontos. |
| `busca` | Busca: lente vazada e cabo. |
| `tema` | Aparência: disco dividido entre claro e escuro. |
| `pessoa` | Conta: avatar circular (pessoa recortada no disco). |
| `voltar` | Voltar: seta para a esquerda. |
| `fechar` | Fechar: xis. |
| `salvar` | Salvar: marcador. |
| `leitura` | Leitura: livro aberto com marcador recortado na página direita. |

Biblioteca mostra um único livro com vão central de 16 unidades. Leitura adiciona marcador recortado. Trilhas mede 200 × 144 (1,39:1), com laterais de 24 e vão de 96; o caminho é um trapézio curto de 44 unidades de altura, separado das laterais. Só Portal tem folha de porta.

## Cor e estados

`fill="currentColor"` em todas as massas. O SVG recebe explicitamente `icon-color` (grafite no claro, branco suave no escuro), sem herdar destaques do texto. Superfícies preenchidas definem `--sdb-icon-surface` com seu token de primeiro plano. Os aliases `icon-color-hover` e `icon-color-selected` permanecem por compatibilidade e apontam para `icon-color`.

| Estado | Opacidade do SVG | Gatilho no controle |
| --- | --- | --- |
| Repouso | 0.60 | padrão |
| Hover | 1 | `:hover`, somente `(hover: hover) and (pointer: fine)` |
| Foco | 1 | `:focus-visible` |
| Pressionado | 1 | `:active` |
| Selecionado | 1 | `aria-current`, `aria-selected="true"` ou `aria-pressed="true"`, conforme a semântica |
| Desabilitado | 0.60, cor desabilitada | `disabled`, `aria-disabled="true"` ou `fieldset:disabled`; prevalece sobre interação |

Geometria idêntica em todos os estados. Transição apenas de opacity, 150 ms; nenhuma com `prefers-reduced-motion`. Texto, fundo arredondado de seleção e anel de foco continuam independentes. A cor só se adapta quando a superfície exige outro primeiro plano. Sem transformações, sombras, gradientes ou traços extras no SVG.

## Integração

`<Icon name="biblioteca" />`, `<InterfaceIcon name="biblioteca" />`, `<span data-icon="biblioteca"></span>` e `SalaBuscadores.icon("biblioteca")` compartilham a fonte oficial. Execute `SalaBuscadores.hydrate()` para os placeholders HTML. Ícones são decorativos (`aria-hidden="true"`, `focusable="false"`); nomeie o botão/link com rótulo ou `aria-label`. Tamanhos públicos e nomes permanecem compatíveis. A classe legada `sdb-icon__duo` é apenas um identificador da família plana.

O catálogo mostra os 24 desenhos em 20, 24 e 32 px, todos os quatro temas, seis estados e navegação desktop/mobile. Colunas congeladas demonstram hover/foco/pressão; os controles também aceitam interação real. Os demais ícones continuam Phosphor (MIT); os símbolos de proveniência não são substituídos por símbolos de navegação.

## Geração e validação

Edite `sala.json`, `tokens.json`, `components/bundle.css` e esta prévia. Rode `node design-system/scripts/build.mjs`, `node design-system/scripts/contraste.mjs`, depois `bun run ds:sync` e `bun run check` em `portal/`. O contraste compõe a opacidade de 60% sobre as superfícies antes de exigir 3:1. Arquivos em `portal/src/design-system/`, exemplos e catálogo são gerados.
