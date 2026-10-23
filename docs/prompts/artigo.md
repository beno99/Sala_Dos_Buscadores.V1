# Página do artigo: banner, autoria e dados ao lado do texto em blocos, e "Continuar a busca" em carrossel

Antes de começar, leia:
- `CLAUDE.md` na raiz;
- `design-system/README.md` e `design-system/DIRETRIZES.md`;
- o guia e o exemplo de cada peça que for usar (`design-system/components/<Nome>/README.md` e `design-system/exemplos/<Nome>.html`), principalmente `BarraSuperior`, `CardConteudo` (o padrão e o "Com imagem", `sala--acervo`), `BlocoCitacao`, `CardFonte`, `Carrossel`, `ChipTema`, `Alerta`, `Avatar`, `SeloNivel`, `SeloProveniencia`, `Badge`, `Toast`, `EditorTextoMarcado` e `CampoImagem`.

Regras:
- Use só classes e tokens do design system: nada de cor, raio, sombra ou espaço solto.
- Nunca edite `portal/src/design-system/`, que é cópia gerada por `npm run ds:sync`.
- A página fica dentro da moldura do app (`app/(app)`).
- O container do conteúdo vai até as mesmas bordas da barra superior, do título ao avatar.
- Este trabalho usa a trilha na barra superior e o Banner que o trabalho da página da Sala (`docs/prompts/sala.md`) cria. Se eles ainda não existirem, faça essas duas peças primeiro, como está descrito lá.

Ordem de trabalho:
1. Faça primeiro as peças do design system (parte 2).
2. Pare para eu revisar o visual no catálogo (`design-system/catalogo.html`) ao lado do mockup.
3. Depois mude os dados e os editores (parte 3).
4. Só então monte a página.

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

## 1. Composição

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

**3b. Autoria e dados** (peça nova, ver a parte 2).

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

**3c. Texto em blocos** (peça nova "Corpo do artigo", ver a parte 2). Os blocos vêm na ordem gravada no conteúdo:

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

## 2. O que entra no design system primeiro

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

## 3. Dados e editores

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

## 4. Testes e conferência

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
