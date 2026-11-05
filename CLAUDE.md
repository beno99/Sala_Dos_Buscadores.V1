# A Sala dos Buscadores · MVP

Portal de estudo que organiza tradições religiosas, espirituais, filosóficas e textos antigos em **Salas** (ex.: Biblioteca de Nag Hammadi, Corpus Hermeticum, O Caibalion, O Livro de Urântia), com busca comparativa por tema e um assistente de IA que consulta o próprio acervo.

Posicionamento: **curadora de museu, não pregadora**. Toda a interface e o conteúdo são em português do Brasil.

## Estrutura do repositório

```
portal/                    app Next.js 16 do MVP (ver portal/README.md)
design-system/             fonte da verdade do design system (ver design-system/README.md)
docs/
  manual-operacao.md       operação editorial: Sala, artigo, fonte, vídeo, anúncio
  banco/diagrama.md        diagrama do banco
  pendencias.md            decisões em aberto (não implementar por suposição)
  produto/                 documento de requisitos (.docx)
  historico/               relatórios de entregas já concluídas (sem evidências)
  imagens-originais/       originais das imagens do portal, fora do que é publicado
.github/workflows/deploy.yml   deploy na VPS a cada push na main
```

Não há Docker local nem testes de Vitest. Persistência em PostgreSQL no Supabase; imagens no Supabase Storage via S3.

## Comandos

Dentro de `portal/`:

- `bun run dev` — roda o portal (executa `ds:sync` antes).
- `bun run check` — sincronia do design system, testes `ds:test`, lint (Biome) e typecheck. **Obrigatório antes de concluir qualquer mudança no portal.**
- `bun run test:editorial` — testes `node:test` de regras editoriais e de Salas.
- `bun run ds:sync` — copia `design-system/` para `portal/src/design-system/`.
- `bun run db:generate` — gera migração após mudar um schema Drizzle.

Na raiz, após mudar o design system:

- `node design-system/scripts/build.mjs` (com `--check` só confere) — regenera `tokens.css`, exemplos e catálogo.
- `node design-system/scripts/contraste.mjs` — confere AA nos quatro temas.
- Depois, `bun run ds:sync` em `portal/`.

## Design system: obrigatório em toda tela

- Antes de criar ou mudar uma tela, leia `design-system/README.md`, `design-system/DIRETRIZES.md`, `design-system/MARCA.md`, o guia da peça (`design-system/components/<Nome>/README.md`) e copie a estrutura do exemplo (`design-system/exemplos/<Nome>.html`).
- Use **somente** a biblioteca: classes `sdb-*`, comportamentos por atributos `data-*`. Chame `SalaBuscadores.hydrate()` depois de inserir HTML dinâmico.
- Temas via `data-theme` no `<html>`: `solido-claro` (padrão, paleta areia), `solido-escuro`, `vidro-claro`, `vidro-escuro`. Nos sólidos o fundo é chapado; `.sdb-ambient` só acende brilho nos temas de vidro.
- **Nunca** escreva cores, fontes, raios, sombras ou curvas soltos. Use as variáveis dos tokens (`var(--label)`, `var(--radius-lg)`…).
- Peça ou variação nova: estenda o design system primeiro (`tokens.json`, `components/bundle.css`, guia e `preview.html` da peça), rode `build.mjs` e `contraste.mjs`, e avise o usuário que a versão publicada (https://claude.ai/artifact/1rSk2ixfmNQXjLu2AHBBJB) precisa ser atualizada.
- `portal/src/design-system/` é **cópia gerada**: nunca edite. O `build` falha se divergir. `components/refined-layout.css` é só do catálogo e não entra no portal.
- Componentes React em `portal/src/components/ds/` emitem as mesmas classes e atributos dos exemplos. Não reescreva o CSS nem invente estilos inline; ajuste em linha só quando o exemplo da biblioteca faz o mesmo.
- Tailwind entra sem preflight, só para layout de estrutura, com o tema mapeado para os tokens.
- Linguagem visual aprovada: Apple Human Interface Guidelines, tema Sólido claro com a paleta areia. Vidro só na camada flutuante (botão do assistente, barra superior ao rolar, barra de abas do celular). Botões e chips em cápsula; cantos contínuos; movimento com mola, interrompível. O estilo editorial de cantos retos foi rejeitado.
- Marca: o único símbolo é o arco com escada. Sem cristais, mandalas, lua, velas, fumaça, gradiente roxo ou símbolos de tradições. A fonte display-lower segue provisória (Fraunces), até o licenciamento de Hident.
- Para conferir visualmente: `design-system/catalogo.html` no navegador.

## Conteúdo e voz

- Precisa, serena, didática, firme. Nunca dogmática, sensacionalista, condescendente ou decorativa. Sem "desperte", "segredos revelados", urgência ou exclamações.
- Toda afirmação é atribuída a uma fonte ("Segundo o Poimandres…"); nunca "a verdade é…". Datas incertas ficam incertas.
- Todo conteúdo mostra o Selo de proveniência. Toda resposta da IA é identificada como IA, separa trecho documental, interpretação editorial e síntese, cita fontes e vem com o Aviso de neutralidade.
- A curadoria nunca dá Selo de proveniência a publicação da comunidade.
- Use conteúdo real do universo do projeto nos exemplos, nunca lorem ipsum. Sem dados fictícios no banco.

## Arquitetura do portal

- Next.js 16 (App Router, Turbopack, React Compiler, typed routes), TypeScript, Tailwind 4, Biome.
- Backend em `portal/src/modules/<módulo>/`: controller → caso de uso → repositório (interface), com contratos `*.contratos.ts`, schema Drizzle `*.schema.ts` e implementação Postgres `*.repositorio.ts`.
- Regras puras em `portal/src/features/<área>/regras/`, sem acesso a banco.
- **Acervo em snapshot**: `portal/src/server/store.ts` guarda o acervo em Maps. Escreva só por `set`/`delete` (nunca mutando o objeto guardado) e aguarde `aguardarGravacoes()` na Server Action.
- As telas leem só o que está publicado, por `portal/src/data/repositorio.ts`.
- Salas oficiais e de anfitriões vivem no store; o catálogo (`portal/src/data/catalogo.ts`) lê as visíveis.
- Slugs de Sala são gerados atomicamente no primeiro salvamento e permanecem estáveis.

## Acesso e papéis

- Cadastro obrigatório. Sem sessão, tudo vai para `/entrar` (proxy e checagem no layout `app/(app)`). Exceções: `/entrar`, `/cadastro` (inclusive o convite de anfitrião `/cadastro?convite=…`) e `/recuperar-senha`.
- Telas novas do app entram em `app/(app)`, dentro da moldura (lateral, barra superior, rodapé, botão do assistente).
- Conta com e-mail não confirmado não acessa o acervo autenticado.
- Destino padrão ao entrar: membro `/`, anfitrião `/anfitriao`, administrador `/admin`.
- Papéis:
  - `membro`: lê, comenta, reage, salva, segue, denuncia; pode se candidatar a anfitrião em `/ajustes`.
  - `anfitriao`: mantém as próprias Salas, artigos, vídeos e anúncios em `app/anfitriao`, com casca própria (`TopoAnfitriao` e `CascaAnfitriao`). Nada vai ao ar sem revisão da curadoria. Não acessa `/admin`.
  - `administrador`: curadoria em `/admin`. Publica direto nas Salas oficiais, revisa anfitriões sem editar o conteúdo deles, gerencia usuários, candidaturas e convites. Administrador e curador são o mesmo papel.
- **Toda Server Action confere papel e posse no servidor**: `exigirAnfitriao`, `exigirDonoDaSala`, `exigirDonoDoArtigo` em `portal/src/server/sessao.ts`.
- Interesses e religião ou convicção são perguntados no onboarding, sempre opcionais. A convicção só é salva com consentimento.

## Regras de domínio vigentes

- **Lixeira de Salas e artigos**: `SalaEditorial.lixeira` é exclusão reversível, independente do status editorial. Anfitrião exclui só as próprias Salas; administrador exclui qualquer uma. Todo artigo precisa ir à lixeira antes da Sala. Só o curador restaura ou exclui definitivamente, com recusa de dependências e auditoria. Leituras públicas excluem itens da lixeira; conteúdo, estado e slug permanecem guardados.
- **Nunca apagar por `Map.delete`.** Use `server/salas/lixeira.ts`, que confere permissão e persiste Sala + auditoria em transação com bloqueio de linha.
- **Escritas editoriais** usam versão esperada e transação. Em conflito, o rascunho local é preservado.
- **Auditoria** registra `atorId`. Registros antigos não são reatribuídos.
- **Vínculo artigo–vídeo** é muitos-para-muitos por ID; `videos.artigos` é a única fonte da relação, inclusive entre Salas. Anfitrião altera só o delta dos próprios artigos. Não restaurar a antiga restrição de mesma Sala.
- **Vídeos e anúncios de anfitrião** seguem rascunho → em revisão → publicado/reprovado. A curadoria aprova ou reprova em `/admin/anfitrioes/[contaId]` e não edita o conteúdo. Editar um anúncio no ar tira-o do ar até a nova aprovação. No Portal, anúncios publicados rodam de forma estável por pessoa e por dia.
- **Comunidade** (`app/(app)/comunidade`, moderação em `/admin/comunidade`): publicações são exclusivas de administrador e anfitrião. O anfitrião oculta comentários nas próprias Salas, com motivo. O administrador decide denúncias, oculta e restaura, sem editar texto. Escrita em `portal/src/server/comunidade/`: `acoes.ts` lê a sessão e `operacoes.ts` confere posse e papel. Novas publicações podem vincular vídeo publicado do acervo, sem upload binário.
- **Conversa anfitrião ↔ curadoria** (`/anfitriao/conversa`, `/admin/conversas`): tabela `mensagens_curadoria` só aceita inclusão, sem edição nem exclusão. Aviso por e-mail só quando a vez muda de lado. A tela atualiza a cada 15 s (sem WebSocket).
- **Jornada do Buscador** (`/jornada`): conclusão só declarada ("Marcar leitura como concluída", "Marcar vídeo como concluído"); rolar até o fim não conclui. Gemas e títulos concedidos nunca são retirados. Conteúdo próprio do anfitrião não gera crédito. Leituras anteriores à Jornada contam como "importadas". Critérios numéricos seguem pendentes (`docs/pendencias.md`).
- **Banner, card e topo** são finalidades independentes. **Tema global** e **aparência da esfera do assistente** são independentes.
- **Perfil**: foto sai 320×320 recortada no centro; capa até 2400 px; ambas em WebP (`SAIDA_POR_USO` em `server/midia.ts`).
- **Imagens**: só com direito de uso registrado. Imagens de anfitrião entram pelo Campo de imagem, com aceite de responsabilidade no envio.

## Banco e migrações

- Migrações aditivas em `portal/drizzle/`. Mudou um schema: `bun run db:generate`.
- **Não aplicar migrações em banco conectado** fora do fluxo controlado de entrega, com backup conforme a política do ambiente.
- **Não rodar seed** em ambiente com dados reais. **Não publicar fixtures** durante testes.
- Migrações aplicadas e registro de reversão: `docs/historico/refinamento-2026-11-02/migracoes-aplicadas.md`.
- Reversão: mantenha a leitura que respeita a lixeira; não remova colunas aditivas nem volte a código que ignore essa marca.
- Exclusão definitiva é irreversível por código. Exige backup operacional e a confirmação específica já prevista.

## Testes e validação

- Para ajustes, **não criar arquivos de teste novos**. Validar com `bun run check` e conferência no navegador.
- Testes existentes: `portal/tests/*.test.ts` e `src/features/admin/regras/*.test.ts` (`bun run test:editorial`); `design-system/components/BarraFormatacao/marcacao.test.mjs` (`bun run ds:test`).
- Harness de navegador em `portal/tests/*.browser.cjs`: usa Playwright e esbuild externos, pelas variáveis `PLAYWRIGHT_MODULE` e `ESBUILD_MODULE`. **Não roda no `bun run check`.** Gera capturas em pastas `evidencias/`, que estão no `.gitignore`.
- Testes SQL usam PGlite isolado (`PGLITE_MODULE`), nunca o `DATABASE_URL` do projeto.
- Homologação com sessões reais e dispositivos físicos ainda não foi feita (ver `docs/pendencias.md`).

## Repositório: regras de organização

- Não adicionar DOCX, PDF, PNG de evidência, logs ou prints à árvore. Documentos de produto vão para `docs/produto/`; registros de entrega, para `docs/historico/`.
- Moodboards e referências visuais não são versionados. Registre a referência em `design-system/MARCA.md`.
- Não commitar nem fazer push sem pedido explícito.
- `.env*` é ignorado. Nunca coloque valores reais no `.env.example`. Não exiba o conteúdo de `.env.local`.
- Antes de remover um arquivo, confirme por busca que nada o referencia (código, `package.json`, `.vercelignore`, docs).
