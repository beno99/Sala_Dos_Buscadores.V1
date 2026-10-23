# Barra de formatação para campos de texto longo (projeto novo)

Prompt para construir a peça do zero num projeto que ainda não a tem. Nada aqui depende de outro repositório: a especificação está completa. Adapte os nomes de classe, os tokens e os caminhos ao design system do projeto; onde houver um valor concreto, ele é referência, não obrigação.

Antes de começar, leia o README e as diretrizes do design system do projeto e o guia das peças que for reaproveitar (botão, campo de texto, select, menu, tooltip). Depois **me mostre um plano curto** e espere o meu sim.

Regras:
- Use só as classes e os tokens do design system: nada de cor, raio, sombra ou espaço solto.
- Se faltar um token ou uma variação, estenda o design system primeiro (fonte dos tokens, CSS, guia e exemplo da peça), rode o gerador e a conferência de contraste, e me avise que a versão publicada precisa ser atualizada.
- A peça entra primeiro no design system (HTML + CSS + comportamento, com exemplo que abre sozinho) e só depois no app.
- Nada de HTML vindo de quem escreve.

---

## 0. O que é, em uma frase

Uma barra no topo de cada campo de texto longo com as opções de formatação de um editor de texto comum — estilo do parágrafo, ênfase, listas, alinhamento, link —, que escreve num modelo de conteúdo próprio e mostra o resultado numa pré-visualização.

## 1. Por que não é HTML livre

O conteúdo é guardado em **blocos com atributos e texto marcado por sinais**, não em HTML. Isso mantém o conteúdo auditável, diffável e seguro: nada que venha de quem escreve vira marcação arbitrária na página, e a mesma página pode ser renderizada em outro meio depois. A barra é conveniência; quem preferir digita os sinais.

## 2. Modelo de conteúdo

São duas camadas, e essa separação é o coração do desenho: **o que é do bloco fica no bloco; o que é do trecho fica no texto.**

### 2.1 Bloco

Cada bloco é um objeto. Alinhamento, estilo e lista são propriedades dele — nunca sinais dentro da string, porque não valem para "um pedaço" do texto.

```ts
type Bloco =
  | { tipo: "paragrafo";  texto: string; alinhamento?: Alinhamento; recuo?: 0 | 1 | 2 }
  | { tipo: "titulo";     texto: string; nivel: 2 | 3; alinhamento?: Alinhamento }
  | { tipo: "lista";      itens: string[]; ordenada: boolean }
  | { tipo: "citacao";    texto: string; atribuicao: string }
  | { tipo: "imagem";     src: string; alt: string; credito: string; legenda?: string };

type Alinhamento = "esquerda" | "centro" | "direita" | "justificado"; // padrão: esquerda
```

- Alinhamento vira **classe**, nunca `style` inline.
- `justificado` existe porque foi pedido, mas deixe-o por último no controle e saiba o custo: em coluna estreita ele abre rios de espaço entre as palavras e piora a leitura. Se o projeto tiver diretriz de alinhamento à esquerda, respeite-a e não ofereça o botão.
- `recuo` é opcional; se existir, pare em dois níveis. Recuo não é jeito de fazer lista.

### 2.2 Texto do bloco

Dentro do texto, só estes sinais:

| Sinal | Vira | Para quê |
|---|---|---|
| `**texto**` | `<strong>` | Negrito |
| `_texto_` | `<em>` | Itálico |
| `__texto__` | `<u>` | Sublinhado |
| `~~texto~~` | `<s>` | Tachado |
| `[texto](endereço)` | `<a>` | Link |
| `[1]` | marca de referência | Chamada da fonte citada, na ordem das obras escolhidas |

Opcional, para projetos com vocabulário próprio e obras citadas:

| Sinal | Vira | Para quê |
|---|---|---|
| `*texto*` | `<dfn>` | Termo do assunto, que merece destaque e definição |
| `::texto::` | `<cite>` | Título de obra |

Regras do renderizador (uma função só, usada no editor e na página):
- A ordem das alternativas na expressão importa: `__` antes de `_`, `**` antes de `*`, link antes da chamada `[n]`. Fora dessa ordem, `**x**` casa como `*` + `*x*` e `[texto](url)` casa como `[1]`.
- **Endereço inseguro não vira link.** Aceite só `https://` e caminhos internos começando por `/`; qualquer outra coisa (inclusive `javascript:`) sai como texto, com o endereço à vista entre parênteses. Link externo abre em nova aba, com `rel="noopener noreferrer"`.
- A chamada `[n]` sempre aparece, mesmo onde não há lista de fontes para apontar: vira marca não clicável, com o número lido como "Fonte n". Chamada que some do texto é pior que chamada sem destino.
- Marca aninhada não é suportada, e tudo bem: `**_texto_**` fica como está, visível. Resolver aninhamento com expressão regular é o começo de um analisador que você não quer manter.

Escreva os testes do renderizador antes da interface: cada sinal, a ordem das alternativas, o endereço inseguro, a chamada sem lista e o texto sem marcação nenhuma.

## 3. Anatomia

A barra mora **dentro** do campo, não acima dele: um contêiner só, com a barra em cima, um filete de separação e a área de texto embaixo. Assim o anel de foco e o de erro envolvem barra e texto juntos, e a barra não parece um controle solto.

```html
<div class="campo campo--area campo--com-barra">
  <div class="barra" role="toolbar" aria-label="Formatação do bloco 1" data-para="corpo-1">

    <!-- 1. Estilo do bloco -->
    <select class="barra__estilo" aria-label="Estilo do bloco 1">
      <option value="paragrafo" selected>Parágrafo</option>
      <option value="titulo-2">Título</option>
      <option value="titulo-3">Subtítulo</option>
      <option value="citacao">Citação</option>
    </select>
    <span class="barra__sep" aria-hidden="true"></span>

    <!-- 2. Ênfase -->
    <button type="button" data-marca="negrito"    aria-pressed="false" aria-label="Negrito no bloco 1"    data-dica="Negrito ⌘B">…</button>
    <button type="button" data-marca="italico"    aria-pressed="false" aria-label="Itálico no bloco 1"    data-dica="Itálico ⌘I">…</button>
    <button type="button" data-marca="sublinhado" aria-pressed="false" aria-label="Sublinhado no bloco 1" data-dica="Sublinhado ⌘U">…</button>
    <button type="button" data-marca="tachado"    aria-pressed="false" aria-label="Tachado no bloco 1"    data-dica="Tachado">…</button>
    <span class="barra__sep" aria-hidden="true"></span>

    <!-- 3. Listas -->
    <button type="button" data-lista="marcadores" aria-pressed="false" aria-label="Lista com marcadores no bloco 1">…</button>
    <button type="button" data-lista="numerada"   aria-pressed="false" aria-label="Lista numerada no bloco 1">…</button>
    <span class="barra__sep" aria-hidden="true"></span>

    <!-- 4. Alinhamento: um grupo, uma escolha só -->
    <div role="group" aria-label="Alinhamento do bloco 1">
      <button type="button" data-alinhar="esquerda"    aria-pressed="true"  aria-label="Alinhar à esquerda">…</button>
      <button type="button" data-alinhar="centro"      aria-pressed="false" aria-label="Centralizar">…</button>
      <button type="button" data-alinhar="direita"     aria-pressed="false" aria-label="Alinhar à direita">…</button>
      <button type="button" data-alinhar="justificado" aria-pressed="false" aria-label="Justificar">…</button>
    </div>
    <span class="barra__sep" aria-hidden="true"></span>

    <!-- 5. Inserir e limpar -->
    <button type="button" data-marca="link" aria-label="Link no bloco 1" data-dica="Link ⌘K">…</button>
    <!-- "Citar fonte" é o Menu do design system; cada item insere [n] -->
    <button type="button" data-marca="limpar" aria-label="Limpar formatação do bloco 1" data-dica="Limpar formatação">…</button>
  </div>

  <textarea id="corpo-1" rows="3">…</textarea>
</div>

<div class="campo__rodape">
  <p class="ajuda">O card mostra os primeiros 180 caracteres deste parágrafo.</p>
  <span class="contador">213 caracteres</span>
</div>
```

Ordem dos grupos, sempre a mesma: **estilo · ênfase · listas · alinhamento · inserir e limpar**. É a ordem a que todo mundo está acostumado, e o custo de mudá-la é alto demais para o ganho.

Ícone para ênfase, listas e alinhamento; palavra para o que é conceito do produto (termo, obra, citar fonte), porque ninguém adivinha um ícone para esses.

Medidas de referência: botão de 32 px em cápsula, ícone de 16 px, barra com 4 px acima e abaixo e 8 px nas laterais, separador de 1 px por 20 px.

## 4. Tokens

Use os equivalentes do projeto. A coluna da direita é só referência do que cada papel precisa entregar.

| Papel | Referência |
|---|---|
| Fundo do campo em repouso | superfície de card |
| Fundo do campo em foco | material mais espesso que o de repouso |
| Anel de foco | 1,5 px da cor de foco + 5 px de um tingido suave da mesma cor |
| Anel de erro | 1,5 px da cor de erro + 5 px do tingido de erro |
| Filete sob a barra | cor de divisória |
| Botão em repouso | sem fundo, texto na cor principal |
| Botão sob o ponteiro | preenchimento de controle |
| Botão aceso (`aria-pressed`) | fundo claro de polegar + texto na cor de destaque + sombra curta |
| Botão desabilitado | opacidade 0,35 |
| **Trecho selecionado** | token novo, se não existir: a cor de destaque com 16% de opacidade no claro e a cor sobre fundo escuro com 22% no escuro |

Confira o contraste do texto sobre cada fundo nos temas que o projeto tiver, incluindo o trecho selecionado, e inclua esses pares na conferência automática.

## 5. Comportamento

### Marcas de trecho (ênfase, link)
- **Marcar:** envolve o trecho selecionado. Sem seleção, insere um modelo ("texto") já selecionado, para a pessoa digitar por cima.
- **Desmarcar:** clicar de novo sobre um trecho já marcado tira a marcação.
- **Aceso:** `aria-pressed` recalculado quando o cursor ou a seleção muda (`selectionchange`): aceso quer dizer "o trecho já está marcado".
- **Link:** envolve o trecho e deixa a palavra "endereço" selecionada, para digitar por cima. (Um painel próprio é melhor; veja a fase extra.)

### Propriedades do bloco (estilo, lista, alinhamento)
- Valem para o bloco inteiro, com o cursor em qualquer ponto dele. Não dependem de seleção, e **não** entram na string.
- Alinhamento é escolha única: acender um apaga os outros. Use `aria-pressed` nos quatro botões, com só um verdadeiro de cada vez.
- Trocar o estilo para "lista" converte o bloco: cada linha do texto vira um item. Voltar para parágrafo junta os itens de novo, um por linha. Avise com um toast quando a conversão perder alguma coisa, e não perca em silêncio.
- Título não tem lista nem recuo; citação não tem alinhamento. Desabilite o que não se aplica, com a dica dizendo por quê, em vez de esconder.

### Comuns
- **Citar fonte:** menu com as obras já escolhidas no item, numeradas; cada item insere a chamada no cursor. Sem obras escolhidas, o botão fica desabilitado e a dica diz onde escolher uma.
- **Limpar formatação:** tira os sinais do trecho selecionado, ou do campo inteiro quando não há seleção, e devolve o bloco ao alinhamento padrão. É o que salva quem colou de outro editor.
- **Atalhos:** ⌘B, ⌘I, ⌘U e ⌘K (Ctrl no Windows), ouvidos na área de texto, não na barra. Os de alinhamento do Word (⌘L, ⌘E, ⌘R, ⌘J) são opcionais: confira conflito com o navegador em cada sistema antes de prometer, e não anuncie na dica o atalho que você não conseguiu garantir.

**O detalhe que faz a diferença:** escreva no campo com `document.execCommand("insertText", false, trecho)` depois de selecionar o intervalo que sai. É o que mantém o histórico do navegador funcionando — ⌘Z desfaz marcação por marcação, sem você guardar pilha nenhuma. Tenha um caminho alternativo (escrever o valor direto) para quando o navegador recusar, e cuide para que o framework receba o evento de entrada nos dois casos. Mudanças de bloco (estilo, lista, alinhamento) não passam por aí: elas mudam o objeto, então guarde-as no seu próprio histórico se quiser desfazer.

Separe as funções puras (recebem texto, início, fim e marca; devolvem o texto novo, o trecho que entra, o intervalo que sai e onde fica o cursor) do componente. Elas são o que vale a pena testar.

## 6. Acessibilidade

- A barra é `role="toolbar"` com `aria-label` que diz de qual campo ela é ("Formatação do bloco 1").
- Um único Tab entra na barra; as setas andam entre os botões, como manda o padrão de toolbar.
- Cada botão diz o que faz e em qual campo; os que só têm ícone trazem o mesmo texto na dica.
- Depois de marcar, o foco volta para a área de texto com o trecho certo selecionado.
- Estado aceso em `aria-pressed`, nunca só na cor. Alinhamento num `role="group"` com rótulo.
- Erro sempre com ícone e a palavra "Erro", além da cor.

## 7. Responsivo

Com a barra cheia, em campo estreito, duas saídas — escolha uma e documente:
- deixar quebrar em duas linhas, com os separadores sumindo; ou
- recolher os grupos menos usados (listas, alinhamento, limpar) num botão "Mais opções".

Em nenhuma das duas alguma função desaparece no celular: esconder é tirar justamente o que mais falta ali.

## 8. Estados do exemplo

O exemplo da peça mostra: **vazio** (com o texto de espera), **em foco**, **com seleção** (ênfase acesa), **com erro**, **bloco centralizado**, **bloco em lista** e um campo sem obras escolhidas, com "Citar fonte" desabilitado.

## 9. Integração no editor

- Todo campo de texto longo que aceita marcação recebe a barra. Campos curtos (título do item, nome, endereço) ficam sem.
- Abaixo do campo, uma linha com a ajuda à esquerda e o contador à direita.
- Se o primeiro parágrafo virar o resumo em algum lugar, diga o limite nessa linha, com o número real da regra do projeto, nunca um número digitado à mão.
- A pré-visualização usa **o mesmo** renderizador da página pública. Duas renderizações diferentes viram duas verdades.

## 10. O que não fazer

- Não aceite HTML de quem escreve, nem cole HTML na string.
- Não guarde alinhamento, lista ou estilo como sinal dentro do texto.
- Não use `style` inline para alinhamento: classe, sempre.
- Não coloque botões de desfazer e refazer para as marcas de trecho: não há como saber a profundidade do histórico do navegador, e um botão que mente é pior que botão nenhum. O ⌘Z nativo já resolve.
- Não ofereça tamanho de fonte, família nem cor de texto. É o começo do documento que não se parece com o produto, e nenhum sistema de design sobrevive a isso.

## 11. Pronto quando

- Marcar e desmarcar funciona com mouse e com teclado, e o botão aceso corresponde ao trecho onde o cursor está.
- Estilo, lista e alinhamento mudam o bloco inteiro, com o cursor em qualquer ponto, e aparecem iguais na pré-visualização e na página.
- Converter parágrafo em lista e voltar não perde texto em silêncio.
- ⌘Z desfaz uma marcação de cada vez.
- Colar de um editor rico e clicar em limpar devolve texto limpo, no alinhamento padrão.
- O endereço inseguro não vira link em lugar nenhum.
- O exemplo da peça abre sozinho, nos temas do projeto, e o contraste passa.
- Os testes do renderizador e das funções puras passam, junto com a verificação padrão do projeto.

## Fase extra, depois de tudo acima funcionar

- **Painel de link:** campo de endereço, "Remover link" quando já existe e "Aplicar"; Enter aplica, Esc fecha sem mudar.
- **Painel de citar fonte:** as obras escolhidas, um campo opcional de trecho ou página e um caminho para buscar outra obra no acervo.
- **Barra flutuante sobre a seleção:** a mesma barra, em superfície escura, acima do trecho selecionado com o mouse; some ao rolar ou ao clicar fora, não aparece no toque. A barra fixa continua existindo; a flutuante é atalho.
