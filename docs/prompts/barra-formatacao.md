# Barra de formatação: edição de texto nos campos longos

Antes de começar, leia:
- `CLAUDE.md` na raiz;
- `design-system/README.md` e `design-system/DIRETRIZES.md`;
- `design-system/components/BarraFormatacao/README.md` (a peça nova) e `design-system/components/EditorTextoMarcado/README.md`;
- os exemplos `design-system/exemplos/BarraFormatacao.html` e `design-system/exemplos/EditorTextoMarcado.html`;
- no portal: `portal/src/components/ds/BarraFormatacao.tsx`, `marcacao.ts`, `TextoMarcado.tsx`, `EditorBlocos.tsx`, `EditorTextoMarcado.tsx` e `CorpoArtigo.tsx`.

Regras:
- Use só classes e tokens do design system: nada de cor, raio, sombra ou espaço solto.
- Nunca edite `portal/src/design-system/`, que é cópia gerada por `npm run ds:sync`.
- Se faltar uma peça ou variação, estenda o design system primeiro (`tokens.json`, `components/bundle.css`, guia e `preview.html` da peça). Depois rode `node design-system/scripts/build.mjs` e `node design-system/scripts/contraste.mjs`, e me avise que a versão publicada precisa ser atualizada.
- O editor continua **sem HTML**: a barra só escreve os mesmos sinais que a pessoa pode digitar à mão.
- Antes de concluir cada fase: `npm run check` na pasta `portal/`. Nas fases que mexem no fluxo de edição, rode também `npm run test:e2e`.

Ordem de trabalho: três fases (A → C). **Pare ao fim de cada uma** para eu revisar, com um resumo do que mudou e de como conferir.

---

## 0. O que muda, em uma frase

O editor de blocos tinha só dois botões soltos (Termo e Obra) acima da área de texto. Agora cada campo de texto longo tem uma **barra de formatação** no topo, dentro do próprio campo, com ênfase, as marcações do acervo e a chamada de fonte — e o que ela escreve aparece renderizado na pré-visualização e na página do artigo.

## 1. A sintaxe de marcação (modelo de conteúdo)

`TextoMarcado` é uma string. Estes são todos os sinais que ela aceita:

| Sinal | Vira | Para quê |
|---|---|---|
| `**negrito**` | `<strong>` | Ênfase forte. **Novo.** |
| `*termo*` | `<dfn>` | Vocabulário próprio da tradição (gnose, pleroma, nous). Já existia. |
| `_obra_` | `<cite>` | Título de obra (Evangelho de Tomé, Poimandres). Já existia. |
| `[texto](endereço)` | `<a class="sdb-link">` | Link. **Novo.** Só `https://` ou caminho interno começando por `/`; endereço inseguro não vira link, aparece como `texto (endereço)`. Link externo abre em nova aba. |
| `[1]` | `.sdb-ref` | Chamada da obra citada, na ordem das obras escolhidas no card Fontes. Já existia, mas **sumia** quando não havia lista de fontes à mão; agora aparece como marca em qualquer contexto. |

Não existe itálico solto, de propósito: `_obra_` já é itálico e dois itálicos iguais confundiriam quem lê. Se alguém pedir, discuta antes de inventar um sinal.

## 2. O que já está pronto (não refaça; confira)

### Design system (`design-system/`)
- Token novo `text-selection` em `tokens.json` (trecho selecionado no campo em foco), nos quatro temas, com os dois pares conferidos em `scripts/contraste.mjs`.
- Três ícones novos do Phosphor em `components/Iconografia/phosphor.json`: `negrito` (text-b), `link` (link-simple) e `limparFormato` (text-t-slash). Regerados com `node design-system/scripts/icones-phosphor.mjs <pasta do pacote @phosphor-icons/core@2.1.1>`.
- Em `components/bundle.css`: `.sdb-control--fmt` (campo que contém a barra e a área de texto), `.sdb-fmt`, `.sdb-fmt__btn`, `.sdb-fmt__sep` e `.sdb-field__foot` (linha de ajuda + contador). Saiu `.sdb-editor__marks`.
- Em `components/bundle.js`: comportamento por atributo — `data-fmt="negrito|termo|obra|link|limpar"`, `data-fmt-ref="1"` e `data-fmt-for="<id da área de texto>"`; atalhos ⌘B e ⌘K; `aria-pressed` que acende conforme o cursor anda; escrita por `document.execCommand("insertText")`, para o ⌘Z do navegador continuar desfazendo marcação por marcação.
- Peça nova `components/BarraFormatacao/` (guia + preview), registrada na tabela do `README.md` em Curadoria.
- `components/EditorTextoMarcado/` passou a usar a barra dentro do campo; o guia e o preview foram atualizados.

### Portal (`portal/src/`)
- `components/ds/marcacao.ts`: funções puras (`aplicarMarcacao`, `limparMarcacoes`, `citarFonte`, `jaMarcado`) que devolvem o texto novo, o trecho trocado e onde fica o cursor.
- `components/ds/BarraFormatacao.tsx`: a barra em React, com as mesmas classes e atributos. "Citar fonte" é o `Menu` com as obras já escolhidas, numeradas; sem obras, o botão fica desabilitado com a dica "Escolha uma obra em Fontes".
- `components/ds/TextoMarcado.tsx`: renderiza os sinais da tabela acima.
- `EditorBlocos.tsx` e `EditorTextoMarcado.tsx` usam a barra; o lead ganhou rodapé com o limite do resumo e o contador.
- `features/anfitriao/ui/EditorArtigoAnfitriao.tsx` e `features/admin/ui/EditorArtigo.tsx` passam as obras escolhidas (`fontes={[{ n, titulo }]}`) e o anfitrião passa também `limiteResumo={LIMITE_RESUMO}`.
- Testes em `components/ds/BarraFormatacao.test.tsx`.

## 3. Fase A — a chamada `[n]` leva à obra na página do artigo

Hoje a chamada aparece como marca, mas não leva a lugar nenhum fora da resposta do assistente.

- Em `features/acervo/LeituraConteudo.tsx`, numere as obras da coluna "Fontes" na mesma ordem de `conteudo.fontes` e dê um `id` a cada uma.
- Passe `hrefRef` ao corpo do artigo (`CorpoArtigo` → `BlocoDoCorpo` → `TextoMarcado`), para `[n]` virar link até a obra.
- A obra apontada recebe foco visível ao chegar (`:target`), sem rolagem brusca.
- Se o artigo citar um número que não existe na lista, mostre a marca sem link — nunca um link quebrado.

**Pronto quando:** clicar em `[1]` no texto leva à primeira obra da lista, com teclado e leitor de tela funcionando, e o artigo sem fontes continua igual.

## 4. Fase B — painel de link e painel de citar fonte

Estão desenhados no Figma (arquivo `Sala_Dos_Buscadores`, seção "Edição de texto") e ainda não existem no código: hoje o endereço do link é digitado em linha e as fontes vêm por menu.

- **Painel de link:** abre no botão Link (⌘K) ou ao clicar num link do texto. Campo "Endereço", a ajuda dizendo qual trecho está marcado, "Remover link" (só quando já existe) e "Aplicar". Enter aplica, Esc fecha sem mudar. Valide com a mesma regra de `validarLinkHttps` (`features/anfitriao/regras/artigo.ts`).
- **Painel de citar fonte:** lista as obras escolhidas, numeradas, com um campo opcional de trecho ou página, e "Outra fonte do acervo", que abre a busca do catálogo e também adiciona a obra ao card Fontes.
- Os dois são camada sobreposta: use os tokens `overlay-*` e `float-*`, como no [Menu](../../design-system/components/Menu/README.md), com foco preso e devolução do foco ao fechar.
- Comece pelo design system (guia, `preview.html`, CSS e comportamento), depois o React.

**Pronto quando:** dá para pôr e tirar um link sem digitar parênteses, e citar uma obra escolhendo trecho, com teclado só.

## 5. Fase C — barra flutuante sobre a seleção

Também desenhada no Figma e ainda não feita. É a mesma barra, em grafite (`prominent-fill`), que aparece acima do trecho selecionado com o mouse e some ao rolar ou ao clicar fora.

- Posição: medir o retângulo da seleção dentro da área de texto (espelho invisível com a mesma tipografia, ou `Range` quando o campo virar `contenteditable` — decida e justifique).
- Abaixo quando não couber acima; nunca por cima do próprio trecho.
- Não aparece no toque (o sistema já mostra o menu nativo) nem com `prefers-reduced-motion` fazendo deslocamento: nesse caso, só esmaecimento.
- A barra fixa continua existindo: a flutuante é atalho, não substituta.

**Pronto quando:** selecionar um trecho com o mouse mostra a barra escura sobre ele, marcar funciona e a seleção não se perde.

## 6. Decisões já tomadas (não reabra sem me perguntar)

- **Sem itálico solto** e **sem botões de desfazer/refazer**: o ⌘Z do navegador já funciona porque a barra escreve com `insertText`. Rastrear a profundidade do histórico daria um botão que mente.
- **Atalhos só ⌘B e ⌘K.** Termo, Obra e Citar fonte não têm atalho: as combinações livres conflitam com o navegador, e os três botões são palavras à vista.
- **Nada de editor rico.** Se precisar de mais marcação, ela entra como sinal no `TextoMarcado`, com guia e teste.

## 7. Como conferir

```bash
node design-system/scripts/build.mjs --check   # os gerados estão em dia?
node design-system/scripts/contraste.mjs       # AA nos quatro temas
cd portal && npm run check                     # ds:check, lint, tipos e testes
cd portal && npm run test:e2e                  # fluxo de edição
```

Abra `design-system/catalogo.html` e a peça "Barra Formatacao" para ver os quatro estados, e `/anfitriao/salas/<id>/artigos/novo` no portal para ver a barra no editor.

Aviso conhecido: os testes `tests/e2e/curadoria.spec.ts` e `tests/e2e/estados-interface.spec.ts` já falhavam antes deste trabalho, porque apontam para rotas do admin que a reorganização "Sala primeiro" removeu (`/admin/artigos/novo` virou redirecionamento para `/admin/salas`). Não são desta peça; se for arrumá-los, trate como tarefa à parte.
