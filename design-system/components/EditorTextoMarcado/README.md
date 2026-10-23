# Editor de texto marcado

Edita o corpo de um conteúdo parágrafo por parágrafo, com marcações de trecho e propriedades do bloco e pré-visualização. Não é um editor rico: não aceita HTML.

- `.sdb-editor` > blocos `.sdb-editor__block`: número do parágrafo (`.sdb-editor__num`), coluna principal `.sdb-editor__main` e ferramentas `.sdb-editor__tools` (subir, descer, remover, em botões-ícone pequenos; "subir" usa `chevronBaixo` com `.sdb-editor__up`).
- Na coluna principal: o campo `.sdb-control--area.sdb-control--fmt`, com a [Barra de formatação](../BarraFormatacao/README.md) no alto e a área de texto embaixo; e `.sdb-editor__preview`, renderizada pelo mesmo componente de texto das páginas públicas. A barra escreve as marcações: **negrito** (`**…**`), link (`[texto](endereço)`), **Termo** (`*…*`, vira `<dfn>`), **Obra** (`::…::`, vira `<cite>`) e a chamada de fonte (`[1]`).
- O bloco em foco ganha o anel duplo. Abaixo de 560 px as ferramentas vão para uma linha.
- "Adicionar parágrafo" é um botão Tinted no fim da lista.
- Rótulos: cada área de texto se chama "Parágrafo n"; os botões dizem o que fazem ("Marcar termo no parágrafo 2").

## Em blocos (`.sdb-editor--blocos`)
Para o corpo do artigo, com os blocos do [Corpo do artigo](../CorpoArtigo/README.md): parágrafo (o primeiro é o lead), intertítulo de nível 2/3, lista, destaque e imagem.

- Cada bloco abre com o tipo em `meta` (`.sdb-editor__bar` > `.sdb-editor__type`: "Parágrafo · lead", "Intertítulo", "Destaque", "Imagem"). A Barra de formatação fica dentro do campo e existe em todos os blocos textuais; no lead, abaixo do campo entram a ajuda e o contador num `.sdb-field__foot` (o número vem de `conteudo.json`, compartilhado com a regra do portal).
- Campos por tipo, em `.sdb-editor__fields`:
  - **Parágrafo:** a Área de texto.
  - **Intertítulo:** Área de texto com barra; o título curto do item continua sem barra.
  - **Lista:** Área de texto, uma linha por item.
  - **Destaque:** a frase (Área de texto) e "Atribuição" (Campo de texto, obrigatório).
  - **Imagem:** o [Campo de imagem](../CampoImagem/README.md), "Texto alternativo" e "Crédito" (obrigatórios) e "Legenda" (opcional).
- A pré-visualização (`div.sdb-editor__preview.sdb-editor__preview--bloco`) usa a mesma marcação da página (`sdb-articlebody__lead`, `h2.sdb-title-2`, `sdb-pullquote`, `sdb-articlebody__figure`), um pouco menor.
- Entre os blocos e no fim, `.sdb-editor__insert`: um filete com o botão discreto "Adicionar", que abre o [Menu](../Menu/README.md) com Parágrafo, Intertítulo, Lista, Destaque e Imagem. O `aria-label` diz onde entra ("Adicionar bloco depois do bloco 2").
- Ferramentas iguais às do editor de parágrafos (subir, descer, remover), com rótulos "bloco n".
- Erros ficam no campo do bloco (`campo-corpo-n`, `campo-corpo-n-atribuicao`, `-alt`, `-credito`), para o checklist levar ao bloco certo. O primeiro bloco é sempre um parágrafo.

## Atualização da barra e do modelo

O corpo do artigo agora também aceita parágrafo como objeto, listas ordenadas ou com marcadores, níveis 2/3 de título e alinhamento por classe. O seletor de estilo fica dentro da barra; a prévia e a página compartilham `BlocoDoCorpo` e `TextoMarcado`. Strings legadas continuam legíveis; edições de parágrafos passam a objetos. O primeiro bloco continua sendo um parágrafo (lead), validado ao publicar.

Todos os campos dos blocos textuais recebem barra, ajuda e contador. O limite do lead vem da constante de resumo do formulário (`LIMITE_RESUMO` do anfitrião); o resumo manual da curadoria tem sua própria regra. `**…**`, `_…_`, `__…__`, `~~…~~`, `*…*`, `::…::`, links e chamadas seguem a gramática da Barra de formatação. Consulte seu guia para conversões, atalhos, limitações e migração de obras.
