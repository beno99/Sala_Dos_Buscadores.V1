# Barra de formatação

Barra dentro do campo longo: um contêiner `.sdb-control.sdb-control--area.sdb-control--fmt` envolve os controles, a divisória e o textarea. Foco e erro envolvem o conjunto. O conteúdo do autor é sempre texto, nunca HTML.

## Conteúdo e gramática

O bloco guarda o estilo, o alinhamento e a lista. A string guarda somente marcas de trecho:

| Sinal | Elemento |
| --- | --- |
| `**texto**` | `strong` |
| `_texto_` | `em` |
| `__texto__` | `u` |
| `~~texto~~` | `s` |
| `*termo*` | `dfn` |
| `::obra::` | `cite` |
| `[texto](https://endereco)` ou `[texto](/caminho)` | `a` |
| `[1]` | referência, mesmo sem destino, lida como “Fonte 1” |

A gramática não aceita aninhamento: `**_texto_**` permanece literal. HTTPS e caminhos internos são as únicas URLs permitidas; `//dominio`, barras invertidas, controles e outros protocolos não viram link. URLs recusadas continuam visíveis entre parênteses. Links externos abrem outra aba com `noopener noreferrer`.

`marcacao.mjs` é a fonte única das funções puras, usada pelo runtime HTML e sincronizada para o portal com suas declarações TypeScript. `renderizarTexto` entrega nós seguros, nunca HTML. O React usa `TextoMarcado` tanto na prévia quanto na página. `runtime.js` é o comportamento do exemplo; o gerador inclui ambos no trecho `FORMATACAO` do bundle. Não edite esse trecho gerado.

## Blocos

- `paragrafo`: `texto`, `alinhamento?` (`esquerda`, `centro`, `direita`), `recuo?` (0–2).
- `intertitulo`: nome já usado pelo projeto para título; `texto`, `nivel` (2 ou 3), `alinhamento?`.
- `lista`: `itens: string[]`, `ordenada: boolean`.
- `destaque`: nome já usado pelo projeto para citação; `texto`, `atribuicao`.
- `imagem`: `src`, `alt`, `credito`, `legenda?`, além do identificador de mídia do portal.

Alinhamento usa classes `sdb-texto--esquerda`, `--centro` e `--direita`. O padrão é esquerda. **Justificado não é oferecido**, conforme DIRETRIZES.md. O recuo não tem botão nesta versão. Títulos desabilitam listas; listas e citações desabilitam alinhamento. Conversões preservam linhas, inclusive linhas vazias. Perda de atribuição, recuo ou alinhamento dispara Toast.

## Estrutura e comportamento

```html
<div class="sdb-control sdb-control--area sdb-control--fmt">
  <div class="sdb-fmt" role="toolbar" aria-label="Formatação do bloco 1"
       data-fmt-for="corpo-1" data-fmt-alvo="bloco 1">
    <button type="button" data-fmt-ref="1">[1] Hermetica</button>
  </div>
  <textarea id="corpo-1" rows="3">Segundo o ::Poimandres::…</textarea>
</div>
<div class="sdb-field__foot">
  <p class="sdb-help">Selecione um trecho para formatar.</p>
  <span class="sdb-counter" data-fmt-count-for="corpo-1"></span>
</div>
<div class="sdb-editor__preview" data-fmt-preview-for="corpo-1"></div>
<script>SalaBuscadores.hydrate();</script>
```

O runtime monta os controles com as classes da biblioteca. `data-fmt-bloco` aceita o JSON inicial do bloco; `sdb:bloco` emite o objeto atualizado no `detail`. Dados inseridos em atributos HTML precisam ser escapados pelo consumidor. Não concatene conteúdo do autor em HTML. Fontes vêm dos botões `data-fmt-ref`, na ordem selecionada no item.

A ordem é estilo · ênfase · listas · alinhamento · inserir e limpar. Termo, Obra e Citar fonte usam palavras; os demais usam ícones Phosphor. Sem fontes, Citar fonte usa `aria-disabled` e continua alcançável pelas setas para explicar “Escolha uma obra em Fontes”.

`data-fmt-inline` fixa a estrutura em um parágrafo: variante para descrição da Sala e apresentação do anfitrião. Estilo, listas e alinhamento ficam indisponíveis; nunca são guardados como sinais na string. No React, é `AreaTexto formatacao`.

- Um Tab entra na barra; setas esquerda/direita, Home e End navegam. Setas verticais continuam disponíveis no select e no menu nativos.
- `aria-pressed` acompanha o cursor e a seleção, inclusive dentro de uma marca. Acionar de novo remove a marca completa.
- Sem seleção, insere um modelo selecionado. Link seleciona “endereço”. Depois da ação, foco e seleção retornam ao textarea.
- ⌘/Ctrl+B, I, U e K atuam somente no textarea. O atalho de link não abre a busca global.
- Escrita por `execCommand("insertText")` mantém o histórico nativo. Há alternativa de escrita direta com evento `input` se o navegador recusar. A alternativa não promete histórico nativo. Mudanças de propriedades do bloco não entram nesse histórico; não há botões de desfazer/refazer.
- Limpar remove marcas do trecho ou do campo inteiro e restaura alinhamento à esquerda. Referências são preservadas para não perder atribuição de fonte.
- Em campos estreitos a barra quebra linhas e remove separadores. Todas as funções continuam disponíveis. Em toque os alvos crescem para o token de 44 px.

## Tokens, exemplos e verificação

Dimensões em `tokens.json > formatacao`, anéis em `shadow-field-focus`/`shadow-field-error`; seleção em `text-selection`. Superfícies, texto e estados usam os tokens existentes. `scripts/contraste.mjs` verifica seleção sobre repouso e foco, hover e botão ativo nos quatro temas.

[Exemplo independente](../../exemplos/BarraFormatacao.html): vazio, foco, seleção, erro, centralizado, lista e sem fontes. Abre por arquivo local ou HTTP; `?tema=vidro-escuro` troca o tema.

```sh
node --test design-system/components/BarraFormatacao/marcacao.test.mjs
node design-system/scripts/build.mjs
node design-system/scripts/build.mjs --check
node design-system/scripts/contraste.mjs
```

A sintaxe antiga `_obra_` foi migrada para `::obra::` nos dados de demonstração. O store migra uma única vez os textos de artigos ainda carregados na versão anterior, sem descartar rascunhos. Novos textos usam `_itálico_`; nunca se deve rodar a migração a cada leitura.

Painéis de link e fontes e barra flutuante permanecem na fase extra. A versão publicada da biblioteca precisa ser atualizada após esta alteração.
