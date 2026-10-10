# Portal · painel único de progresso, leitura, publicados e publicidade

## Skills obrigatórias

Ative e siga durante todo o trabalho:
- `using-superpowers`, com as que ela indicar: `brainstorming`, `writing-plans`, `test-driven-development`, `systematic-debugging` e `verification-before-completion`;
- `ui-ux-pro-max`;
- `emil-design-eng`.

Quando uma skill conflitar com `CLAUDE.md` ou `design-system/`, valem as regras do projeto. Diga qual foi o conflito.

## Contexto (não desfaça)

As Fases A, B e C do redesign estão prontas, e o design system 1.0 (`design-system/`) já foi aplicado ao portal:
- `CardSala` (classes `sala*`), `CardVideo` (`video*`), `GradeComparativa` (`comparison*`/`comparativo*`);
- o orbe do assistente com o mini chat (`OrbeAssistente`, `MiniChatAssistente`, `orb-*`/`assistant-chat*`);
- a sincronização dos CSS novos (`themes.css`, `refinement.css`, `card-*.css`, `assistant-orb.css`, `gold-orb.js`).

Não mexa nessas peças. Esta tarefa muda **só a parte de baixo da página Portal (`/`)**, do título "Seu progresso" até antes do rodapé. O banner rotativo e as Salas recomendadas ficam como estão.

## Referências

Se estiverem na pasta, abra `docs/referencias/redesign-portal/07-portal-progresso-atual.png` e `08-human-academy-painel-unico.png`. Senão, siga a descrição abaixo.

- **07 · como está hoje.**
  - O título "Seu progresso" tem as ações "Como os níveis funcionam" e "Ver conquistas".
  - Abaixo, o painel de 4 KPIs sozinho.
  - Mais abaixo, duas colunas soltas: à esquerda, "Comece por aqui" ou "Continue de onde parou" com cards horizontais grandes (`CardConteudoLinha`), seguidos de "Publicados recentemente" no mesmo formato de card; à direita, um card separado de publicidade ("Textos antigos em domínio público…").
- **08 · como deve ficar (estrutura do painel da Human Academy).** Um único contêiner arredondado engloba tudo:
  - **Linha de cima:** 4 células de KPI, separadas por divisórias verticais, ocupando a largura toda. Uma divisória horizontal separa essa linha do resto.
  - **Metade esquerda de baixo:**
    - "Continue de onde parou", com subtítulo e um único item compacto: miniatura à esquerda, nome do curso pequeno, título, link "Retomar" com ícone;
    - uma divisória;
    - "Últimas aulas", com subtítulo e uma **lista de verdade**: cada linha tem título, meta ("curso · tempo") e chevron à direita, com divisórias finas entre as linhas, sem card, sem sombra e sem miniatura.
  - **Metade direita de baixo:** o anúncio como banner que encosta nas bordas do contêiner, sem moldura própria. Tem imagem de fundo na altura toda com degradê escuro e o conteúdo centralizado: marca, título, texto, duas cápsulas de atributos com ícone, botão grande claro em cápsula com seta e nota pequena embaixo. O canto inferior direito acompanha o raio do contêiner.
  - A divisão esquerda/direita fica alinhada às divisórias dos KPIs: a esquerda embaixo das células 1–2, a direita embaixo das 3–4.

Siga a marca, não as cores da referência (ela é escura e azul). Fundo sólido bege e contraste leve, como no resto do portal.

## O que construir

### 1. Estrutura

- O cabeçalho continua fora do contêiner: título "Seu progresso", nota "Só você vê estes números." e as ações "Como os níveis funcionam" e "Ver conquistas" (quando os níveis estão ligados).
- Logo abaixo, **um único contêiner** (`section` ligada ao título por `aria-labelledby`), em superfície de material com raio `radius-xl`, borda fina e sombra de card. Dentro dele, uma grade de 4 colunas:
  - **Linha 1:** as 4 células de KPI de hoje (Salas visitadas, Conteúdos lidos, Temas comparados, Trilhas em andamento), com os mesmos dados e textos, separadas por divisórias verticais. Uma divisória horizontal embaixo.
  - **Linha 2, colunas 1–2 (coluna de leitura):**
    1. **"Continue de onde parou"** (subtítulo "Retome a leitura no ponto em que parou."). Um item compacto, o da leitura em andamento mais recente:
       - miniatura pequena (imagem ou placa da marca com o arco, raio concêntrico);
       - "Tipo · Sala" em `footnote`;
       - título;
       - barra fina de progresso com "Lido até 50%";
       - link "Retomar leitura" com ícone.
    2. Divisória.
    3. **"Publicados recentemente"** (subtítulo "Conteúdos que entraram no acervo"), em **formato de lista/tabela**, com 4 ou 5 linhas. Cada linha é um link que ocupa a linha inteira e mostra:
       - título;
       - meta ("Sala · Tipo · publicado em 3 out 2026");
       - **Selo de proveniência em tamanho compacto**, obrigatório em todo conteúdo pelo `CLAUDE.md`;
       - chevron.

       As divisórias entre linhas são recuadas, no padrão de lista do design system. Sem card, sombra ou miniatura. A última linha é o link "Ver tudo na Biblioteca" (`/biblioteca`).
    4. **"Para ampliar o olhar"** (pressuposto meu, posso mudar): continua, como um bloco curto no mesmo formato de linha, com a frase de motivo em `footnote`. É ele que evita a bolha de conteúdo.
  - **Linha 2, colunas 3–4:** o **anúncio em banner** (ver seção 3), na altura toda da linha 2, encostado nas bordas do contêiner.
- **Membro sem leituras:** no lugar de "Continue de onde parou" entra "Comece por aqui" (3 conteúdos iniciantes de Salas diferentes), no mesmo formato de item compacto, sem barra e com o link "Começar a leitura".
- **Sem anúncio disponível:** a coluna de leitura ocupa as 4 colunas.
- **Remova a coluna lateral de publicidade de hoje** (`anuncioColuna` ao lado). O anúncio passa a morar dentro do contêiner. Os anúncios do banner rotativo continuam.

### 2. Responsivo (alinhado à grade)

- **≥ 1100 px:** KPIs em 4 colunas; embaixo, 2 + 2.
- **De 900 a 1099 px:** KPIs em 2×2. Embaixo, a coluna de leitura ocupa a largura toda e o anúncio vem depois, com a largura toda e altura mínima de cerca de 360 px.
- **< 900 px (celular):** KPIs em 2×2 (1 coluna abaixo de 480 px), depois a leitura e por fim o anúncio. As divisórias verticais viram horizontais.
- Use os mesmos pontos de quebra do painel agrupado de indicadores que já existe (`sdb-stats`).
- **Atenção a um bug que já apareceu nesta base:** elementos com `position: absolute` (como `.sdb-sr`, o texto só para leitor de tela) dentro de áreas com rolagem ou recorte precisam de um ancestral posicionado dentro da área. Sem isso, no celular eles escapam e alargam a página inteira, e o Chrome reduz o zoom. Confira `document.documentElement.scrollWidth` igual à largura da tela em 390 px.

### 3. Anúncio em banner (`EspacoPublicitario`, variante nova `--painel`)

- Imagem de fundo em tela cheia na célula, de `portal/public/imagens/anuncios/<id>.webp` quando existir (com o duotone da marca, `portal/scripts/duotone-imagens.py`). Sem imagem, a placa da marca (bordô ou grafite com o arco).
- Véu em degradê por cima, para o texto passar AA (confira com `node design-system/scripts/contraste.mjs` ou à mão).
- Conteúdo centralizado:
  - no topo, à esquerda, sempre visíveis: "Publicidade" e o nome do anunciante;
  - título em Inter (nunca a serifa editorial) e texto curto;
  - até 2 cápsulas de atributos com ícone (ex.: "Domínio público", "Notas de tradução");
  - botão claro em cápsula ("Conhecer a coleção", ícone `externo`, `rel="sponsored noopener"`, nova aba);
  - link "Por que estou vendo isto?", que abre a política no Modal de hoje.
- O canto inferior direito acompanha o raio do contêiner (concêntrico); os outros cantos são internos.
- As regras do anúncio continuam:
  - anunciante fictício e identificado ("Edições Pórtico (anunciante fictício)");
  - sem contagem regressiva, urgência ou exclamação;
  - sem Selo de proveniência e sem o tracejado da IA;
  - nunca no formato das linhas editoriais.

### 4. Design system primeiro

Em `design-system/` (fonte da verdade): tokens se precisar, CSS em `components/bundle.css` (ou CSS próprio da peça, como nas peças 1.0), guia `components/<Nome>/README.md` e `preview.html`. Depois:
- `node design-system/scripts/build.mjs`;
- `node design-system/scripts/contraste.mjs`;
- no `portal/`, `npm run ds:sync`.

Peças:
- **`PainelProgresso` (nova):** o contêiner, a grade 4 colunas, as áreas (KPIs / leitura / anúncio), as divisórias e o comportamento responsivo. Reaproveita as células `.sdb-stat` do `IndicadorNumerico`.
- **`ListaConteudos` (nova):** a lista em tabela de "Publicados recentemente" (linha-link, título, meta, selo compacto, chevron, divisórias recuadas) e o item compacto de "Continue de onde parou"/"Comece por aqui" (miniatura, progresso opcional, ação).
- **`EspacoPublicitario`:** variante `--painel`. No guia, explique por que ela pode encostar nas bordas e ter imagem cheia sem se confundir com o acervo: rótulo sempre visível, sem selo, e os conteúdos editoriais do painel são só linhas.

No fim, avise que a versão publicada do design system (https://claude.ai/artifact/1rSk2ixfmNQXjLu2AHBBJB) precisa ser atualizada.

### 5. Dados e código

- Use o que `modelo` já entrega em `portal/src/features/portal/PortalCliente.tsx`: `indicadores`, `emAndamento` (só o mais recente no item), `comecePorAqui`, `recentes` (passe a 5), `ampliar` e o anúncio (renomeie `anuncioColuna` para `anuncioPainel` em `portal/src/server/estudo.ts`).
- Se `CardConteudoLinha` deixar de ser usado em todo lugar, remova-o.
- Atualize `portal/src/app/(app)/(portal)/loading.tsx` com o esqueleto do painel inteiro.
- Estados: carregando, membro novo, sem anúncio, erro (`Alerta` começando por "Erro:").

### 6. Acessibilidade e voz

- `h2` "Seu progresso" e `h3` em cada bloco interno.
- A lista é `<ul>` com um link por linha.
- O anúncio é `aside aria-label="Publicidade"`.
- O número e o texto dos KPIs carregam a informação; a barra só complementa.
- Foco visível; `prefers-reduced-transparency` deixa o véu opaco.
- Voz da marca: sem exclamação, nada de "Continue assim!", controles com verbo exato.

## Verificação antes de concluir

1. No `portal/`: `npm run check` e `npm run test:e2e`. Atualize os testes do Portal (`tests/e2e/portal.spec.ts`, "a conta de demonstração vê indicadores, Continuar e conquistas") para a nova estrutura e acrescente:
   - a lista de "Publicados recentemente" tem links com o selo de proveniência;
   - o anúncio fica dentro do painel, com "Publicidade" visível.
2. Confira no navegador em 1440, 1024 e 390 px, com a conta de demonstração e com uma conta nova:
   - um contêiner só;
   - a divisão esquerda/direita alinhada às divisórias dos KPIs;
   - a lista sem cards;
   - o anúncio encostado nas bordas;
   - nenhuma rolagem lateral no celular.
3. Entregue um resumo com:
   - o que mudou no design system;
   - o lembrete do artifact;
   - os pressupostos que seguiu ("Para ampliar o olhar" mantido).
