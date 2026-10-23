# Página da Sala: cabeçalho em duas colunas, banner e conteúdos ao lado de vídeos e trecho

Antes de começar, leia:
- `CLAUDE.md` na raiz;
- `design-system/README.md` e `design-system/DIRETRIZES.md`;
- o guia e o exemplo de cada peça que for usar (`design-system/components/<Nome>/README.md` e `design-system/exemplos/<Nome>.html`), principalmente `BarraSuperior`, `CardConteudo` (o card padrão e o "Com imagem", `sala--acervo`), `Segmented`/`Tabs`, `BlocoCitacao`, `ChipTema`, `SeloNivel`, `SeloProveniencia`, `Avatar`, `VerbeteGlossario`, `CardFonte` e `EstadoSecao`.

Regras:
- Use só classes e tokens do design system: nada de cor, raio, sombra ou espaço solto.
- Nunca edite `portal/src/design-system/`, que é cópia gerada por `npm run ds:sync`.
- A página fica dentro da moldura do app (`app/(app)`).
- O container do conteúdo vai até as mesmas bordas da barra superior, do título ao avatar.

Ordem de trabalho:
1. Faça primeiro as peças do design system (parte 2).
2. Pare para eu revisar o visual no catálogo (`design-system/catalogo.html`) ao lado do mockup.
3. Só depois monte a página.

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

## 1. Composição

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

## 2. O que entra no design system primeiro

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

## 3. Dados

- **Assinatura.**
  - **Anfitrião:** vem de `sala.anfitriao`, que já existe.
  - **Avatar:** usa as iniciais do nome.
- **Data de publicação.**
  - **O que falta.** O `SalaResumo` (`portal/src/data/repositorio.ts`) passa a levar `publicadaEm`. Ela existe na Sala editorial das oficiais e nas de anfitrião aprovadas. Nas de anfitrião, ela é a data da primeira aprovação.
  - **Regra.** Não exponha campos editoriais além dela.
- **Leitura.** A página continua lendo só o que está publicado, por `repositorio.ts`.

## 4. Testes e conferência

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
