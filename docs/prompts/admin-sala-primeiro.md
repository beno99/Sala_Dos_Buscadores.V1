# Curadoria a partir da Sala: artigos e vídeos nascem dentro dela

Antes de começar, leia:
- `CLAUDE.md` na raiz;
- `docs/prompts/anfitrioes.md`. Este trabalho **substitui** a linha "administrador mantém sem mudança o fluxo atual" do §1 de lá. O resto daquele prompt continua valendo;
- o código atual da curadoria:
  - `portal/src/app/admin/**`;
  - `portal/src/features/admin/ui/*`, principalmente `CascaCuradoria.tsx`, `EditorArtigo.tsx`, `EditorVideo.tsx`, `ListaArtigos.tsx` e `ListaVideos.tsx`;
  - `portal/src/server/admin/*`;
  - `portal/src/app/admin/exportar/[tipo]/route.ts`;
  - `tests/e2e/curadoria.spec.ts`;
- o guia e o exemplo das peças que for usar: `TabelaDados`, `PainelCabecalho`, `Breadcrumbs`, `Tabs`, `CardSala`, `Badge`, `Select`, `CampoImagem`, `Modal`, `Menu` e `ChecklistPublicacao`.

Regras:
- Use só classes e tokens do design system. Nunca edite `portal/src/design-system/`.
- Se faltar uma peça, estenda o design system primeiro e me avise.
- Toda Server Action confere o papel no servidor.
- O admin continua **sem poder editar** conteúdo de anfitrião.
- Antes de concluir: `npm run check` e `npm run test:e2e`.

## O problema

**Hoje.** O admin cria artigos e vídeos soltos. Há "Novo artigo" e "Novo vídeo" no Painel do acervo e nas listas, e a Sala é só um `Select` dentro do editor. Não existe tela de Salas no admin (`TODO(admin-salas)` em `CascaCuradoria.tsx`).

**O que já existe e deve ser reaproveitado, não refeito:**
- As Salas já estão no store como `SalaEditorial`, com status, no mapa `acervo().salas` de `portal/src/server/store.ts`.
- `salasOficiais()` e `salaPorSlug()` estão em `portal/src/data/catalogo.ts`.
- A regra "visível ⇔ publicada e com ≥ 1 artigo publicado" já está em `portal/src/features/anfitriao/regras/visibilidade.ts`.
- O formulário de Sala do anfitrião e o `CampoImagem` servem de base para o formulário da Sala oficial.

**O que queremos.** O mesmo raciocínio do anfitrião. Primeiro existe a Sala; dentro dela se criam um, dois, três artigos; os vídeos nascem dentro da Sala ou dentro de um artigo. **Nada se cria fora de uma Sala.**

## 1. Navegação da curadoria

Menu lateral, nesta ordem:
- Painel;
- **Salas** (novo, com contagem de Salas);
- Revisão de anfitriões;
- Fontes;
- Destaques;
- Usuários;
- Caixa de saída;
- Histórico.

**Saem do menu "Artigos" e "Vídeos".** As rotas antigas redirecionam (`redirect` permanente no servidor) para as novas:
- `/admin/artigos` → `/admin/salas`;
- `/admin/artigos/[id]` → `/admin/salas/[slug]/artigos/[id]`;
- `/admin/artigos/[id]/previa` → `/admin/salas/[slug]/artigos/[id]/previa`;
- `/admin/videos` e `/admin/videos/[id]`: idem, para as rotas de vídeo;
- `/admin/artigos/novo` e `/admin/videos/novo` → `/admin/salas`, porque ninguém cria sem escolher a Sala.

**Fontes continua global.** É o catálogo de obras que todas as Salas citam, e "Nova fonte" continua onde está.

## 2. Painel do acervo (`/admin`)

- **Ações do topo:** saem "Novo artigo" e "Novo vídeo" e entram **"Nova Sala"** (primária) e "Nova fonte" (secundária).
- **Cards de números** (Artigos, Vídeos, Fontes, Com pendência): continuam. Clicar em Artigos ou Vídeos leva a `/admin/salas`.
- **Tabela "Por Sala":** cada linha leva à página da Sala.
- O card "Revisão de anfitriões" e o aviso da grade comparativa ficam como estão.

## 3. Lista de Salas (`/admin/salas`)

- **Cabeçalho:** `PainelCabecalho` com "Salas" e o botão "Nova Sala".
- **Filtros:**
  - Origem: Todas, Curadoria ou Anfitriões;
  - Status: rascunho, em revisão, publicado, reprovado ou arquivado;
  - busca por nome;
  - Anfitrião: só aparece com a origem "Anfitriões".
- **`TabelaDados`, colunas:**
  - Sala, com `CardSala` miniatura ou placa;
  - Origem: "Curadoria" ou o nome do anfitrião;
  - Status;
  - Artigos (publicados / total);
  - Vídeos;
  - Na comparação;
  - Atualizada em;
  - ação.
- **Ação por linha:**
  - **Sala oficial:** "Abrir" leva a `/admin/salas/[slug]`.
  - **Sala de anfitrião:** "Revisar" leva à página de revisão que já existe (`/admin/anfitrioes/[contaId]/salas/[salaId]`), somente leitura com aprovar e reprovar. Nunca leva a um editor.
- **"Exportar CSV":** sai das antigas listas e vem para cá, com dois itens num `Menu`, "Artigos" e "Vídeos". Respeita os filtros. Mantenha o Route Handler `exportar/[tipo]`.

## 4. Criar e editar Sala oficial

**`/admin/salas/nova` e `/admin/salas/[slug]/editar`.** Formulário com:
- nome;
- slug: gerado do nome e **travado depois da primeira publicação**, como nos artigos;
- tradição;
- tradição curta (rótulo da grade comparativa);
- descrição;
- período;
- placa (bordô, grafite ou bege);
- inicial;
- imagem (`CampoImagem`, opcional; sem ela, a placa);
- link geral (opcional, `https`).

Regras:
- **Ciclo:** `rascunho | publicado | arquivado`, publicado direto, sem fila. Use o mesmo `ChecklistPublicacao` dos artigos para o que falta.
- **Visibilidade:** vale a mesma regra das Salas de anfitrião. A Sala só aparece no portal se está publicada **e** tem ≥ 1 artigo publicado.
- **Arquivar, nunca excluir.** Arquivar uma Sala tira do ar todos os artigos e vídeos dela de uma vez, sem mudar o status de cada um. Restaurar devolve tudo como estava. Peça confirmação num `Modal` dizendo quantos itens saem do ar.
- **Grade comparativa:** uma Sala oficial nova entra nela, mas ainda não tem respostas curadas. Confira como a grade trata uma coluna sem resposta: precisa aparecer um estado vazio sereno ("Sem leitura curada para este tema ainda"), nunca um buraco ou erro. Faça o mesmo no assistente.
- **Auditoria:** registre `criou`, `editou`, `publicou`, `arquivou` e `restaurou` com `tipoItem: "sala"`.

## 5. Página da Sala oficial (`/admin/salas/[slug]`)

**Cabeçalho:**
- `Breadcrumbs`: Salas › nome;
- imagem ou placa, nome, tradição, status e a frase "Visível no portal" ou o motivo de não estar ("Sem artigo publicado", "Arquivada");
- ações "Editar Sala", "Ver no portal" e o `Menu` com "Arquivar".

**Abas (`Tabs`):**
1. **Artigos.**
   - Botão **"Novo artigo"**, que leva a `/admin/salas/[slug]/artigos/novo`.
   - `TabelaDados` com os artigos e fontes primárias da Sala e os filtros que já existiam na antiga lista: tipo, status, proveniência, nível e tema. A coluna Sala sai.
   - Editar, prévia e o `Menu` de ações (publicar, despublicar, arquivar, duplicar) como hoje.
2. **Vídeos.**
   - Botão **"Novo vídeo"**, que leva a `/admin/salas/[slug]/videos/novo`.
   - Tabela com os vídeos da Sala e a coluna **"Ligado a"**: os artigos a que o vídeo se liga, ou "Só na Sala".

## 6. Editores dentro da Sala

**Artigo (`/admin/salas/[slug]/artigos/novo` e `/[id]`):**
- Reaproveite o `EditorArtigo`. **O `Select` de Sala sai**: a Sala vem da rota e aparece como contexto fixo no topo ("Sala: Corpus Hermeticum").
- Mudar de Sala vira uma ação "Mover para outra Sala" no `Menu`:
  - só para artigos que nunca foram publicados, porque o endereço público inclui a Sala;
  - só entre Salas oficiais;
  - com confirmação.
- **Bloco novo "Vídeos deste artigo"**, no fim do editor:
  - lista os vídeos ligados ao artigo;
  - tem o botão **"Novo vídeo neste artigo"**, que leva a `/admin/salas/[slug]/videos/novo?artigo=<id>` e já chega com o artigo marcado;
  - tem a opção "Ligar vídeo existente da Sala";
  - o bloco só aparece depois que o artigo tem `id`, ou seja, depois do primeiro salvamento.

**Vídeo (`/admin/salas/[slug]/videos/novo` e `/[id]`):**
- Reaproveite o `EditorVideo`, sem o `Select` de Sala.
- A ligação com artigos (o campo `artigos` que já existe) só oferece artigos da mesma Sala e já vem preenchida quando o editor abre por `?artigo=`.
- Um vídeo sem artigo é "Só na Sala" e aparece na página pública da Sala, como hoje.

## 7. O que não muda

- Lado do anfitrião: ele já começa pela Sala (`/anfitriao/salas/nova` → `/anfitriao/salas/[id]/artigos/novo`). Confira apenas que nenhum caminho do anfitrião cria artigo fora de uma Sala.
- Fontes, Destaques, Usuários, Caixa de saída e Histórico.
- Regras de publicação, proveniência e situação jurídica do editor de artigo.

## 8. Testes

**Unitários:**
- redirecionamento das rotas antigas;
- Server Action de criar artigo ou vídeo **recusa** chamada sem Sala, com Sala inexistente, com Sala arquivada ou com Sala de anfitrião;
- "Mover para outra Sala" recusa artigo já publicado;
- arquivar e restaurar Sala tira e devolve os itens dela;
- uma Sala publicada sem artigo publicado não aparece no portal.

**E2E** (atualize `tests/e2e/curadoria.spec.ts`):
1. o admin cria a Sala oficial "Upanishads" e publica;
2. ela ainda não aparece em `/salas`;
3. o admin cria e publica 2 artigos dentro dela, e ela aparece com os 2;
4. no editor do segundo artigo, cria um vídeo pelo "Novo vídeo neste artigo", e o vídeo aparece no artigo público;
5. cria um vídeo "Só na Sala", e ele aparece na página pública da Sala;
6. o filtro "Anfitriões" em `/admin/salas` mostra a Sala do anfitrião de demonstração, e "Revisar" abre a revisão sem nenhum campo editável;
7. `/admin/artigos/novo` redireciona para `/admin/salas`.

No fim, atualize `CLAUDE.md` ("a curadoria trabalha a partir da Sala") e `portal/README.md`, e remova o `TODO(admin-salas)`.
