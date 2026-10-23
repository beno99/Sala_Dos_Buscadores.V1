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

---

## 4. Biblioteca por Salas, com busca, filtros e glossário

**Referências.**
- **Visual:** o mockup `docs/mockups/biblioteca.html` e os prints `docs/mockups/biblioteca-1440.png` (vista Conteúdos, 1440 px, lateral aberta) e `docs/mockups/biblioteca-glossario.png` (vista Glossário).
  - **O que é real e o que é simulado.** O mockup usa as classes reais do design system. As peças novas estão simuladas no `<style>` dele, só com tokens.
  - **O que seguir.** Siga a composição, os alinhamentos e as proporções. Os valores finais saem do design system.
  - **Como abrir.** Sirva a raiz do projeto com um servidor estático. Se o macOS bloquear a pasta, copie `docs/mockups/`, `design-system/` e `portal/public/imagens/` para uma pasta temporária, mantendo a estrutura.
- **Lógica:** duas referências, das quais siga a lógica e a composição, mas não a aparência. Cor, tipografia, raios, sombras e movimento vêm do nosso design system: nada de fundo escuro, nada de azul, nada de cópia de estilo.
  - `docs/mockups/referencias/biblioteca-cursos.webp`: painel de cabeçalho com a busca e o botão de filtros à direita, e grade de 4 cards com o progresso sobre a imagem.
  - https://swipe.today/mais-lidas: grade de 4 colunas, cabeçalho de listagem e card com imagem em cima.

**Hoje.** A página `portal/src/app/(app)/biblioteca/page.tsx` é só um título, uma frase e um Alerta de "Seção em preparação". Este trabalho substitui o que o `docs/prompts/redesign-portal.md` previa para a Biblioteca. A busca e os filtros reaproveitam `portal/src/features/busca` (`busca.ts`, `FiltrosBusca.tsx`), com as facetas e a contagem que já existem.

**O que a página é.** Todo o acervo publicado, organizado por Sala, com busca e filtros, e o glossário como uma segunda vista. A busca global da barra superior (⌘K) continua existindo. O campo desta página filtra só a Biblioteca.

### 4.1 Composição

**Alinhamento geral.** Tudo fica dentro do container do conteúdo, entre o título da barra superior e o avatar, com o mesmo respiro dos dois lados.

**1. Painel de cabeçalho** (card em creme, na largura toda).

- **À esquerda:**
  - o rótulo com o ícone `biblioteca` e o texto "Acervo completo" (meta em caixa alta);
  - o título "Todos os conteúdos", em `display-lower` grande. É o único `h1` da página, porque o título da barra superior é um `p`;
  - o subtítulo "Textos, fontes primárias e vídeos das cinco Salas, cada um com a sua procedência."
- **À direita, em cima:** o segmentado de vistas, "Conteúdos | Glossário".
- **À direita, embaixo:**
  - o campo em cápsula "Buscar na Biblioteca…", com a lupa;
  - o botão "Filtros", com o ícone `filtro`. Ele mostra a contagem quando há filtros ativos: "Filtros (2)".
- **Na vista Glossário:**
  - o título vira "Glossário";
  - o subtítulo vira "Termos das tradições, com a origem e a definição atribuída a cada Sala.";
  - o campo vira "Buscar um termo…";
  - o botão "Filtros" some.
- **No celular,** tudo empilha nesta ordem: segmentado na largura toda, rótulo, título, subtítulo, campo e "Filtros" na largura toda.

**2. Abas de Sala** (logo abaixo do painel).

- **Formato.** São chips de seleção única com contagem: "Todas 20 · Apócrifos 4 · Nag Hammadi 4 · Corpus Hermeticum 4 · Caibalion 4 · Urântia 4".
- **Nomes.** Use nomes curtos nas abas e os completos nos títulos das seções.
- **Ordem.** A mesma da página Salas: alfabética. A ordem não indica importância.
- **Contagem.** Acompanha a vista: conteúdos ou verbetes.
- **Sem espaço.** Se não couber, a linha rola na horizontal, sem quebrar.

**3. Filtros ativos.** Aparecem só quando há algum: uma linha de chips removíveis (termo, tema, nível, formato) e "Limpar filtros".

**4. Vista Conteúdos.**

- **"Todas", sem busca nem filtro:** uma seção por Sala, com `--space-9` entre as seções.
  - **Cabeçalho da seção:**
    - o nome completo da Sala em `title-2`;
    - abaixo, a descrição e a contagem em `footnote` ("Gnosticismo cristão · 13 códices coptas · 4 conteúdos");
    - à direita, alinhado ao avatar, o botão "Ver os N" (ou "Ver só esta Sala" quando a Sala tem até 4). Ele seleciona a aba da Sala.
  - **Grade:** os quatro conteúdos mais recentes da Sala.
- **Uma Sala escolhida:**
  - **Linha de abertura:** nome e descrição da Sala, com a contagem, e à direita "Entrar na Sala" (link para `/salas/[slug]`).
  - **Grade:** todos os conteúdos da Sala, do mais recente ao mais antigo, 16 por página, com a `Paginacao` numerada no fim.
- **Com busca ou filtro em "Todas":**
  - as seções por Sala continuam, mas mostram todos os resultados e somem quando a Sala não tem nenhum;
  - acima delas, em `footnote` com `aria-live`, vai a contagem: "N conteúdos para «poimandres»";
  - com busca, a ordem é a de relevância de `busca.ts`.
- **Sem resultados:** diga qual filtro remover, como pede o `FiltrosBusca`. Por exemplo: "Nenhum conteúdo Avançado com «alma». Remova «Avançado» para ver 3."

**5. Grade.**

- **Colunas:** 4. Passam para 2 quando o container tem menos de uns 900 px e para 1 abaixo de uns 520 px. Nunca 3, porque as seções têm 4 cards e sobraria um órfão.
- **Espaços:** `--space-5` entre colunas e `--space-7` entre linhas.

**6. Card de conteúdo com imagem** (peça nova, ver parte 2).

- **Imagem em 16:10, em cima.** Sem imagem, cai na placa da marca com o arco.
- **Sobre a imagem, à esquerda:**
  - o chip do tipo: "Artigo", "Fonte primária" ou "Vídeo";
  - o chip de progresso, quando houver: "38%" para leitura em andamento, "Lido" para lida.
- **Sobre a imagem, à direita:** o botão de salvar na estante.
- **Leitura em andamento:** uma barra fina na base da imagem.
- **No corpo:**
  - a Sala, como rótulo pequeno em caixa alta;
  - o título, em Fraunces, nunca truncado; ele é o link do card;
  - uma linha com o nível (degraus) e a duração (relógio, "11 min" ou "24:10");
  - o Selo de proveniência, que é obrigatório.
- **Sem resumo.**
- **Card de vídeo:** leva ao mesmo destino do Card Vídeo, o YouTube em nova aba, e só com URL específica de vídeo. Sem ela, leva à Sala do vídeo.
- **Progresso:** vem de `portal/src/server/progresso.ts`. Vídeo não tem progresso.

**7. Painel "Filtros".** Abre o `FiltrosBusca` num `Drawer`, que no celular vira sheet.

- **Tema:** chips.
- **Nível:** linhas de opção com contagem.
- **Formato:** segmentado, Todos · Texto · Vídeo.
- **Sala:** fica só nas abas.
- **Contagens:** consideram os outros filtros ativos (`contarFacetas`).
- **Rodapé:** "Limpar" e "Ver N conteúdos", com a contagem ao vivo.

**8. Vista Glossário.**

- **Índice A–Z compacto,** na largura toda, com as letras distribuídas de borda a borda.
  - Letras sem verbete ficam desabilitadas.
  - Ao entrar, a letra ativa é a primeira que tem verbete.
- **Verbetes da letra,** na coluna de leitura (46rem), alinhados à esquerda. Seguem o Verbete de glossário: accordion, com o primeiro aberto.
  - **Cabeçalho do verbete:** o termo e a origem (língua, escrita e tradução).
  - **Definição atribuída:** "Nos textos de Nag Hammadi…". Um termo com sentidos diferentes em Salas diferentes tem um parágrafo por Sala.
  - **Salas:** chips com as Salas onde o termo aparece.
  - **Autoria:** "Redigido por…".
  - **Botão para os conteúdos:** "N conteúdos tratam deste termo". Ele volta à vista Conteúdos com o filtro "Termo: Gnose" ativo.
- **Abas de Sala:** filtram os verbetes pela Sala.
- **Busca:** procura no termo e na definição, sem diferenciar acentos nem maiúsculas, em todas as letras.
- **Definições:** descrevem o uso na tradição e nunca afirmam o que "é verdade".

**9. Estado na URL.** Tudo fica na URL, para dar para compartilhar e voltar com o botão do navegador:
`/biblioteca?vista=glossario&letra=G&sala=nag-hammadi&q=…&tema=alma&nivel=3&formato=video&termo=gnose&pagina=2`

**10. Cabeçalho da página.** Remova o Alerta e o `TODO(redesign)`.

### 4.2 O que entra no design system primeiro

As peças abaixo nascem em `design-system/`: guia em `components/<Nome>/README.md`, `preview.html`, CSS e comportamento. Depois disso, rode `node design-system/scripts/build.mjs`, `node design-system/scripts/contraste.mjs` e `npm run ds:sync`. Só então elas entram no portal. No fim, avise que a versão publicada do design system (https://claude.ai/artifact/1rSk2ixfmNQXjLu2AHBBJB) precisa ser atualizada.

1. **Card de conteúdo com imagem**, vertical.
   - **Base visual.** Mesma anatomia do Card Sala normal: container de 24 px, imagem de 16 px, recuo de 8 px, imagem e texto separados.
   - **Conteúdo e estados.** Chips, progresso e corpo como descritos acima. Estados: sem progresso, em andamento e lido. Sem imagem, placa.
   - **Relação com o Destaques.** Se o modo destaque do Card de conteúdo (do trabalho de Destaques) já existir, as duas variações vivem na mesma peça.
2. **Painel de cabeçalho de seção.**
   - **Composição.** Rótulo com ícone, título, subtítulo e a área de ações à direita: um slot em cima e um embaixo.
   - **Celular.** Empilha.
3. **Campo de busca compacto.**
   - **O que é.** Só o campo em cápsula, com a lupa, para filtrar uma página. É uma variação da `BarraBusca`, sem modos nem sugestões.
4. **Índice A–Z compacto.**
   - **Tamanho.** Botões de uns 34 px em vez de 42.
   - **Linha.** Sem quebra, distribuída na largura, com rolagem horizontal quando não couber.

As abas de Sala usam o `ChipTema` com contagem. O segmentado, o `Drawer`, o `FiltrosBusca`, a `Paginacao` e o Verbete de glossário já existem.

### 4.3 Dados e admin

- **Termos de cada conteúdo.**
  - **Campo novo.** `Conteudo` e `Video` ganham `termos`: os verbetes de `GLOSSARIO` (`portal/src/data/mock/glossario.ts`) de que tratam.
  - **Demonstração.** Preencha os 15 conteúdos e os 5 vídeos.
  - **Contagens.** Os verbetes e os chips contam só os publicados.
- **Admin.** Os editores de artigo e de vídeo em `/admin` ganham o campo "Termos do glossário", com escolha entre os verbetes existentes. A Server Action confere o papel de administrador e registra no histórico (`portal/src/server/auditoria.ts`).
- **Leitura dos dados.** A página lê só o que está publicado, por `portal/src/data/repositorio.ts`.
- **Imagens.** Use as que existem em `portal/public/imagens/`. A produção de imagens dos conteúdos é outro trabalho (o item de imagens do acervo).

### 4.4 Testes e conferência

- **Unitários:**
  - filtro por Sala, termo, tema, nível e formato;
  - busca sem acento nem maiúsculas;
  - ordem por data e por relevância;
  - seções: limite de 4 e Sala vazia escondida;
  - paginação de 16;
  - glossário: letra inicial, busca em todas as letras e filtro por Sala;
  - contagens das abas.
- **Testing Library:**
  - as abas trocam a grade;
  - o segmentado troca a vista;
  - o botão do verbete aplica o filtro de termo;
  - os chips ativos removem o filtro;
  - o estado vazio diz qual filtro remover.
- **Playwright:**
  - membro busca "poimandres" e vê só o Corpus Hermeticum;
  - escolhe uma Sala e pagina;
  - abre "Filtros", marca Avançado e remove pelo chip;
  - vai ao Glossário, abre "Gnose", clica em "conteúdos tratam deste termo" e chega à lista filtrada;
  - recarrega a URL e continua no mesmo estado;
  - administrador adiciona um termo a um artigo e ele passa a contar no verbete.
- **No navegador, comparando com o mockup:**
  - **Com 1440 px e lateral aberta:**
    - o painel vai de borda a borda;
    - "Filtros" e "Ver os N" ficam alinhados ao avatar;
    - as quatro colunas ficam alinhadas.
  - **Com 1024 px e lateral aberta:** duas colunas.
  - **Com 375 px:**
    - uma coluna, sem rolagem horizontal;
    - o painel fica empilhado;
    - as abas rolam.
  - **Temas:** confira nos quatro.
- **Prints:** "Todas", uma Sala escolhida, uma busca, o painel de filtros e o Glossário.
- **Comandos finais:** dentro de `portal/`, `npm run check` e `npm run test:e2e`.

---

## 5. Página da Sala: cabeçalho em duas colunas, banner e conteúdos ao lado de vídeos e trecho

Faça primeiro as peças do design system (5.2) e pare para revisão no catálogo, ao lado do mockup, antes de montar a página.

**Referências.** Abra as imagens antes de começar: elas são a especificação.

- **Arquitetura da informação, o que seguir:** `docs/mockups/referencias/sala-frame.webp`, o frame que eu desenhei. A ordem e a posição dos blocos são estas:
  1. **Barra superior:** o título ("Sala") com a trilha logo embaixo ("Salas / Apócrifos do cristianismo").
  2. **Cabeçalho em duas colunas:**
     - à esquerda, o título da Sala, grande;
     - à direita, em cima, a descrição;
     - à direita, embaixo, a pessoa que publicou (avatar e nome), o nível predominante e a data.
  3. **Banner:** a imagem da Sala, na largura toda.
  4. **Duas colunas:**
     - **À esquerda, larga:** o título "Conteúdos", com o filtro Iniciante · Intermediário · Avançado na mesma linha, à direita. Abaixo, um filete, e a lista de cards de conteúdo em uma coluna só.
     - **À direita, estreita:**
       - "Vídeos do assunto", com o card do vídeo;
       - "Trecho de fonte primária", com o Bloco de citação.
- **Do frame, não copie:**
  - **A lateral.** No frame ela tem foto e nome do usuário, "Continuar de onde parou", "Conteúdos salvos" e o nível do buscador. Aqui a lateral do app fica como está.
  - **A tipografia.** No frame, os títulos estão sem serifa, pesados e em caixa alta. Aqui eles seguem o design system: Fraunces no título da Sala e nos subtítulos.
  - **A foto do banner.** A do frame é ilustrativa; use a imagem da Sala.
  - **O sino da barra superior.**
  - **A data em inglês.**
  - **O chip de tema preenchido em bordô.** O card usa o Badge neutro do design system.
  - **O card de vídeo antigo.** Use o card de conteúdo com imagem, descrito abaixo.
- **Como está hoje:** `docs/mockups/referencias/sala-atual.webp`, no tema sólido escuro. Tudo está empilhado numa coluna estreita, a trilha fica numa cápsula separada e a metade direita da tela sobra vazia.
- **Como fica com o design system:**
  - **Mockup:** `docs/mockups/sala.html`. Sem parâmetro, mostra a Sala oficial (Corpus Hermeticum); com `?sala=tome`, uma Sala de anfitrião.
  - **Prints:** `docs/mockups/sala-1440.png` (oficial, 1440 px, lateral aberta) e `docs/mockups/sala-anfitriao.png`.
  - **O que é real e o que é simulado.** O mockup usa as classes reais do design system. As peças novas estão simuladas no `<style>` dele, só com tokens.
  - **O que seguir.** Siga a composição, os alinhamentos e as proporções. Os valores finais saem do design system.
  - **Como abrir.** Sirva a raiz do projeto com um servidor estático. Se o macOS bloquear a pasta, copie `docs/mockups/`, `design-system/` e `portal/public/imagens/` para uma pasta temporária, mantendo a estrutura.

**Hoje.** Em `portal/src/app/(app)/salas/[slug]/page.tsx`, a página é uma coluna só, nesta ordem:
1. Breadcrumbs em cápsula;
2. cabeçalho com rótulo, título e descrição;
3. lista de dados: nível, acervo, período, atualização;
4. botão do assistente;
5. "Comparar um tema";
6. trecho de fonte primária;
7. conteúdos, com o segmentado de nível e uma grade de cards de 300 px;
8. vídeos, em Cards Vídeo grandes;
9. glossário;
10. fontes.

A Sala de anfitrião ainda mostra a imagem, o selo e "Mantida por…" no meio do cabeçalho (`TopoDeAnfitriao`).

### 5.1 Composição

**Alinhamento geral.** Tudo fica dentro do container do conteúdo, entre o título da barra superior e o avatar, com o mesmo respiro dos dois lados.

**1. Trilha na barra superior.**

- **A cápsula sai.** Remova a `<Breadcrumbs>` em cápsula do topo da página.
- **A trilha entra na barra superior.** Ela vai para a segunda linha da barra, no lugar onde o Portal mostra a saudação: o título continua "Salas" e embaixo aparece "Salas / Corpus Hermeticum".
  - "Salas" é um link para `/salas`.
  - O nome da Sala é o item atual (`aria-current="page"`) e corta com reticências se faltar espaço.
  - A trilha fica dentro de um `nav` com `aria-label="Trilha"`.
- **Como a barra recebe a trilha.**
  - A `BarraSuperior` ganha uma propriedade `trilha`, que exclui a `saudacao`.
  - A moldura passa a trilha nas rotas `/salas/[slug]`.
  - O nome da Sala sai do catálogo, que já conhece as Salas visíveis, ou de outro caminho simples, desde que funcione no servidor e no cliente sem piscar.
- **No celular,** abaixo de 900 px, a barra esconde a segunda linha. Ali, um botão secundário pequeno "‹ Salas" abre o conteúdo, acima do rótulo do cabeçalho.
- **Fora deste item:** a página do artigo (`/salas/[slug]/[conteudo]`) fica como está.

**2. Cabeçalho da Sala** (peça nova, ver parte 2): duas colunas de mesma largura, com `--space-8` entre elas.

- **Coluna da esquerda:**
  - **Rótulo** (`sdb-meta`, secundário):
    - na Sala oficial, "Sala · {tradição}", como hoje (por exemplo, "Sala · Hermetismo greco-egípcio · séc. I–III");
    - na Sala de anfitrião, só "Sala de anfitrião", porque o nome do anfitrião já aparece na assinatura.
  - **Título** da Sala, em `sdb-large-title`. É o único `h1`: o título da barra superior é um `p`. Nunca truncado.
- **Coluna da direita:** começa na altura do rótulo e espalha o conteúdo até a base do título.
  - **Em cima, a descrição** da Sala, em `sdb-body-sm`.
  - **Embaixo, a linha de assinatura e dados,** que quebra quando falta espaço:
    - **Sala de anfitrião:**
      - **A assinatura vem primeiro:** o `Avatar` com as iniciais e, ao lado, o nome do anfitrião (link para `/anfitrioes/[slug]`) com a credencial embaixo, em `footnote`. Depois vem o Selo de proveniência "Anfitrião".
      - **"Site da Sala":** quando houver link, o botão secundário pequeno vai depois dos dados, com o ícone `externo`, em nova aba.
    - **Sala oficial:** não tem assinatura. Ela não tem um autor, e eu decidi que esse espaço é só do anfitrião. Ali entra o botão "Perguntar ao assistente sobre esta Sala" (`tinted`, pequeno, ícone `ia`), que só aparece quando `naComparacao` é verdadeiro, como hoje.
    - **Os dados, em pares rótulo e valor numa linha** (rótulo secundário, valor em `label`):
      - "Nível predominante", com o `SeloNivel` simples;
      - "Período";
      - "Publicada em", com a data da primeira publicação (`publicadaEm` da Sala editorial). Sem ela, use a data de atualização e escreva "Atualizada em".
  - **A linha "Acervo" sai.** As contagens aparecem no filtro de níveis e nos títulos das seções.
- **Abaixo de ~900 px de container,** o cabeçalho empilha nesta ordem: rótulo, título, descrição e a linha de assinatura e dados.

**3. Banner** (peça nova, ver parte 2): a imagem da Sala na largura toda do container.

- **Imagem:** a de `imagemDaSala`, a enviada pelo anfitrião ou a de `public/imagens/salas`.
- **Proporção:** 3:1. Passa para 2:1 abaixo de ~900 px e para 16:10 abaixo de ~520 px.
- **Acabamento:** cantos `--radius-lg` e sombra de card.
- **Sem imagem:** a placa da marca na cor da Sala, com o arco em traço fino no canto inferior direito.
- **Crédito:** vai embaixo, em `footnote`, assim que o item de imagens do acervo existir. Por exemplo: "Gravura do séc. XIX, frequentemente identificada como Hiparco em Alexandria; atribuição a confirmar." O texto alternativo e o foco (`object-position`) também vêm desse item. Enquanto ele não existir, o `alt` fica vazio e não há legenda.
- **`TopoDeAnfitriao`:** deixa de existir. A imagem dele vira o banner, e a assinatura e o link vão para o cabeçalho.

**4. Duas colunas:** a principal à esquerda e uma lateral de 20rem à direita, com `--space-8` entre elas. A lateral não fica fixa na rolagem.

- **Coluna principal: Conteúdos.**
  - **Linha de título:** "Conteúdos" em `title-2` à esquerda e, à direita, o segmentado de nível com contagem: "Todos 3 · Iniciante 1 · Intermediário 1 · Avançado 1". Embaixo, um filete (`--separator`), como no frame.
  - **Filtro:**
    - começa em "Todos";
    - o segmentado rola na horizontal quando não cabe, sem quebrar;
    - a contagem do resultado é anunciada num `aria-live` discreto.
  - **Lista:** uma coluna só de `CardConteudo` padrão, com tipo, Sala, título, resumo, temas, nível, autoria e selo, e o botão de salvar na estante (`sdb-over`). Espaço `--space-4` entre os cards. Nunca em grade.
  - **Estados vazios:** ficam os de hoje (`EstadoSecao`). Se a Sala não tem conteúdo, o estado da Sala vazia. Se o nível não tem conteúdo, o estado com "Ver todos os níveis".
  - **Trilha de estudo:** o `TODO(trilhas)` muda de lugar e fica no fim desta coluna, depois da lista.
- **Coluna lateral, de cima para baixo,** com `--space-8` entre os blocos:
  1. **"Vídeos do assunto"** (`title-2`): os vídeos da Sala no card de conteúdo com imagem (`sala--conteudo sala--normal sala--acervo`, que já existe no design system).
     - **Sobre a imagem:** o chip "Vídeo" e o botão de salvar.
     - **No corpo:**
       - a Sala com o tema, em caixa alta pequena;
       - o título;
       - o nível e a duração;
       - o selo.
     - **Link:** leva ao YouTube em nova aba, e só com URL específica de vídeo. Sem ela, o card não vira link e diz que o link do episódio ainda não foi cadastrado, como pede o guia do Card Vídeo.
     - **Mais de 3 vídeos:** mostre os 3 mais recentes e um link "Ver os N vídeos", que leva a `/biblioteca?sala={slug}&formato=video`.
     - **Sem vídeo:** o bloco some.
  2. **"Trecho de fonte primária"** (`title-2`): o `BlocoCitacao` da Sala (`citacaoDestaque`).
     - **Vista inicial:** "Tradução", como no frame, porque "Lado a lado" empilha numa coluna estreita. As três vistas continuam disponíveis.
     - **Sem trecho:** o bloco some.
  3. **"Comparar um tema com as outras Salas"** (`headline`): os chips de tema que hoje ficam no topo, com os mesmos links para `/comparar?tema=…`. Sem temas, o bloco some.
- **Abaixo de ~1040 px de container,** as duas colunas viram uma, nesta ordem: Conteúdos, Vídeos, Trecho, Comparar. Os cards de vídeo passam a uma grade automática (mínimo de ~17rem por card).

**5. Depois das colunas, na largura toda,** com `--space-8` entre os blocos.

- **"Glossário da Sala":** o `GlossarioDaSala` de hoje, na coluna de leitura (46rem), alinhado à esquerda. Mantenha o `id="glossario"`, porque outros lugares apontam para ele.
- **"Fontes usadas nesta Sala":** a grade de `CardFonte` de hoje, com colunas automáticas de no mínimo ~20rem. No celular, uma coluna.
- Cada bloco some quando está vazio, como hoje.

**6. Celular (375 px).**

- Tudo numa coluna, sem rolagem horizontal, nesta ordem:
  1. "‹ Salas";
  2. rótulo, título, descrição, assinatura e dados;
  3. banner em 16:10;
  4. Conteúdos, com o segmentado rolando;
  5. Vídeos;
  6. Trecho;
  7. Comparar;
  8. Glossário;
  9. Fontes.
- O botão do assistente quebra a linha se precisar e nunca corta o texto.

**7. O que fica igual.**

- `RegistrarEstudo`;
- `generateMetadata`;
- o `notFound()`;
- `loading.tsx`, ajustado ao novo esqueleto: cabeçalho em duas colunas, banner e duas colunas.

### 5.2 O que entra no design system primeiro

As peças abaixo nascem em `design-system/`: guia em `components/<Nome>/README.md`, `preview.html`, CSS e comportamento. Depois disso, rode `node design-system/scripts/build.mjs`, `node design-system/scripts/contraste.mjs` e `npm run ds:sync`. Só então elas entram no portal. No fim, avise que a versão publicada do design system (https://claude.ai/artifact/1rSk2ixfmNQXjLu2AHBBJB) precisa ser atualizada.

1. **Barra superior com trilha.**
   - **O que é.** Uma variação da `BarraSuperior` com a trilha na segunda linha, no lugar da saudação.
   - **Aparência.** 14 px, secundária; o item atual fica em `label`; separador "/" terciário.
   - **Celular.** Abaixo de 900 px, a segunda linha some.
   - **Guia.** Diga que a trilha substitui a cápsula de `Breadcrumbs` nas páginas de detalhe que estão dentro da moldura.
2. **Cabeçalho da Sala.**
   - **Composição.** Duas colunas: rótulo e título à esquerda; descrição e linha de assinatura e dados à direita.
   - **Variações.** Sala oficial, com o botão do assistente no lugar da assinatura. Sala de anfitrião, com avatar, nome, credencial, selo e "Site da Sala".
   - **Celular.** Empilha abaixo de ~900 px de container.
3. **Banner da Sala.**
   - **O que é.** Uma figura na largura toda, com a imagem ou a placa com o arco, e legenda de crédito opcional.
   - **Proporções.** 3:1, 2:1 e 16:10, decididas pelo container.
   - **Reaproveitamento.** Se der, reaproveite a moldura `.video-embed__frame` como base, mudando só a proporção.

O card padrão, o card de conteúdo com imagem, o segmentado, o Bloco de citação, os chips, o Verbete e o Card Fonte já existem.

### 5.3 Dados

- **Assinatura.**
  - **Anfitrião:** vem de `sala.anfitriao`, que já existe.
  - **Avatar:** usa as iniciais do nome.
- **Data de publicação.**
  - **O que falta.** O `SalaResumo` (`portal/src/data/repositorio.ts`) passa a levar `publicadaEm`. Ela existe na Sala editorial das oficiais e nas de anfitrião aprovadas. Nas de anfitrião, ela é a data da primeira aprovação.
  - **Regra.** Não exponha campos editoriais além dela.
- **Leitura.** A página continua lendo só o que está publicado, por `repositorio.ts`.

### 5.4 Testes e conferência

- **Testing Library:**
  - o segmentado começa em "Todos" e filtra a lista;
  - as contagens batem;
  - o estado vazio de nível aparece e "Ver todos os níveis" volta;
  - Sala oficial: sem assinatura, com o botão do assistente;
  - Sala de anfitrião: com assinatura, selo, link para a página do anfitrião e "Site da Sala";
  - sem vídeo, sem trecho ou sem temas, o bloco correspondente some;
  - a trilha da barra superior mostra "Salas / {nome}", com o link.
- **Playwright:**
  - membro abre o Corpus Hermeticum, filtra "Avançado" e vê só o "Tratado XIII";
  - troca o trecho para "Original";
  - clica em "Morte" em "Comparar" e chega a `/comparar?tema=morte`;
  - abre a Sala de anfitrião aprovada ("Leituras do Evangelho de Tomé") e vê Helena Varga com o selo;
  - volta a "Salas" pela trilha.
- **No navegador, comparando com o frame e o mockup:**
  - **Com 1440 px e lateral aberta:**
    - o título da Sala começa alinhado ao título da barra superior;
    - o banner e a coluna lateral terminam alinhados ao avatar;
    - a coluna lateral tem 20rem;
    - a descrição começa na altura do rótulo.
  - **Com 1024 px e lateral aberta:**
    - cabeçalho em duas colunas, se couber;
    - conteúdos e lateral numa coluna só.
  - **Com 375 px:**
    - uma coluna, sem rolagem horizontal;
    - "‹ Salas" no topo;
    - o segmentado rola.
  - **Temas:** confira nos quatro, com o escuro como na referência do estado atual.
- **Prints:** Sala oficial com 1440 px; Sala de anfitrião com 1440 px; uma Sala sem imagem (placa); o filtro "Avançado"; e 375 px.
- **Comandos finais:** dentro de `portal/`, `npm run check` e `npm run test:e2e`.

---

## 6. Página do artigo: banner, autoria e dados ao lado do texto em blocos, e "Continuar a busca" em carrossel

Depende da trilha na barra superior e do Banner do item 5. Faça primeiro as peças do design system (6.2) e pare para revisão no catálogo, ao lado do mockup. Depois mude os dados e os editores (6.3) e só então monte a página.

**Referências.** Abra as imagens antes de começar: elas são a especificação.

- **Arquitetura da informação, o que seguir:** `docs/mockups/referencias/artigo-frame.jpg`, o frame que eu desenhei. A ordem e a posição dos blocos são estas:
  1. **Barra superior:** o título "Artigo" e, embaixo, a trilha ("Salas / Apócrifos do cristianismo / Poimandres, §24–26: a subida pelas esferas").
  2. **Banner:** a imagem do artigo, na largura toda.
  3. **Duas colunas.**
     - **À esquerda, estreita, de cima para baixo:**
       - a autoria (avatar e nome, grandes);
       - um filete;
       - os dados em linhas, com o rótulo à esquerda e o valor à direita: data, tempo de leitura e compartilhar;
       - "Vídeos do assunto", com o card do vídeo;
       - "Trecho de fonte primária", com o Bloco de citação;
       - "Fontes", com o Card Fonte.
     - **À direita, larga, o texto:**
       - o primeiro parágrafo maior e em negrito (o lead);
       - parágrafos;
       - uma frase em destaque entre dois filetes, com aspa grande e atribuição embaixo;
       - mais parágrafos;
       - uma imagem no meio do texto;
       - um parágrafo em negrito que abre um novo trecho;
       - mais parágrafos.
  4. **Na largura toda,** depois de um filete: "Continuar a busca", com "Ver todos →" à direita, e um carrossel de cards de conteúdo.
- **O título do artigo:** o frame não mostra, só na trilha. Ele entra no topo da coluna do texto, alinhado ao topo da autoria.
- **Do frame, não copie:**
  - **A lateral.** No frame ela tem foto e nome do usuário, "Continuar de onde parou", "Conteúdos salvos" e o nível do buscador. Aqui a lateral do app fica como está.
  - **A tipografia.** No frame, os títulos e o destaque estão sem serifa, pesados e em caixa alta. Aqui eles seguem o design system, com Fraunces.
  - **A foto do autor.** A autoria é só texto, com o avatar de iniciais, como pede o Card de conteúdo.
  - **Os ícones de Instagram, X e YouTube.** Compartilhar é "Copiar link" e o menu do sistema; veja abaixo.
  - **A citação de Nelson Mandela.** O destaque é sempre uma frase do próprio artigo ou da fonte que ele cita, com atribuição.
  - **Os rótulos em inglês** ("Date", "Read", "Share", "SEE ALL").
  - **O sino da barra superior.**
  - **O texto de enchimento.** Use texto real do acervo.
  - **As imagens do frame.** As imagens seguem o item de imagens do acervo: domínio público ou licença aberta, com crédito, nunca geradas por IA.
- **Como fica com o design system:**
  - **Mockup:** `docs/mockups/artigo.html`, com o artigo "Os sete princípios, em linguagem simples", da Sala O Caibalion, num texto ampliado.
  - **Print:** `docs/mockups/artigo-1440.png`, com 1440 px e a lateral aberta.
  - **O que é real e o que é simulado.** O mockup usa as classes reais do design system. As peças novas estão simuladas no `<style>` dele, só com tokens.
  - **O que seguir.** Siga a composição, os alinhamentos e as proporções. Os valores finais saem do design system.
  - **Como abrir.** Sirva a raiz do projeto com um servidor estático. Se o macOS bloquear a pasta, copie `docs/mockups/`, `design-system/` e `portal/public/imagens/` para uma pasta temporária, mantendo a estrutura.

**Hoje.** A página `portal/src/app/(app)/salas/[slug]/[conteudo]/page.tsx` renderiza `portal/src/features/acervo/LeituraConteudo.tsx` numa coluna só, de 46rem, nesta ordem:
1. Breadcrumbs em cápsula;
2. rótulo, título, resumo e autoria;
3. a mídia do anfitrião;
4. o painel "Sobre este conteúdo": proveniência, Sala, temas, período, nível, formato e data;
5. parágrafos;
6. "Ler no site";
7. a nota de divergência;
8. o Bloco de citação;
9. "Vídeos relacionados", em Cards Vídeo grandes;
10. Fontes;
11. "Continuar a busca", só com os chips "Comparar", o assistente e "Voltar para a Sala".

O `LeituraConteudo` também é a pré-visualização da curadoria e do anfitrião, para que a revisão veja exatamente o que o buscador vê. Isso continua valendo.

### 6.1 Composição

**Alinhamento geral.** Tudo fica dentro do container do conteúdo, entre o título da barra superior e o avatar, com o mesmo respiro dos dois lados.

**1. Barra superior.**

- **Título:** é o tipo do conteúdo (`TIPO_ROTULO`): "Artigo", "Fonte primária" etc.
- **Trilha:** "Salas / {Sala} / {título}". "Salas" e a Sala são links, e o título é o item atual, que corta com reticências se faltar espaço.
- **Como a barra recebe isso:** pelo mesmo caminho que a página da Sala usa para a trilha.
- **A cápsula sai.** Remova a `<Breadcrumbs>` do topo.
- **No celular,** abaixo de 900 px, um botão secundário pequeno "‹ {Sala}" abre o conteúdo.

**2. Banner** (o mesmo da página da Sala): na largura toda, em 3:1, que passa para 2:1 e depois para 16:10 pelo container.

- **Imagem:** a do topo do artigo (`thumb`). Sem ela, a do card (`imagem` ou `imagemDoCard`). Sem nenhuma, a placa da Sala com o arco.
- **Vídeo do anfitrião:** quando o artigo de anfitrião tem link do YouTube, o player (`video-embed`, 16:9, com a legenda de hoje) ocupa o lugar do banner.
- **Crédito, texto alternativo e foco:** vêm do item de imagens do acervo, com o crédito embaixo, em `footnote`.
- **`MidiaDoAnfitriao`:** passa a ser o banner.

**3. Leitura em duas colunas.** A lateral de 20rem fica à esquerda e o texto à direita, com no máximo 46rem e alinhado à esquerda. Em telas muito largas, o espaço que sobra fica à direita do texto. O espaço entre as colunas é `--space-8`.

- **Ordem no HTML:**
  1. título;
  2. autoria e dados;
  3. texto;
  4. lateral com vídeos, trecho e fontes.

  É a ordem do leitor de tela e do celular. A grade posiciona as peças no desktop com estas áreas: `"autor titulo" "autor texto" "extras texto"` e linhas `auto auto 1fr`. Assim, o título fica alinhado ao topo da autoria e os extras começam logo abaixo dos dados, sem buraco.
- **Progresso de leitura:** o `AcompanharLeitura` passa a medir só a coluna do texto, com um seletor estável, como `[data-leitura]`, e não o `article` inteiro.

**3a. Título.**

- **Estilo:** `h1` em `sdb-large-title`, no topo da coluna do texto. Nunca truncado.
- **O resumo sai da página,** porque o lead abre o texto. Ele continua nos cards e nos metadados.

**3b. Autoria e dados** (peça nova, ver 6.2).

- **Autoria:**
  - o `Avatar` de 48 px com as iniciais (tom suave quando é fonte primária, como hoje);
  - ao lado, o nome em `headline` e a credencial embaixo, em `footnote`;
  - no artigo de anfitrião, o nome é um link para `/anfitrioes/[slug]`.
- **Filete.**
- **Dados, um por linha,** com o rótulo à esquerda (semibold) e o valor à direita:
  - "Publicado em", com a data;
  - "Leitura", com "9 min" (num vídeo, "Duração");
  - "Período", se houver;
  - "Nível", com o `SeloNivel` simples;
  - "Temas", com os Badges neutros, que quebram linha à direita;
  - "Proveniência", com o Selo de proveniência, que é obrigatório. Logo abaixo vem a explicação dele (`PROVENIENCIA_AJUDA`), em `footnote`;
  - "Compartilhar".
- **"Compartilhar":**
  - **Botão:** um botão secundário pequeno, "Copiar link", com o ícone `copiar`. Ele copia o endereço do artigo e confirma com o toast "Link copiado.". Se a área de transferência for recusada, ele mostra o link selecionável num toast.
  - **Celular:** onde existir `navigator.share`, o botão vira "Compartilhar", com o ícone `compartilhar`, e abre o menu do sistema com o título e o link. Cancelar não mostra erro.
  - **Ícones de marca:** nenhum.
- **As linhas "Sala" e "Formato" saem.** A Sala já está na trilha e o formato é evidente.

**3c. Texto em blocos** (peça nova "Corpo do artigo", ver 6.2). Os blocos vêm na ordem gravada no conteúdo:

- **Lead:** o primeiro parágrafo, em letra de leitura maior (~22 px) e peso médio.
- **Parágrafo:** em `sdb-body`, com o `TextoMarcado` (`<dfn>` e `<cite>`), como hoje.
- **Intertítulo:** um `h2` em `title-2`, que abre um novo trecho do texto. É o parágrafo em negrito depois da imagem, no frame.
- **Destaque:** uma frase do próprio artigo, ou da fonte que ele cita.
  - **Forma:** fica entre dois filetes (`--separator`), com a aspa grande em `label-tertiary`, nunca em ouro, porque o ouro não vai em texto. O texto vem em Fraunces, com uns 30 px.
  - **Atribuição:** é obrigatória e vai embaixo, em `footnote`. Por exemplo: "*O Caibalion*, cap. II (1908), em tradução da equipe".
  - **Marcação:** `figure` > `blockquote` + `figcaption`.
  - **Não é o Bloco de citação.** Ele continua sendo o trecho de fonte primária, com original e tradução.
- **Imagem:** na largura da coluna, com cantos `--radius-lg`.
  - **Obrigatórios:** texto alternativo e crédito, em `footnote`, embaixo. A legenda é opcional e vem antes do crédito.
  - **Regras:** as do item de imagens do acervo.
- **Depois dos blocos, como hoje:**
  - "Ler no site", no artigo de anfitrião com link de site;
  - a nota de divergência (`Alerta` de aviso), tanto a do conteúdo quanto a do anfitrião. A nota da curadoria continua dizendo para ver as outras leituras em "Continuar a busca", abaixo;
  - o `TODO(comunidade)`, que fica no fim desta coluna.

**3d. Lateral, abaixo dos dados,** com `--space-8` entre os blocos:

1. **"Vídeos do assunto"** (era "Vídeos relacionados"): os vídeos ligados ao conteúdo (`videosDoConteudo`) no card de conteúdo com imagem (`sala--acervo`), com as mesmas regras da página da Sala:
   - leva ao YouTube só com URL específica de vídeo;
   - sem ela, o card não vira link e diz que o link ainda não foi cadastrado.
2. **"Trecho de fonte primária":** o `BlocoCitacao` do conteúdo (`conteudo.citacao`). Ele sai do fim do texto e começa em "Tradução".
3. **"Fontes":** os `CardFonte` empilhados, numa coluna só.

Cada bloco some quando está vazio.

**3e. Abaixo de ~900 px de container,** tudo vira uma coluna:
1. título;
2. autoria e dados;
3. texto;
4. vídeos, numa grade automática de no mínimo ~17rem;
5. trecho;
6. fontes.

**4. "Continuar a busca"** (na largura toda, depois de um filete e de `--space-8`). Usa o `Carrossel` do design system.

- **Cabeçalho:**
  - à esquerda, o `h2` "Continuar a busca" em `title-1` e a legenda em `meta`: "Outros conteúdos sobre {temas} · primeiro das outras Salas";
  - à direita, "Ver todos" (botão `plain` pequeno, com chevron), que leva a `/biblioteca?tema={primeiro tema}`, e as setas do carrossel.
- **Entre o cabeçalho e o trilho** (o lugar de chips que o Carrossel já prevê):
  - os chips "Comparar: {tema}", que levam a `/comparar?tema=…`;
  - o botão "Perguntar ao assistente" (`tinted`, pequeno, ícone `ia`), com o escopo da Sala quando ela está na comparação, como hoje.
- **Trilho:** até 8 `CardConteudo` padrão (`--sdb-item` de ~300 px), com o botão de salvar.
  - **Quais conteúdos:** os publicados que têm ao menos um tema em comum, sem o próprio.
  - **Ordem:** primeiro os das outras Salas, porque é a proposta da busca comparativa, e depois os da mesma Sala. Dentro de cada grupo, mais temas em comum primeiro e, em empate, o mais recente.
  - **Sem relacionados:** o trilho e as setas somem, e ficam os chips e o assistente.
- **"Voltar para {Sala}" sai.** A trilha e, no celular, "‹ {Sala}" fazem esse papel.

**5. Celular (375 px).**

- Uma coluna, sem rolagem horizontal, nesta ordem:
  1. "‹ {Sala}";
  2. banner em 16:10;
  3. título;
  4. autoria e dados;
  5. texto;
  6. vídeos;
  7. trecho;
  8. fontes;
  9. "Continuar a busca".
- O lead cai para ~19 px e o destaque para ~24 px.
- O carrossel ocupa até 82% da tela por card, como no guia.

**6. Pré-visualização.** Na curadoria (`/admin`) e no anfitrião, o `LeituraConteudo` mostra do banner para baixo, igual à página pública, sem a barra superior. O `AcompanharLeitura` e o registro de estudo continuam só na página pública.

**7. O que fica igual.**

- `generateMetadata`, com título e resumo;
- o `notFound()`;
- a regra de que a página lê só o que está publicado.

### 6.2 O que entra no design system primeiro

As peças abaixo nascem em `design-system/`: guia em `components/<Nome>/README.md`, `preview.html`, CSS e comportamento. Depois disso, rode `node design-system/scripts/build.mjs`, `node design-system/scripts/contraste.mjs` e `npm run ds:sync`. Só então elas entram no portal. No fim, avise que a versão publicada do design system (https://claude.ai/artifact/1rSk2ixfmNQXjLu2AHBBJB) precisa ser atualizada.

1. **Autoria do conteúdo.**
   - **O que é.** A coluna estreita com avatar, nome e credencial, filete e lista de dados em linhas, com rótulo à esquerda e valor à direita.
   - **Variações.** Curadoria, especialista, fonte primária (avatar suave) e anfitrião (nome com link).
   - **Celular.** Na largura toda.
2. **Corpo do artigo.**
   - **O que é.** Uma peça com os blocos lead, parágrafo, intertítulo, destaque e imagem no texto, mais o ritmo entre eles: `--space-5` entre os blocos, um pouco mais antes de um intertítulo, de um destaque e de uma imagem.
   - **Exemplo.** Use o texto do mockup.
   - **Guia.** Diga quando usar o destaque e quando usar o Bloco de citação.
3. **Botão de compartilhar.**
   - **O que é.** "Copiar link", que vira "Compartilhar" onde houver menu do sistema, com o toast e a alternativa de seleção.
   - **Lugar.** Pode viver como variação do Botão.

O Banner, a trilha na barra superior, o card de conteúdo com imagem, o Carrossel, o Bloco de citação, o Card Fonte, o Alerta, os Selos e os Badges já existem, ou nascem no trabalho da página da Sala.

### 6.3 Dados e editores

- **Corpo em blocos.**
  - **O tipo.** Em `portal/src/data/types.ts`, `Conteudo.corpo` passa de `TextoMarcado[]` para `BlocoCorpo[]`:

    ```ts
    type BlocoCorpo =
      | TextoMarcado // parágrafo; o primeiro é o lead
      | { tipo: "intertitulo"; texto: string }
      | { tipo: "destaque"; texto: TextoMarcado; atribuicao: string }
      | { tipo: "imagem"; src: string; alt: string; credito: string; legenda?: string; midia?: string };
    ```

  - **O que não muda.** Os textos soltos continuam sendo parágrafos, então os dados atuais funcionam sem mudança.
  - **Helper de texto.** Crie um helper `textoDoCorpo(corpo)` que devolve só o texto: parágrafos, intertítulos e destaques.
  - **Onde ele entra.** Use-o em tudo o que hoje junta o corpo:
    - a duração e o resumo do anfitrião (`resumoDoTexto` e `duracaoDoTexto`, em `features/anfitriao/regras/artigo.ts`);
    - o limite de trecho reproduzido e a lista de onde o texto aparece (`features/admin/regras/checklist.ts` e `config.ts`);
    - a cópia pública (`data/repositorio.ts`).
  - **Imagens.** Não contam texto.
  - **Outros lugares.** Procure qualquer outro uso de `corpo` com `grep`, como nos formulários (`features/admin/formularios.ts`) e nos servidores editoriais (`server/admin/editorial.ts`, `server/anfitriao/editorial.ts`, `server/anfitriao/revisao.ts`).
- **Editores.**
  - **Onde.** O editor de artigo da curadoria (`features/admin/ui/EditorArtigo.tsx`) e o do anfitrião (`features/anfitriao/ui/EditorArtigoAnfitriao.tsx`).
  - **O que muda.** O editor de parágrafos (`EditorTextoMarcado`) vira um editor de blocos, com estas ações:
    - entre dois blocos, "Adicionar" com Parágrafo, Intertítulo, Destaque e Imagem;
    - mover para cima e para baixo;
    - remover.
  - **Destaque:** pede o texto e a atribuição.
  - **Imagem:**
    - usa o `CampoImagem` e o envio por `/midia` que já existem;
    - pede o texto alternativo, o crédito e a legenda opcional;
    - o anfitrião envia as próprias imagens com as mesmas regras de hoje.
  - **Pré-visualização:** mostra os blocos como a página.
- **Validação** (regras puras, conferidas no cliente e na Server Action):
  - o primeiro bloco é um parágrafo;
  - destaque precisa de texto e atribuição;
  - imagem precisa de texto alternativo e crédito;
  - o checklist de publicação da curadoria ganha esses itens, e cada erro leva ao bloco certo.
- **Permissões.** As Server Actions continuam conferindo o papel (administrador) e a posse (anfitrião), e registram no histórico como hoje. Artigo de anfitrião continua indo à revisão.
- **Dados de demonstração.**
  - **O artigo.** Amplie "Os sete princípios, em linguagem simples" (`data/mock/conteudos.ts`) com o texto do mockup: lead, parágrafos, destaque, imagem, intertítulo "O que a pesquisa diz" e a `divergencia`.
  - **As imagens.**
    - o banner: a gravura de Éliphas Lévi (`conteudos/sete-principios-hermeticos.webp`);
    - no texto: a pintura do templo de sete degraus (`salas/caibalion.webp`).
    Créditos, como no manifesto de `portal/public/imagens/LEIA-ME.md`.
  - **Tempo de leitura.** Recalcule.
  - **Os outros conteúdos.** Ficam como estão.

### 6.4 Testes e conferência

- **Unitários:**
  - `textoDoCorpo`;
  - duração e resumo com blocos;
  - limite de trecho com blocos;
  - a validação de destaque e imagem;
  - a escolha e a ordem de "Continuar a busca": temas em comum, outras Salas primeiro, sem o próprio, até 8.
- **Testing Library:**
  - **Corpo:** o `LeituraConteudo` mostra o lead, o intertítulo, o destaque com atribuição e a imagem com alt e crédito.
  - **Obrigatórios:** o Selo de proveniência sempre aparece, e a divergência também, quando existe.
  - **Blocos vazios:** os blocos da lateral somem quando não há conteúdo.
  - **Compartilhar:** com a área de transferência, copia e mostra o toast; com `navigator.share`, abre o menu; ao cancelar, não mostra erro.
  - **Editor:** o editor de blocos adiciona, move e remove blocos, e impede a publicação sem alt, crédito ou atribuição.
- **Playwright:**
  - membro abre "Os sete princípios" e vê a trilha, o banner, o título ao lado da autoria, o destaque e a imagem;
  - copia o link;
  - troca o trecho para "Original";
  - usa as setas do carrossel;
  - clica em "Comparar: Origem do universo" e chega a `/comparar`;
  - "Ver todos" leva à Biblioteca filtrada;
  - volta à Sala pela trilha;
  - administrador adiciona um destaque e uma imagem a um artigo, publica e vê os dois na página;
  - anfitrião adiciona uma imagem ao artigo dele, envia para revisão e, depois da aprovação, a imagem aparece.
- **No navegador, comparando com o frame e o mockup:**
  - **Com 1440 px e lateral aberta:**
    - o banner e o carrossel terminam alinhados ao avatar;
    - a lateral tem 20rem;
    - o texto tem no máximo 46rem;
    - o topo do título fica alinhado ao topo da autoria;
    - os vídeos começam logo abaixo dos dados.
  - **Com 1024 px e lateral aberta:** uma coluna.
  - **Com 375 px:**
    - a ordem descrita em "Celular";
    - sem rolagem horizontal.
  - **Temas:** confira nos quatro.
  - **Pré-visualizações:** confira a da curadoria e a do anfitrião.
- **Prints:**
  - o artigo com 1440 px;
  - um artigo sem imagem (placa);
  - um artigo de anfitrião com vídeo do YouTube;
  - o artigo com 375 px;
  - o editor de blocos.
- **Comandos finais:** dentro de `portal/`, `npm run check` e `npm run test:e2e`.
