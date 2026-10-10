# Correções do portal · rodada 1

Antes de começar, leia `CLAUDE.md` na raiz e siga as regras do design system: só classes e tokens de `design-system/`, nada de cor, raio ou espaço solto, e nunca edite `portal/src/design-system/` (é cópia gerada por `npm run ds:sync`). Cada item abaixo traz o problema, a causa já diagnosticada, o resultado esperado e como conferir. Faça um item de cada vez e confira no navegador antes de passar ao seguinte. No fim, rode `npm run check` dentro de `portal/`.

---

## 1. Container do conteúdo alinhado às bordas da barra superior

**O que se vê.** Na tela do Portal, o banner, as Salas recomendadas e as demais seções param bem antes do fim da tela. A borda esquerda do conteúdo se alinha com o título "Portal", mas a direita fica muito aquém do avatar do usuário, e sobra uma faixa vazia à direita. A página parece empurrada para a esquerda. O efeito aparece com a lateral aberta ou fechada e piora quanto mais larga for a tela.

**Causa.** Em `portal/src/components/layout/Moldura.tsx`, a barra superior (`.sdb-topbar`) ocupa toda a largura da coluna, com respiro lateral de 32 px (16 px até 900 px). Já o `<main id="conteudo">` tem `max-w-page`, que é 80rem (1280 px), sem centralização. O conteúdo para em 1280 px, enquanto a barra vai até a borda.

**Resultado esperado.**

- O container do conteúdo ocupa a mesma faixa horizontal da barra superior. A borda esquerda fica alinhada com o início do título da página ("Portal") e a direita com o fim do avatar do usuário.
- O respiro da esquerda é igual ao da direita, em todas as larguras, de modo que a página fica centrada na coluna.
- Isso vale para tudo o que está dentro do `<main>`: o banner, a linha de Salas recomendadas (com chips e cards), Seu progresso, Continuar lendo, Publicados recentemente, a coluna lateral do Portal e o rodapé. As setas de navegação das Salas recomendadas e de Seu progresso passam a terminar alinhadas ao avatar.
- A mudança é feita na moldura e vale para todas as telas de `app/(app)`. As colunas de leitura que já usam `max-w-read` (Sala, Sobre, Assistente, Comparar…) continuam estreitas e alinhadas à esquerda dentro do container, como pede a diretriz de texto à esquerda. Não as alargue nem as centralize.
- O orbe do assistente continua onde está: flutuante, no canto inferior direito, por cima do conteúdo. Ele é camada de vidro e não precisa de uma faixa reservada.
- Fica fora deste item o layout de `/admin` (`app/admin/layout.tsx`), que tem largura própria.

**Como fazer.** Remova o teto de 1280 px do `<main>` para que ele acompanhe a barra. Mantenha `px-4` / `nav:px-7`, que já batem com o respiro da barra (16 px e 32 px). Não resolva com `mx-auto` mantendo o teto: isso centraliza o conteúdo, mas descola a borda esquerda do título e a direita do avatar. Se o token `--container-page` deixar de ser usado em todo o portal, retire-o de `globals.css`.

Confira também o ponto de virada de 900 px. A barra troca o respiro com `@media (max-width: 900px)` e o `<main>` troca com `nav:` (`min-width: 56.25rem`, ou seja, 900 px). Com exatamente 900 px de largura, a barra fica com 16 px e o conteúdo com 32 px. Se o desalinhamento aparecer, a correção vai na fonte da verdade (`design-system/components/bundle.css`, seguida de `node design-system/scripts/build.mjs` e `npm run ds:sync`), não na cópia. Nesse caso, avise que a versão publicada do design system precisa ser atualizada.

**Como conferir.** Abra o Portal no navegador e meça com `getBoundingClientRect()`:

- Com 1440 px e 1920 px, com a lateral aberta e fechada:
  - `left` do banner = `left` do título "Portal" (tolerância de 1 px);
  - `right` do banner = `right` do avatar (tolerância de 1 px);
  - o respiro esquerdo do `<main>` é igual ao direito.
- Com 1024 px, 900 px e 375 px: mesma igualdade entre o respiro esquerdo e o direito, e nada de rolagem horizontal.
- A seta "próximo" das Salas recomendadas termina alinhada ao avatar.
- Uma tela de leitura (uma Sala, por exemplo) continua com o texto na coluna estreita, alinhada à esquerda.
- Tire um print do Portal com 1440 px, lateral aberta, para mostrar o resultado.

---

## 2. Seção Destaques no modelo editorial do Swipe, com curadoria no admin

**Referência visual aprovada.** O mockup `docs/mockups/destaques.html` e o print `docs/mockups/destaques-1440.jpg` (1440 px, lateral aberta, mouse sobre a lista).
- **O que é real e o que é simulado.** O mockup usa as classes reais do design system. As duas peças novas (o modo destaque compacto do Card de conteúdo e a lista com miniatura) estão simuladas no `<style>` dele, só com tokens.
- **O que seguir.** Siga a composição, os alinhamentos e as proporções. Os valores finais saem do design system.
- **Como abrir.** Sirva a raiz do projeto com um servidor estático. Se o macOS bloquear a pasta, copie `docs/mockups/`, `design-system/` e `portal/public/imagens/` para uma pasta temporária, mantendo a estrutura.

**Referência de lógica.** O bloco Destaques de https://swipe.today/#destaques, visto com 1440 px de largura. Siga a lógica e a composição dele, mas não a aparência. Cor, tipografia, raios, sombras e movimento vêm do nosso design system. Nada de azul, nada de cantos de 6 px e nada de cópia de estilo.

**Hoje.** A página `portal/src/app/(app)/destaques/page.tsx` é só um título, uma frase e um Alerta de "Seção em preparação". Este trabalho substitui o que o `docs/prompts/redesign-portal.md` previa para Destaques (lista ordenada de `CardConteudo`).

**Duas lógicas na mesma tela, como no Swipe:**

- **Escolha editorial:** o vídeo, os cards em destaque e os artigos em destaque. Vem da curadoria em `/admin`.
- **Ranking:** a lista "Mais pesquisados". Vem das buscas.

**Fora desta página:** glossário e filtros. Destaques é uma vitrine editorial. O glossário (índice A–Z e termos) vai para a Biblioteca, num trabalho futuro.

### 2.1 Composição

**Alinhamento geral.** Tudo fica dentro do container do conteúdo, entre o título da barra superior e o avatar, com o mesmo respiro dos dois lados.

**Bloco de cima: duas colunas que formam um retângulo fechado.**

- **Colunas.** À esquerda, a coluna larga. À direita, a lista, com uns 16rem. O espaço entre elas é `--space-8`.
- **Topo alinhado.** O vídeo e o rótulo "Mais pesquisados" começam na mesma linha.
- **Base alinhada.** A grade de quatro cards termina na mesma linha da paginação da lista.
- **Borda direita.** A borda direita da lista coincide com a do avatar.

**Coluna larga.** Entre o vídeo e a grade, o espaço é `--space-5`.

1. **Vídeo principal.** É o **Card Vídeo** (`CardVideo`), em 16:9, com imagem de fundo, desfoque escuro e sem painel branco. Mostra o episódio escolhido pela curadoria: contexto (Sala e tema), título, episódio e data, duração e "Assistir no YouTube".
2. **Cards em destaque.** São quatro conteúdos escolhidos pela curadoria. A grade divide a largura do vídeo ao meio, com espaço `--space-5`, e as duas colunas têm a mesma altura total (uns 600 px em 1440 px).
   - **Distribuição:** na coluna da esquerda, um card vertical alto (2/3 da altura) e um horizontal (1/3); na coluna da direita, dois horizontais iguais.
   - **Modo destaque em todos:** moldura e painel creme sobre a imagem, o "container branco dentro".
   - **Card vertical:**
     - em cima da imagem, os chips de tipo e duração ("Artigo · 12 min") e o botão de salvar;
     - embaixo, o painel com a Sala (rótulo pequeno em caixa alta), o título, um resumo de até três linhas e o Selo de proveniência;
     - é o único dos quatro com resumo.
   - **Cards horizontais:**
     - imagem à esquerda, com o chip do tipo ("Artigo", "Fonte primária") e o botão de salvar;
     - à direita, o painel creme na altura toda, com uns 54% da largura, trazendo a Sala, o título e o selo;
     - sem resumo.

**Coluna estreita: a lista "Mais pesquisados".**

- **Título e legenda.** Rótulo "Mais pesquisados" (meta em caixa alta) e a legenda "Mais pesquisados no acervo nos últimos 30 dias".
- **Itens.** Sete por página, cada um com o título e "Sala · N buscas". Os itens são separados por filetes.
- **Paginação.** No rodapé, setas de anterior e próxima com "Página 1 de 3" (`Paginacao`).
- **Altura.** A lista ocupa a altura toda da coluna: os itens dividem o espaço.
- **Natureza do ranking.** É ranking de conteúdo, nunca de pessoas. Nenhum texto sugere que um conteúdo seja "mais verdadeiro" ou "melhor".

**Abaixo do bloco de cima: "Artigos em destaque".** O espaço até o bloco de cima é `--space-9`.

- **Cabeçalho.** Título em `title-2`, legenda "Escolhidos pela curadoria." e, à direita (alinhado ao avatar), o botão "Ver tudo", que leva à Biblioteca.
- **Mosaico.** Cinco artigos escolhidos pela curadoria, em três colunas na proporção 1 : 1,7 : 1, com espaço `--space-5`.
  - Na coluna do meio fica o artigo grande, ocupando a altura das duas linhas.
  - Nas laterais ficam dois cards pequenos empilhados de cada lado.
  - O primeiro artigo escolhido vai para o centro.
- **Artigo grande.** Modo destaque vertical: tipo e salvar sobre a imagem; embaixo, o painel com a Sala, o título, o resumo e o selo.
- **Artigos pequenos.** Card normal vertical: imagem em 4:3 em cima, com o chip de tipo e duração; embaixo, a Sala, o título e o selo.

**O que todo card de conteúdo carrega** (regras do Card de conteúdo): tipo e Sala, título nunca truncado e Selo de proveniência. O selo é obrigatório também no modo destaque. Sem imagem, o card cai na placa da marca (bordô, grafite ou bege) com o arco.

**Cabeçalho da página.** O título "Destaques" já aparece na barra superior. Na página, use o `h1` só para leitores de tela, como o Portal faz. Remova o Alerta e o `TODO(redesign)`.

**Larguras menores.** Decida pela largura do container (container queries), não só pela janela:

- **Container abaixo de uns 1040 px** (por exemplo, 1024 px com a lateral aberta): a lista desce para baixo da grade, e os itens ficam com a altura natural.
- **Abaixo de uns 860 px:**
  - a grade 2×2 passa a ter altura natural;
  - os cards horizontais viram verticais, com o painel embaixo;
  - o mosaico vira duas colunas, com o artigo grande em cima ocupando a largura toda.
- **Abaixo de uns 600 px:** tudo vira uma coluna só, sem rolagem horizontal.

### 2.2 O que entra no design system primeiro

As duas peças abaixo não existem na biblioteca. Elas nascem em `design-system/`: guia em `components/<Nome>/README.md`, `preview.html`, CSS e comportamento. Depois disso, rode `node design-system/scripts/build.mjs`, `node design-system/scripts/contraste.mjs` e `npm run ds:sync`. Só então elas entram no portal. No fim, avise que a versão publicada do design system (https://claude.ai/artifact/1rSk2ixfmNQXjLu2AHBBJB) precisa ser atualizada.

1. **Modo destaque do Card de conteúdo**, vertical e horizontal.
   - **Base visual.** Mesma anatomia do `sala--destaque` do Card Sala: container de 24 px, imagem de 16 px, recuo de 8 px e painel sólido ou translúcido sobre a imagem.
   - **Altura compacta.** Precisa caber na grade 2×2: um horizontal tem uns 290 px de altura em 1440 px. As alturas mínimas atuais do Card Sala destaque, de 536 e 408 px, não servem aqui.
   - **Horizontal novo.** O painel fica à direita, na altura toda. No Card Sala atual ele fica embaixo, à esquerda.
   - **Sem imagem.** Cai na placa da marca com o arco.
2. **Lista com miniatura no hover** (sugestão de nome: `ListaDestaques`).
   - **Item apontado.** Cresce. A miniatura abre por cima do título (da altura 0 até uns 130 px), e o título ganha a cor de destaque do tema (`--accent`).
   - **Demais itens.** Encolhem e ficam com uns 50% de opacidade.
   - **Movimento.** Usa a mola dos tokens, é interrompível e passa de um item para outro sem esperar a animação terminar.
   - **Teclado.** O foco por teclado (`:focus-visible`) produz o mesmo efeito que o mouse.
   - **Sem hover** (`(hover: none)`, celular e tablet). A lista fica simples, só texto, sem miniatura.
   - **Movimento reduzido.** A miniatura aparece e some sem animação.
   - **Sem imagem.** A miniatura usa a placa da marca com o arco.

### 2.3 Curadoria no admin

- **Tela nova.** Crie `/admin/destaques` dentro da casca da curadoria (`CascaCuradoria`) e coloque o link na navegação dela. A tela tem três grupos de vagas:
  - **Vídeo principal:** 1 vaga, entre os vídeos publicados;
  - **Cards em destaque:** 4 vagas ordenadas, entre os conteúdos publicados (a primeira vaga é o card vertical alto);
  - **Artigos em destaque:** 5 vagas ordenadas, entre os textos publicados (a primeira vaga vai para o centro do mosaico).
- **Ações em cada vaga.** Escolher, trocar, reordenar e esvaziar.
- **Repetição.** Um mesmo item não aparece em duas vagas da página. O ranking da lista lateral é independente e pode repetir itens.
- **Vaga vazia.** É preenchida automaticamente pelo publicado mais recente que ainda não está na página, para a tela nunca ter buracos. O admin mostra quais vagas estão "automáticas".
- **Item despublicado ou removido.** Sai da vaga, e a vaga volta a ser automática.
- **Onde fica a escolha.** Segue o padrão do acervo: memória do servidor em `portal/src/server/store.ts`. A página lê só por `portal/src/data/repositorio.ts`.
- **Permissão e registro.** Toda Server Action confere o papel de administrador e registra no histórico da curadoria (`portal/src/server/auditoria.ts`).
- **Dados iniciais.** O acervo de demonstração já vem com as vagas preenchidas, na mesma escolha do mockup, para a página aparecer completa sem precisar de curadoria:
  - **vídeo:** Poimandres;
  - **cards:** Os sete princípios, Poimandres (fonte), Evangelho de Tomé e Capítulo II;
  - **artigos:** O que é um apócrifo? no centro, mais Três Iniciados, Tratado XIII, Documento 47 e Apocalipse de Pedro.

### 2.4 Dados simulados

- **Contagem de buscas.** Crie a contagem dos últimos 30 dias por conteúdo em `portal/src/data/mock/`, no padrão dos outros mocks. A lista lê essa contagem pelo repositório.
- **Imagens.** Use as que existem em `portal/public/imagens/` (salas, episódios, conteúdos). Quem não tem imagem cai na placa da marca. A produção de imagens para os conteúdos é outro trabalho (o item de imagens do acervo).

### 2.5 Testes e conferência

- **Unitários:**
  - montagem das vagas: escolhidas, automáticas, sem repetição, item despublicado saindo da vaga;
  - ordenação do ranking.
- **Testing Library:**
  - a lista expande o item com mouse e com foco de teclado;
  - em `(hover: none)`, nada expande.
- **Playwright:**
  - administrador escolhe um vídeo e um artigo em `/admin/destaques` e os vê em `/destaques`;
  - membro não acessa `/admin/destaques`.
- **No navegador, comparando com o mockup:**
  - **Com 1440 px e lateral aberta:**
    - o vídeo e "Mais pesquisados" alinhados no topo;
    - a grade 2×2 e a paginação alinhadas na base;
    - a lista e "Ver tudo" alinhados ao avatar;
    - o hover abre a miniatura e esmaece os outros itens;
    - o mosaico tem o grande no centro.
  - **Com 1024 px e lateral aberta:** a lista desce para baixo da grade.
  - **Com 375 px:** tudo em uma coluna, sem rolagem horizontal.
  - **Temas:** confira nos quatro.
- **Prints:** tire um com 1440 px e outro com o hover ativo.
- **Comandos finais:** dentro de `portal/`, `npm run check` e `npm run test:e2e`.

---

## 3. Imagens do acervo: pesquisa, tratamento, crédito

**Por que.** O modelo editorial do item 2 depende de imagem forte em cada card. Hoje só 1 dos 15 conteúdos tem imagem (`sete-principios-hermeticos`). Faltam também duas capas de Sala e três miniaturas de episódio. Sem imagem, tudo cai na placa com o arco, e Destaques vira um mosaico de arcos. Este item não depende do item 2: se for feito antes, Destaques já nasce com as imagens.

**Regra de origem** (`design-system/DIRETRIZES.md`, seção Imagem, e `portal/public/imagens/LEIA-ME.md`):

- **O que pode.** Só acervos reais: gravuras, pinturas, manuscritos, páginas de rosto, fotografias de códices e papiros, arquitetura de biblioteca, mãos e gestos de estudo.
- **Licença.** A imagem precisa estar em domínio público ou ter licença aberta que permita o uso com crédito (CC0, CC BY, CC BY-SA). O direito de uso precisa estar registrado.
- **Onde procurar.** Wikimedia Commons, Gallica (BnF), Internet Archive, Biblioteca Nacional Digital, Library of Congress, Rijksmuseum, Wellcome Collection, Met Open Access.
- **O que não entra.** Imagens geradas por IA, banco de imagens e "gravura no estilo de". O portal é um curador de museu, e toda imagem é um documento com procedência.
- **Nada decorativo nem sensacionalista.** Nada de cristais, mandalas, velas, fumaça ou gradiente roxo. Também não use uma imagem cujo assunto principal seja um símbolo de tradição usado como emblema. No Apocalipse de Pedro, evite cenas gráficas de tormento: prefira o manuscrito ou uma composição serena.
- **Imagem que não vem do próprio texto.** Por exemplo, uma ilustração de época usada para um conteúdo do Livro de Urântia. O crédito diz isso com clareza ("Gustave Doré, ilustração para o *Paraíso* de Dante, 1868; imagem de época, não pertence ao Livro de Urântia"). Datas e autorias incertas ficam incertas.

**O que produzir.**

| Pasta | Arquivos | Proporção |
| --- | --- | --- |
| `conteudos/` | os 14 conteúdos sem imagem, um por slug de `portal/src/data/mock/conteudos.ts` | 4:3 no card em linha, mas recortada também em vertical e horizontal nos cards em destaque: escolha imagens com assunto central claro |
| `salas/` | `nag-hammadi.webp`, `apocrifos-cristianismo-primitivo.webp` | 16:10 |
| `salas/` | substituir `urantia.webp`, que está marcada "possivelmente gerada por IA, direitos a confirmar" e não pode ir ao ar assim | 16:10 |
| `episodios/` | `v-nag-hammadi-descoberta.webp`, `v-urantia-mansoes.webp`, `v-evangelho-maria.webp` | 16:9 |

Pistas para começar. Todas precisam ter licença e procedência conferidas na página do acervo:

- **Corpus Hermeticum:** Hermes Trismegisto no mosaico do piso da Catedral de Siena (1488) e páginas das primeiras edições impressas do *Pimander*.
- **Caibalion:** a página de rosto da edição de 1908 (Yogi Publication Society), para o debate sobre a autoria.
- **Nag Hammadi:** fotografias dos códices, por exemplo o Códice II com o fim do Evangelho de Tomé. A licença varia muito de foto para foto.
- **Apócrifos:** o Papiro de Berlim 8502 (Evangelho de Maria), o códice de Akhmim (Apocalipse de Pedro) e a *Ascensão ao Empíreo* de Bosch, para "a subida da alma".
- **Urântia** (livro de 1955, sem iconografia de época própria): cosmologias históricas como as ilustrações de Doré para o *Paraíso* e a *Harmonia Macrocosmica* de Cellarius (1660), sempre com o crédito explicando a relação.

**Tratamento.**

1. **Original.** Baixe a versão de maior resolução, com pelo menos 2000 px de largura sempre que existir. Guarde o original em `docs/imagens-originais/` com um nome descritivo.
2. **Duotone.** Aplique o duotone da marca a partir de `portal/`: `python3 scripts/duotone-imagens.py <original> public/imagens/<pasta>/<nome>.webp`.
3. **Imagens que já estão no portal.** Têm no máximo 736 px e ficam suaves no banner e no card de vídeo grande. Quando achar a mesma obra em alta resolução, troque.

**Manifesto.** Para cada imagem, acrescente uma linha na tabela de `portal/public/imagens/LEIA-ME.md`, com todas as colunas:

- arquivo e original;
- o que a imagem mostra;
- texto alternativo;
- foco (`object-position`);
- origem e direitos: autor, data, acervo, licença e link da página da licença.

Atualize também a lista "Ainda faltam".

**Crédito, texto alternativo e foco no portal.** Hoje nenhum dos três chega às telas:

- todas as imagens saem com `alt=""`;
- não há foco por imagem;
- o crédito não aparece em lugar nenhum.

Leve o manifesto para os dados, por exemplo num `portal/src/data/imagens.ts` tipado com as mesmas colunas. Faça `portal/src/server/imagens.ts` devolver `{ src, alt, foco, credito }`. Depois, ligue isso nas peças que mostram imagem: `CardSala`, `CardVideo`, `BannerRotativo`, `ListaConteudos`, os cards novos do item 2 e a miniatura da lista "Mais pesquisados". Cada peça aplica o foco no `object-position` e mostra o crédito em `footnote`, como pede o `redesign-portal.md`:

- no banner, no rodapé do slide;
- nos cards, num Tooltip ou Modal de informação da imagem.

Se o design system não tiver o gatilho de informação da imagem sobre o card, ele entra primeiro na biblioteca, como no item 2.

**Como conferir.**

- Nenhum card do Portal, de Destaques ou da lista de Salas cai na placa, a não ser por escolha.
- Cada imagem tem uma linha completa no manifesto, com link de licença que abre.
- O crédito aparece no banner e na informação de cada card.
- O texto alternativo é lido pelo leitor de tela.
- O foco mantém o assunto visível nos recortes vertical, horizontal e 4:3.
- `salas/urantia.webp` foi substituída.
- Depois, `npm run check`.
