# Biblioteca: o acervo por Salas, com busca, filtros e glossário

Antes de começar, leia:
- `CLAUDE.md` na raiz;
- `design-system/README.md` e `design-system/DIRETRIZES.md`;
- o guia e o exemplo de cada peça que for usar (`design-system/components/<Nome>/README.md` e `design-system/exemplos/<Nome>.html`), principalmente `CardConteudo`, `CardSala` (normal), `ChipTema`, `FiltrosBusca`, `Drawer`, `Paginacao`, `BarraBusca` e `VerbeteGlossario`.

Regras:
- Use só classes e tokens do design system: nada de cor, raio, sombra ou espaço solto.
- Nunca edite `portal/src/design-system/`, que é cópia gerada por `npm run ds:sync`.
- A página fica dentro da moldura do app (`app/(app)`).
- O container do conteúdo vai até as mesmas bordas da barra superior, do título ao avatar.

Ordem de trabalho:
1. Faça primeiro as peças do design system (parte 2).
2. Pare para eu revisar o visual no catálogo (`design-system/catalogo.html`) ao lado do mockup.
3. Só depois monte a página e o admin.

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

## 1. Composição

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

## 2. O que entra no design system primeiro

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

## 3. Dados e admin

- **Termos de cada conteúdo.**
  - **Campo novo.** `Conteudo` e `Video` ganham `termos`: os verbetes de `GLOSSARIO` (`portal/src/data/mock/glossario.ts`) de que tratam.
  - **Demonstração.** Preencha os 15 conteúdos e os 5 vídeos.
  - **Contagens.** Os verbetes e os chips contam só os publicados.
- **Admin.** Os editores de artigo e de vídeo em `/admin` ganham o campo "Termos do glossário", com escolha entre os verbetes existentes. A Server Action confere o papel de administrador e registra no histórico (`portal/src/server/auditoria.ts`).
- **Leitura dos dados.** A página lê só o que está publicado, por `portal/src/data/repositorio.ts`.
- **Imagens.** Use as que existem em `portal/public/imagens/`. A produção de imagens dos conteúdos é outro trabalho (o item de imagens do acervo).

## 4. Testes e conferência

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
