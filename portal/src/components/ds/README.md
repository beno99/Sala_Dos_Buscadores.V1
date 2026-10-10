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
| CardConteudo, pilha, linha e vitrine | `CardConteudo.tsx`, `CardConteudoVitrine.tsx` |
| Fontes, citações, glossário e listas de conteúdo | `CardFonte.tsx`, `BlocoCitacao.tsx`, `Glossario.tsx`, `ListaConteudos.tsx` |
| Navegação lateral, barra superior, abas móveis e rodapé | `NavegacaoLateral.tsx`, `NavegacaoLateralApp.tsx`, `BarraSuperior.tsx`, `BarraAbasApp.tsx`, `../layout/Rodape.tsx` |
| BannerRotativo, Carrossel e ListaDestaques | Arquivos de mesmo nome nesta pasta |
| Progresso, conquistas e publicidade | `PainelProgresso.tsx`, `PainelIndicadores.tsx`, `Conquista.tsx`, `EspacoPublicitario.tsx` |
| Tabela, editor, checklist e indicadores editoriais | `TabelaDados.tsx`, `EditorTextoMarcado.tsx`, `Curadoria.tsx` |
| Busca, filtros, painel de busca e comparação | `../../features/busca` |
| CampoPerguntaIA, IndicadorConsulta e MensagemAssistente | `../../features/assistente` |
| AvisoNeutralidade e BotaoFlutuante | `AvisoNeutralidade.tsx`, `OrbeAssistente.tsx` |
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

`CardSala` aceita `destaque`, `horizontal`, imagem ou placa e progresso. `CardConteudo` aceita `empilhado`; `CardConteudoLinha` oferece miniatura, data e nível ou progresso e ação de retomar. `CardConteudoVitrine` mantém os formatos `alto`, `horizontal` e `normal`. Os cartões de conteúdo mantêm o Selo de proveniência.

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
