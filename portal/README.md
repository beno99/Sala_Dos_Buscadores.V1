# A Sala dos Buscadores · portal (MVP)

Conta obrigatória com onboarding, acervo em Salas, busca comparativa, assistente de IA e a área de curadoria, onde a equipe editorial cadastra, publica e arquiva artigos, vídeos e fontes. Contas, acervo, estudo e auditoria ficam no **PostgreSQL**; as imagens enviadas, no **Supabase Storage** (compatível com S3). O assistente ainda não chama uma API de IA.

## Rodar

```bash
npm install
cp .env.example .env.local   # ajuste SEED_ADMIN_EMAIL e SEED_ADMIN_SENHA
npm run db:setup             # migrações e semente no banco do .env.local
npm run dev                  # http://localhost:3000 (sincroniza o design system antes)
```

A semente (`npm run db:seed`, idempotente) cria a conta de **administrador** do `.env.local` e importa o acervo oficial de `src/data/semente/` (Salas, conteúdos, citações e fontes). Não há contas nem pessoas fictícias no banco de desenvolvimento: membros se cadastram em `/cadastro`; anfitriões entram por candidatura ou convite da curadoria.

Fluxo para demonstrar: **Criar conta** → onboarding (interesses e, se quiser, religião ou convicção) → Portal (“Comece por aqui”) → **Salas** → abrir uma Sala (conquista “Porta aberta”) → abrir um conteúdo (entra em “Continue de onde parou”) → lupa ou ⌘K / Ctrl K: “vida após a morte” → **Comparar** → **Perguntar ao assistente sobre este tema** → enviar. O botão flutuante abre o assistente por cima de qualquer página.

Entre por `/entrar` com a conta de administrador e use **Curadoria** no grupo Conta da lateral ou no menu da conta.


## Scripts

| Script | O que faz |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js 16 (Turbopack) |
| `npm run db:setup` | `db:migrate` e `db:seed` |
| `npm run db:generate` | gera a migração SQL em `drizzle/` a partir dos `*.schema.ts` |
| `npm run check` | `ds:check`, `ds:test`, `lint` e `typecheck` |
| `npm run ds:sync` / `ds:check` | copia `../design-system` para `src/design-system` e gera ícones e URL das fontes / confere se está em dia |
| `npm run lint` / `lint:fix` | Biome (lint + formatação + organização de imports) |
| `npm run typecheck` | `next typegen` + `tsc` |

`SIMULAR_LATENCIA_MS` (padrão 600) controla a espera simulada da busca.

## Acesso e moldura

- **Cadastro obrigatório.** `src/proxy.ts` manda quem não tem cookie de sessão para `/entrar?voltar=…` em todas as rotas, menos `/entrar`, `/cadastro` e `/recuperar-senha` (checagem otimista, testada em `proxy.test.ts`). A verificação que vale fica no servidor: `app/(app)/layout.tsx` confere a sessão; `/admin` confere o papel; cada Server Action confere de novo.
- **Grupos de rota.** `app/(app)` tem a moldura (`components/layout/Moldura.tsx`): Navegação lateral (recolhível, guardada no navegador), Barra superior (título, saudação no Portal, lupa, aparência e conta), conteúdo, Rodapé, Botão flutuante do assistente (Drawer largo; some em `/assistente`), Painel de busca (lupa ou ⌘K / Ctrl K) e, abaixo de 900 px, a Barra de abas com “Mais”. `app/(conta)` tem entrar, cadastro e recuperar senha, sem moldura. `/admin` mantém a `CascaCuradoria`, com a Barra superior por cima.
- **Onboarding** (`features/onboarding`): abre depois do cadastro e no primeiro login de uma conta sem preferências. Interesses e religião ou convicção são opcionais; a convicção só é salva com consentimento (`preferencias.ts`, regra pura e testada). O evento `sdb:refazer-preferencias` reabre o onboarding.
- **Aparência:** Sólido claro por padrão; a escolha claro/escuro fica no cookie `sdb_tema` e o servidor já entrega o HTML no tema certo.
- Destaques, Biblioteca, Trilhas, Estante e Ajustes existem como páginas provisórias (`TODO(redesign)`) até a Fase D do redesenho.

## Portal e progresso de estudo

- **Portal (`/`)**, montado em `server/estudo.ts` a partir do acervo publicado e das regras puras de `features/estudo/`: banner rotativo (marca, episódios do canal e anúncios; 7 s, pausa, parado com movimento reduzido), Salas recomendadas com chips de tema (filtram o carrossel e levam a “Comparar {tema} entre as Salas”), e o painel de progresso: um contêiner só com os indicadores pessoais em cima e, embaixo, a coluna de leitura (“Continue de onde parou” com a leitura mais recente, ou “Comece por aqui” numa conta sem leituras; “Publicados recentemente” em lista com selo; “Para ampliar o olhar”) ao lado do anúncio em banner (`PainelProgresso`, `ListaConteudos`, `EspacoPublicitario --painel`). A lateral mostra “Continuar”, “Salvos para depois”, o nível no assunto em foco e as conquistas.
- **Progresso** (`server/progresso.ts`, tabela `progresso_estudo`, por conta): Salas visitadas, leituras com porcentagem, temas comparados, verbetes abertos, fontes conferidas, trilhas, estante e conquistas. As telas emitem eventos de estudo (`features/estudo/eventos.ts`) e a Moldura grava por Server Action; abrir um conteúdo registra a leitura, a rolagem atualiza a porcentagem e o fim do texto marca como lida.
- **Níveis por assunto** (Sala ou tema): Iniciante → Intermediário com metade dos conteúdos lidos → Avançado com todos. **Conquistas**: Porta aberta, Cinco Salas, Lado a lado, Na fonte, Vocabulário, Com as fontes, Degrau III; Toast “Conquista: X.”. Sem pontos, sem nível global, sem comparação entre pessoas.
- **Recomendação**: interesses primeiro, convicção só como desempate, e sempre uma Sala e um conteúdo “Para ampliar o olhar” fora do perfil declarado.
- **Destaques (`/destaques`)**: vitrine editorial com duas lógicas. A escolha da curadoria (vídeo principal, quatro cards e cinco artigos) vem das vagas em `/admin/destaques`, guardadas na tabela `destaques`; regras puras em `features/destaques/vagas.ts` (sem repetição na página; vaga vazia ou com item despublicado vira automática e recebe o publicado mais recente). A lista "Mais pesquisados" é ranking de conteúdo, nunca de pessoas, a partir das buscas dos últimos 30 dias (`features/destaques/ranking.ts`; o registro de buscas ainda não existe, então vale a ordem de publicação). Peças: `CardConteudoVitrine` (modo destaque compacto do Card de conteúdo) e `ListaDestaques`.
- **Anúncios**: nenhum por ora (entram com anunciantes reais e aprovação da curadoria); episódios em destaque em `data/referencia/banner.ts`; trilhas em `data/referencia/trilhas.ts`.
- **Imagens**: `server/imagens.ts` usa a foto de `public/imagens/` quando o arquivo existe e cai na placa da marca quando não.

## Divergências do DRS v1 (levar ao documento)

| Requisito | Antes | Agora |
| --- | --- | --- |
| RF-01 e RF-05 | Cadastro opcional; visitante acessava tudo | Cadastro obrigatório. O ator “Visitante” deixa de existir no portal e a Jornada 7.2 começa pelo cadastro ou pela entrada |
| RF-07 | Tradições de interesse no formulário de cadastro | Interesses (temas e Salas) e religião ou convicção passaram para o onboarding; continuam opcionais, privados e editáveis, com consentimento específico para a convicção (LGPD art. 11, RNF-LEG-02/03) |
| RF-24 | Sem ranking, pontuação ou gamificação | Adendo: são permitidos níveis privados de conhecimento por assunto (contados em leituras) e conquistas de estudo, desligáveis em Ajustes. Continuam vedados pontos, nível global, placar, perfil público e comparação entre pessoas (RNF-DOM-05) |
| Publicidade | No roadmap, fora do MVP | Entrou no MVP: banner rotativo e anúncio dentro do painel de progresso do Portal, sempre com “Publicidade”, anunciante e “Por que estou vendo isto?”; curadoria editorial, sem charlatanismo, promessa de cura, manipulação religiosa ou urgência; nunca na grade comparativa, nas respostas do assistente ou na leitura |
| Papéis e autoria | Membro e administrador; conteúdo só da curadoria, autoria em texto, sem página de perfil | Terceiro papel, o anfitrião: escreve nas próprias Salas, com revisão obrigatória da curadoria e selo “Anfitrião · revisado pela curadoria”. Ganha página pública de autor (`/anfitrioes/[slug]`), com avatar opcional enviado por ele (exceção documentada no Avatar). Perfis de leitores continuam inexistentes e vale RNF-DOM-05 (sem ranking de pessoas) |

## Curadoria (`/admin`)

| Rota | O que é | Requisitos |
| --- | --- | --- |
| `/admin` | Painel: totais por Sala, status e proveniência, vídeos por Sala, pendências, rascunhos parados há mais de 14 dias e últimas ações | RF-37, RNF-DOM-05 |
| `/admin/artigos` · `/novo` · `/[id]` | Lista com busca, filtros, ordenação, paginação e ações em linha; formulário em seções com checklist, salvamento automático do rascunho e aba Histórico | RF-11 a RF-13, RF-15, RNF-DOM-01, RNF-DOM-03, RNF-DOM-04 |
| `/admin/artigos/[id]/previa` | "Pré-visualizar como buscador": a página pública do conteúdo, com aviso fixo | RF-11 |
| `/admin/videos` · `/novo` · `/[id]` | Vídeos do canal: URL do YouTube validada (watch, youtu.be, shorts), duração mm:ss, ligação a artigos da mesma Sala | RF-16 |
| `/admin/fontes` · `/novo` · `/[id]` | Fontes bibliográficas; "onde é usada"; exclusão bloqueada se citada por conteúdo publicado | RNF-DOM-01 |
| `/admin/historico` | Histórico de auditoria com filtros; só leitura | RNF-04 |
| `/admin/exportar/[artigos\|videos\|fontes]` | CSV em UTF-8 com BOM, `;`, cabeçalhos em português, respeitando os filtros | RF-38, RNF-LEG-01/02 |

**Acesso.** Além da checagem geral do proxy, `app/admin/layout.tsx` confere o papel (sem sessão vai para `/entrar` com a volta preservada; membro vê "Acesso restrito") e cada Server Action e Route Handler, que chama `exigirAdmin()` (`src/server/sessao.ts`).

**Ciclo de publicação.** Rascunho → publicado → arquivado. Publicar, despublicar e arquivar pedem confirmação com o impacto; arquivar não apaga e todo arquivado pode ser restaurado. O botão Publicar fica bloqueado (`aria-disabled`) enquanto o checklist tiver pendência; acionado, mostra os erros por campo e leva o foco ao primeiro. O servidor confere o checklist de novo. Rascunhos são salvos sozinhos; item publicado só muda com "Salvar alterações", porque o portal atualiza na mesma hora.

**Regras** (funções puras e testadas em `src/features/admin/regras/`): `slug.ts`, `youtube.ts`, `checklist.ts` (uma regra por item, com o ID do requisito), `voz.ts` (expressões de verdade absoluta ou tom de conversão; edite a lista `EXPRESSOES_DE_VOZ`), `csv.ts` e `config.ts` (limite do trecho permitido, dias para rascunho parado, tamanhos).

## Anfitriões

Terceiro papel: o anfitrião mantém Salas próprias e escreve artigos nelas; nada vai ao ar sem a aprovação da curadoria, que só julga (aprova ou reprova com motivo) e nunca edita o conteúdo.

| Onde | O que é |
| --- | --- |
| `/ajustes` | “Quero ser anfitrião”: candidatura (uma pendente por vez; a recusa traz o motivo e permite reenviar) |
| `/cadastro?convite=…` | cadastro pelo convite (7 dias, uso único): a conta nasce anfitriã, com o e-mail do convite |
| `/anfitriao` | painel (indicadores, novidades não vistas, Salas), Sala (nova e existente), artigo (novo e existente, com prévia) e perfil público. Item “Minhas Salas” na lateral, com o contador de novidades |
| `/anfitrioes/[slug]` | página pública do anfitrião, com as Salas dele no ar |
| `/admin/anfitrioes` | revisão em três níveis: anfitriões (quem espera há mais tempo primeiro) › Salas › Sala em revisão (prévia de cada artigo, aprovar ou reprovar Sala e artigo, “Incluir na comparação e no assistente”) |
| `/admin/usuarios` | contas (promover, tirar o papel com manter congelado, despublicar tudo ou transferir), candidaturas e convites |
| `/admin/caixa-saida` | e-mails registrados (tabela `emails_enviados`; `enviarEmail()` em `server/caixa-saida.ts` está pronta para um serviço real) |

- **Ciclo** (`features/anfitriao/regras/ciclo.ts`): rascunho → em revisão → publicado ou reprovado (motivo de pelo menos 20 caracteres). Editar algo publicado tira do ar até a nova aprovação; o salvamento automático nunca faz isso. Só se exclui o que nunca foi publicado.
- **Visibilidade** (`regras/visibilidade.ts`): Sala de anfitrião aparece se, e só se, está publicada e tem pelo menos um artigo publicado. `/salas` mostra “Salas da curadoria” e “Salas de anfitriões”.
- **Comparação e assistente:** a Sala de anfitrião só entra na grade (`respostasDeAnfitrioes` em `features/busca/busca.ts`) e no conjunto de leituras elegíveis ao futuro assistente (registro de leituras publicadas; o motor legado em `features/assistente/motor.ts` é usado apenas em testes) quando a curadoria liga `naComparacao`.
- **Imagens:** `POST /midia` (só anfitrião; JPEG, PNG ou WebP até 5 MB, conferidos pelos magic bytes) e `GET /midia/[id]`. O envio exige o aceite de direitos, registrado com nome e data.
- **Fontes propostas:** o anfitrião cadastra uma fonte nova; só ele a vê até o artigo ser aprovado, quando ela entra no catálogo.
- **Servidor:** `server/anfitriao/` (`editorial.ts` lado do anfitrião, `revisao.ts` decisões da curadoria, `usuarios.ts` papéis, candidaturas, convites e perfil, `consultas.ts` leitura, `acoes.ts` e `acoes-admin.ts` Server Actions que conferem papel e posse).

## Persistência

Diagrama: [`../docs/banco/diagrama.md`](../docs/banco/diagrama.md). Cada módulo em `src/modules/<módulo>/` segue controller → caso de uso → repositório (interface) com contratos:

| Módulo | Contratos | Persistência | Casos de uso | Entrada |
| --- | --- | --- | --- | --- |
| `conta` | `conta.contratos.ts` (`Membro`, `ContaRepositorio`, `SessaoRepositorio`) | `conta.repositorio.ts`, `conta.schema.ts` | `casos-de-uso/` (autenticar, registrar, sessão, preferências, papel), ligados em `index.ts` | `conta.controller.ts`, usado pelas Server Actions (`features/auth/acoes.ts`) e por `app/api/conta/*` |
| `acervo` | `acervo.contratos.ts` (`AcervoRepositorio`, `Gravacao`) | `acervo.repositorio.ts`, `acervo.schema.ts`, `semente.ts` | as regras de `src/server/admin/` e `src/server/anfitriao/` | Server Actions de `server/admin/acoes.ts`, `server/anfitriao/acoes*.ts` |
| `midia` | `midia.contratos.ts` (`ArmazenamentoDeArquivos`) | `armazenamento.s3.ts`, `midia.schema.ts` | `server/midia.ts` | `app/midia/route.ts`, `app/midia/[id]/route.ts` |
| `anfitriao`, `estudo`, `comunidade`, `operacao` | tipos de `data/types.ts` | `*.schema.ts` | `server/anfitriao`, `server/progresso.ts`, `server/auditoria.ts`, `server/caixa-saida.ts` | Server Actions |

- **Snapshot do acervo** (`src/server/store.ts`): as regras leem e escrevem Maps síncronos carregados do Postgres; cada `set`/`delete` vira uma gravação em fila, na ordem em que aconteceu, e as Server Actions esperam a fila (`aguardarGravacoes`) antes de responder. Toda gravação soma 1 em `versao_dados`; no começo de cada pedido (`membroAtual` em `server/sessao.ts`) o processo compara a versão e recarrega se outra instância gravou. `src/instrumentation.ts` carrega o snapshot ao subir. Limite conhecido: o acervo inteiro fica na memória de cada instância (bom para alguns milhares de itens).
- **Contas** não passam pelo snapshot: senha em bcrypt (custo 12), sessão com token aleatório no cookie httpOnly e só o hash sha256 no banco, validade de 30 dias. Recuperação de senha por link de uso único (30 minutos, só o hash no banco), que encerra as outras sessões.
- **Driver**: `pg` (node-postgres), que nunca manda duas consultas na mesma conexão. Todas as tabelas têm RLS ligado e nenhuma policy, para a API pública do Supabase não ler nada.
- `src/data/repositorio.ts` é a leitura pública: só sai o que está com status `publicado` (Salas, página do conteúdo, busca, contadores e nível predominante).
- `src/server/admin/consultas.ts` (leitura editorial), `editorial.ts` (regras de escrita) e `acoes.ts` (Server Actions finas que conferem o papel e chamam `revalidatePath("/", "layout")`).
- `src/server/auditoria.ts` só acrescenta registros congelados; não existe função para editar ou apagar.
- Temas, glossário, comparações curadas, trilhas, episódios do banner e respostas do assistente são conteúdo editorial em código (`src/data/referencia/`), lido por `src/data/catalogo.ts`; entram no banco quando ganharem tela de edição. As Salas vêm do store por um registro (`instalarRegistroSalas`). Conteúdos novos da curadoria aparecem na Sala, na página e na busca, mas **ainda não entram na grade comparativa nem no assistente** (há uma nota no painel); as Salas de anfitrião entram quando a curadoria liga a comparação.


## Homologação

- Banco e imagens no Supabase (projeto `sala-dos-buscadores-homolog`, São Paulo); site na Vercel (projeto `sala-dos-buscadores`, `https://sala-dos-buscadores.vercel.app`, funções em `gru1` por `vercel.json`). O projeto da Vercel usa `portal` como diretório raiz e sobe o repositório inteiro, porque o `prebuild` confere `../design-system`; o `.vercelignore` da raiz deixa de fora os `.env*` e o material de referência.
- Variáveis locais só em `portal/.env.local` (fora do Git); o site usa as variáveis cadastradas na Vercel. `DATABASE_URL` aponta para o pooler em modo transação (porta 6543); o modo sessão (5432) aceita só 15 clientes e esgota com as instâncias da Vercel.
- Seed: `npm run db:seed`, que lê o `.env.local`. Deploy: `vercel deploy --prod` na raiz do repositório.

## Estrutura

```
src/
  app/                 rotas (App Router)
    (app)/             com sessão e moldura: / (Portal), /salas, /salas/[slug], /salas/[slug]/[conteudo],
                       /comparar, /assistente, /destaques, /biblioteca, /trilhas, /estante, /ajustes, /sobre
    (conta)/           sem sessão: /entrar, /cadastro, /recuperar-senha
    admin/             curadoria (papel de administrador)
  components/ds/       peças da biblioteca em React: emitem as mesmas classes sdb-* dos exemplos
  components/layout/   moldura, navegação (regras testadas), rodapé, providers
  features/            acervo, busca (lógica pura + UI + painel), assistente (contrato de integração + UI), auth, onboarding,
                       aparencia, admin (regras + telas da curadoria)
  data/                tipos, rótulos, catálogo, repositório público, referencia/ (conteúdo editorial em código)
                       e semente/ (acervo oficial importado pelo db:seed)
  modules/             persistência por módulo: contratos, schema Drizzle, repositório Postgres, casos de uso, controller
  server/              snapshot do acervo, sessão (DAL), auditoria e as regras da curadoria e dos anfitriões
  design-system/       CÓPIA GERADA de ../design-system (não edite aqui)
  lib/                 utilitários de texto e classes
```

Testes unitários e de componente ficam ao lado do código (`*.test.ts(x)`).

## Design system

- O [guia da biblioteca React](src/components/ds/README.md) reúne os componentes, as variantes e os exemplos de uso alinhados a `../design-system/components`.
- A fonte da verdade é `../design-system`. Mude lá e rode `npm run ds:sync`; o `build` falha se a cópia divergir.
- `tokens.css` e `bundle.css` entram no layout raiz, sem camada. O Tailwind entra **sem preflight** e só com tema e utilitários (`src/app/globals.css`), com espaçamento, cores e fontes mapeados para os tokens.
- Tailwind é para layout de elementos de estrutura. Numa peça `sdb-*`, a classe da biblioteca vence o utilitário; quando o exemplo da biblioteca usa um ajuste em linha (`style="gap:8px"`), o componente repete o mesmo ajuste.
- `bundle.js` não é carregado: seus comportamentos foram portados para React (`Segmented`, `Accordion`, `Menu`, `Drawer`, `Toast`, `useCopiar`), e os ícones são gerados dele em `icons.generated.ts`.

## Dados iniciais

O acervo oficial vem de `src/data/semente/` pelo `npm run db:seed`. A tela e o mini chat usam `/api/assistente`, que responde com o Grok (xAI, `grok-4.7`) a partir do acervo publicado quando `XAI_API_KEY` está definida, e informa indisponibilidade sem ela. Obras e referências citadas são reais; os artigos do acervo inicial são assinados pela equipe editorial de cada Sala.

## Fora desta etapa

- No portal: o Portal novo (Fase C) e as versões funcionais de Destaques, Biblioteca, Trilhas, Estante e Ajustes (Fase D), marcados com `TODO(redesign)`; notificações (`TODO(notificacoes)`); comentários/comunidade (`TODO(comunidade)`); qualquer ranking entre pessoas continua vedado (RNF-DOM-05).
- Na curadoria (`src/features/admin/ui/CascaCuradoria.tsx` e `src/data/catalogo.ts`): edição de Salas e temas (`TODO(admin-salas)`), glossário (`TODO(admin-glossario)`), usuários e papéis, RF-08 (`TODO(admin-usuarios)`), moderação (`TODO(admin-moderacao)`), comparações e respostas do assistente (`TODO(admin-comparacoes)`). Nenhum upload de arquivo binário.

### Home · Retomar e descobrir (26/10/2026)

A rota `/` mantém o modelo autenticado em `server/estudo.ts`. `PortalCliente`
compõe banner, indicadores, retomada, sugestões únicas, Salas, perguntas e
novidades; apoio e publicidade vêm depois do estudo na ordem do DOM. O nível de
“Seu caminho” reutiliza o cálculo da lateral. Sem retomada, há início honesto;
sem sugestões ou anúncio, nenhum item é fabricado. Os estilos estão na origem
do DS (`PortalInicio`, `bundle.css`), sincronizados por `ds:sync`.
Capturas, medidas e decisões: `../artifacts/home-2026-10-26/LEIA-ME.md`.


## Assistente do acervo · tela aprovada em 27/10/2026

`/assistente` integra `TelaAssistente` à moldura existente, com tema escuro local, fontes General Sans/Gambetta, modos Explorar/Comparar/Leitura guiada e Salas publicadas. `?pergunta=`, `?escopo=`, `?modo=` e `?orb=gold|dark` preparam contexto editável. Não alteram dados do acervo nem o tema salvo da conta. A navegação, a busca e a conta são as da moldura; não há uma segunda sidebar ou tabbar.

`components/ds/EsferaAssistente.tsx` usa os renderizadores originais do DS, copiados por `ds:sync`. Eles suspendem frames com pausa, movimento reduzido, aba oculta e fora da tela, mantêm fallback CSS e liberam os recursos ao desmontar. A troca de aparência não reinicia a conversa ou o rascunho. `Nova conversa` preserva modo, Sala, aparência e pausa. Enter envia apenas em desktop com ponteiro fino; no celular e durante IME não envia.

O `ConversaProvider` compartilha a conversa em memória com o mini chat e invalida respostas atrasadas após interrupção/nova conversa. Não existe histórico persistente. O endpoint `POST /api/assistente` confere sessão e valida texto (1–2.000 caracteres), modo e Sala visível. O transporte é `features/assistente/servico.ts`; o ponto de integração server-only é `server/assistente.ts` (`ServicoAssistente`). Sem provedor configurado, retorna HTTP 503 com aviso explícito e não gera respostas ou referências. O futuro adaptador deve recuperar apenas fontes publicadas/elegíveis, retornar `ResultadoAssistente` e respeitar `AbortSignal`. Ainda faltam o provedor/RAG e a persistência por conta; nenhuma credencial nova foi criada ou exigida nesta implementação.

O diálogo de fontes e a cópia usam exclusivamente os trechos e as referências retornados pela IA.
