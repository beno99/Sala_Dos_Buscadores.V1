# Seção Destaques: vitrine editorial com curadoria no admin

Antes de começar, leia:
- `CLAUDE.md` na raiz;
- `design-system/README.md` e `design-system/DIRETRIZES.md`;
- o guia e o exemplo de cada peça que for usar (`design-system/components/<Nome>/README.md` e `design-system/exemplos/<Nome>.html`), principalmente `CardVideo`, `CardSala` (modo destaque), `CardConteudo` e `Paginacao`.

Regras:
- Use só classes e tokens do design system: nada de cor, raio, sombra ou espaço solto.
- Nunca edite `portal/src/design-system/`, que é cópia gerada por `npm run ds:sync`.
- A página fica dentro da moldura do app (`app/(app)`).
- O container do conteúdo vai até as mesmas bordas da barra superior, do título ao avatar.

Ordem de trabalho:
1. Faça primeiro as peças do design system (parte 2).
2. Pare para eu revisar o visual no catálogo (`design-system/catalogo.html`) ao lado do mockup.
3. Só depois monte a página e o admin.

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

## 1. Composição

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

## 2. O que entra no design system primeiro

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

## 3. Curadoria no admin

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

## 4. Dados simulados

- **Contagem de buscas.** Crie a contagem dos últimos 30 dias por conteúdo em `portal/src/data/mock/`, no padrão dos outros mocks. A lista lê essa contagem pelo repositório.
- **Imagens.** Use as que existem em `portal/public/imagens/` (salas, episódios, conteúdos). Quem não tem imagem cai na placa da marca. A produção de imagens para os conteúdos é outro trabalho (o item de imagens do acervo).

## 5. Testes e conferência

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
