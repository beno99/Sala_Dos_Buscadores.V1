# Componentes React do portal

A referência visual e comportamental é [`design-system/components`](../../../../design-system/components). Os componentes React usam o CSS da referência e mantêm estado, eventos e foco no React. Os exemplos HTML demonstram dados locais; as telas do portal continuam usando seus próprios dados e ações.

## Estilos e atualização

O layout raiz carrega os tokens, o bundle CSS, os temas, os estilos dos cartões, o orbe e os refinamentos, nessa ordem. `src/design-system` é gerado pelo sincronizador: edite a biblioteca de referência e execute `npm run ds:sync`. `npm run ds:check` detecta divergências.

Não carregue `bundle.js` ou `refined.js` sobre os componentes React: seus eventos delegados duplicariam ações e alterariam o DOM fora do estado do React. Ícones e fontes são extraídos pelo sincronizador; o renderizador visual do orbe é reaproveitado diretamente.

## Onde encontrar

| Família da referência | Implementação React |
| --- | --- |
| Arco e iconografia | `Arc.tsx`, `Icon.tsx` |
| Materiais, movimento, proporção e tipografia | Tokens e classes CSS importados pelo layout raiz |
| Botão, avatar, chips e selos | `Button.tsx`, `Avatar.tsx`, `Chip.tsx`, `Selos.tsx`, `SeloNivelProgresso.tsx` |
| CampoTexto e Checkbox | `Campos.tsx` |
| AreaTexto, Select e Radio | `CamposExtras.tsx` |
| Switch e Slider | `Switch.tsx`, `Slider.tsx` |
| Accordion e abas segmentadas | `Accordion.tsx`, `Segmented.tsx` |
| Menu, Modal, Drawer e Toast | `Menu.tsx`, `Modal.tsx`, `Sheet.tsx`, `Drawer.tsx`, `Toast.tsx` |
| Tooltip | CSS `data-tip`; `Button` fornece a dica de botões só com ícone a partir de `aria-label` |
| Breadcrumbs, paginação e alerta | `Breadcrumbs.tsx`, `Paginacao.tsx`, `Alerta.tsx` |
| CardSala e CardVideo | `CardSala.tsx`, `CardVideo.tsx` |
| CardConteudo, pilha, linha, vitrine e com imagem (acervo) | `CardConteudo.tsx`, `CardConteudoVitrine.tsx`, `CardAcervo.tsx` |
| Cabeçalho e banner da Sala | `CabecalhoSala.tsx`, `BannerSala.tsx` |
| Fontes, citações, glossário e listas de conteúdo | `CardFonte.tsx`, `BlocoCitacao.tsx`, `Glossario.tsx`, `ListaConteudos.tsx` |
| Navegação lateral, barra superior, abas móveis e rodapé | `NavegacaoLateral.tsx`, `NavegacaoLateralApp.tsx`, `BarraSuperior.tsx`, `BarraAbasApp.tsx`, `../layout/Rodape.tsx` |
| BannerRotativo, Carrossel e ListaDestaques | Arquivos de mesmo nome nesta pasta |
| Progresso, conquistas e publicidade | `PainelProgresso.tsx`, `PainelIndicadores.tsx`, `Conquista.tsx`, `EspacoPublicitario.tsx` |
| Tabela, editor, checklist e indicadores editoriais | `TabelaDados.tsx`, `EditorTextoMarcado.tsx`, `EditorBlocos.tsx`, `Curadoria.tsx` |
| Barra de formatação do texto marcado | `BarraFormatacao.tsx` (botões e menu) e `marcacao.ts` (as funções puras que escrevem `**negrito**`, `*termo*`, `::obra::`, `[texto](endereço)` e `[n]`) |
| Busca, filtros, painel de busca e comparação | `../../features/busca` |
| CampoPerguntaIA, IndicadorConsulta e MensagemAssistente | `../../features/assistente` |
| AvisoNeutralidade e BotaoFlutuante | `AvisoNeutralidade.tsx`, `OrbeAssistente.tsx` |
| Estados vazios, avisos, carregamento, progresso real e ícones com volume | `EstadosInterface.tsx`, `InterfaceIcon.tsx` |
| Diálogo de orientação | `DialogoContextual.tsx` |
| Onboarding | `../../features/onboarding/Onboarding.tsx` |

## Controles

```tsx
import { CampoTexto } from "@/components/ds/Campos";
import { AreaTexto } from "@/components/ds/CamposExtras";
import { Switch } from "@/components/ds/Switch";
import { Slider } from "@/components/ds/Slider";

<CampoTexto label="Buscar nesta Sala" type="search" />
<AreaTexto label="Nota de estudo" defaultValue="" maxLength={600} contador />
<Switch label="Mostrar texto original" checked={mostrarOriginal}
  onChange={(e) => setMostrarOriginal(e.target.checked)} />
<Slider label="Tamanho do texto de leitura" min={16} max={24}
  defaultValue={19} format="{v} px" />
```

Switch aplica a preferência no `onChange`; Checkbox representa uma seleção. Slider aceita `value`/`onChange` ou `defaultValue`, mostra valor e extremos e usa `format`, `minLabel` e `maxLabel` para unidades e legendas. A área de texto conta caracteres com ou sem valor controlado e acompanha o reset do formulário. CampoTexto oferece busca com limpar e senha com mostrar/ocultar; ajuda, erro e descritores externos são associados ao campo.

## Cartões

`CardSala` aceita `destaque`, `horizontal`, imagem ou placa e progresso. `CardConteudo` aceita `empilhado`; `CardConteudoLinha` oferece miniatura, data e nível ou progresso e ação de retomar. `CardConteudoVitrine` mantém os formatos `alto`, `horizontal` e `normal`. `CardAcervo` é o card com imagem (`sala--acervo`); com `externo` abre em nova aba e, sem `href`, não vira link e mostra a `nota`. `BarraSuperior` aceita `saudacao` ou `trilha`, nunca as duas. Os cartões de conteúdo mantêm o Selo de proveniência.

O slot `acoes` de CardSala e CardConteudoVitrine recebe controles `.sala__save`; no CardConteudo, use `.sdb-over`. O consumidor implementa o estado e a persistência da Estante. O slot não grava favoritos demonstrativos da referência.

## Interações

- `Accordion single` mantém apenas um item aberto, inclusive quando um item começa com `defaultOpen`.
- `Menu` usa `checked` somente para preferências; ações comuns mantêm `menuitem`. `disabled` impede seleção e remove o item da navegação por setas. `atalho` exibe uma dica de tecla, sem registrar atalhos globais.
- Modal, Sheet e Drawer recebem foco ao abrir, prendem Tab no diálogo e devolvem foco ao gatilho ao fechar. Modal de confirmação inicia na ação segura.
- BannerRotativo troca a cada sete segundos e pausa por interação, visibilidade ou preferência de movimento reduzido.
- Segmented em modo `abas` mantém os IDs de abas e painéis; o consumidor renderiza e mostra os painéis correspondentes.

## Verificar

```sh
npm run check
npm run build
npm run test:e2e
```

Os testes de controles, preferências, menus, diálogos e banner cobrem as interações; as jornadas do navegador validam a integração nas telas do portal em desktop e celular.

## Estados e orientação V3

O sincronizador copia `estados-interface.css`, a licença Lucide e gera os SVGs em `interface-icons.generated.ts`. Os ícones com volume preservam os materiais opacos e sombras da referência. Os eventos ficam no React; `estados-interface.js` não é carregado no portal.

EstadoSecao aceita ação com `executar` ou link com `href`. ProgressoReal recebe concluídos e total reais, e pode usar `unidade` na legenda. CarregamentoSala entra no loading da rota de Salas. DialogoContextual usa o diálogo nativo para foco, Escape e fundo inerte.

## Comunidade · Fase A

Peças visuais e controladas: `CardPublicacao`, `CompositorComunidade`, `LinhaComentario`, `LinhaPessoa`, `CartaoLateralComunidade`, `BarraAcoesComunidade` e `PainelComentarios`. Mesma anatomia dos exemplos HTML; CSS vem da biblioteca canônica. `PessoaComunidadeVisual` aceita apenas dados públicos explícitos, nunca o registro inteiro de conta. `BarraAcoesComunidade` recebe estado e callbacks; as regras e a gravação chegam nas fases seguintes. O compositor fornece a casca de formulário; a tela monta os campos de cada tipo seguindo o exemplo. `PainelComentarios` reutiliza Sheet (foco preso e devolução). Demonstração integrada: `design-system/exemplos/Comunidade.html`.
