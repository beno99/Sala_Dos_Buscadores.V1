# C08 — vídeos, miniaturas e vínculo com artigos

## Causas confirmadas

- `CardVideo` usava somente `video.imagem` ou a placa: o ID do YouTube nunca gerava uma miniatura. O parser não aceitava `embed` e aceitava credenciais/porta ou segmentos extras em alguns links.
- O vínculo já era salvo em `VideoEditorial.artigos` por ID e projetado em slugs atuais pelo repositório público. A prévia administrativa, porém, consultava apenas o conjunto público e não mostrava rascunhos ligados.
- A seleção não tinha busca, data de criação, ordenação recente, paginação nem atualização. A gravação eliminava silenciosamente referências não encontradas na Sala.
- `salvarVideo` não recusava salvamento automático de um vídeo publicado no servidor, embora o editor já evitasse essa operação.

## Implementação

- Parser aceita watch, youtu.be, shorts e embed, incluindo youtube-nocookie para embed; valida domínio exato, ID de 11 caracteres, protocolo e ausência de credenciais/porta. Miniaturas usam somente URLs construídas em `i.ytimg.com`.
- Loader cancelável: maxres → hq → mq, com fallback para placa em erro ou placeholder de 120 px; timeout por tentativa, mensagem de carregamento/erro e retry explícito na prévia. Mudança de ID invalida callbacks antigos. Alt usa apenas o título conhecido.
- Seletor reutilizado pelo editor: criação decrescente e ID como desempate; 10 iniciais, busca em todo o conjunto, carregar mais, status/Sala/data, checkbox nativo e contador. Busca e atualização preservam IDs selecionados. Atualizar usa Server Action autenticada como administrador, sem revalidação que remonte o editor.
- Servidor deduplica IDs e recusa nova referência inelegível, de outra Sala ou de anfitrião. Associação previamente arquivada permanece até desmarcação expressa; desmarcar remove apenas a associação. Campos existentes não editados são preservados. Nenhuma mudança de schema.
- Preview administrativa exige administrador explicitamente e inclui vídeos ligados ativos de qualquer status, por ID e mesma Sala. A consulta pública permanece restrita a vídeo e artigo publicados em Sala visível; mudar o slug do artigo mantém o vínculo.
- Publicado só muda por salvamento manual. Salvar rascunho, selecionar artigo ou carregar thumbnail não publica nada.

## Matriz de salvamento/publicação

| Situação | Pode salvar | Para publicar/exibir no portal |
| --- | --- | --- |
| Novo rascunho | Sala oficial existente e título; URL/duração podem ficar vazias | Sala, título, tema, nível, URL YouTube válida e duração mm:ss válida; ação Publicar expressa |
| URL/duração preenchidas inválidas | Não; erro de campo | Corrigir o campo |
| Sem artigos ligados | Sim | Vídeo aparece somente na Sala; vínculo é opcional |
| Artigo rascunho ligado | Sim, mesma Sala e elegível | Só aparece nos relacionados públicos quando artigo e vídeo estiverem publicados |
| Artigo arquivado antes de salvar edição | Vínculo antigo é preservado; não aceita novo vínculo arquivado | Oculto no público; pode remover somente a associação |
| Artigo fora da Sala/indisponível | Nova seleção recusada com erro recuperável | Atualizar lista e revisar seleção |
| Vídeo publicado | Apenas Salvar alterações/manual com checklist válido | Atualiza conteúdo publicado após confirmação existente |
| Vídeo arquivado | Não | Restaurar como rascunho antes de editar |
| Falha no thumbnail | Sim, sem alterar URL/arquivo original | Placa da marca e retry na prévia; falha de rede não altera publicação |

## Validação executada

- `npx tsc --noEmit`: passou.
- Dez testes Node/tsx isolados: parser, domínios falsos, ordem/busca, elegibilidade, persistência por ID, deduplicação, remoção de associação sem apagar artigo, rascunho vs público/preview, alteração de slug, bloqueio de automático publicado, manual explícito, preservação de vínculo arquivado e recusa de outra Sala.
- Loader: fallback em erro/placeholder, erro total, retry e descarte de callback após cancelamento.
- Chrome com os componentes React reais e dados em memória, sem login ou banco: thumbnail live `dQw4w9WgXcQ` carregada em 1280 px; atraso A→B descartou A; maxres/hq falharam e mq carregou; erro total seguido de retry carregou.
- Seletor no Chrome: 10 de 25 iniciais, busca encontrou Artigo 01 fora da primeira página, carregar mais mostrou 20; seleções `a25`/`a01` preservadas após erro e retry que adicionou artigo novo. Desktop 1000 px e celular 390 px sem overflow ou erros de execução. A inspeção visual identificou ISO cru na data; corrigido para data pt-BR e capturas refeitas.

Comando dos testes sem banco:

```sh
cd portal
node --conditions=react-server --import tsx --test tests/videos.test.ts src/features/admin/regras/{youtube,vinculos-video,miniatura-video}.test.ts
```

Harness do navegador: `portal/tests/videos.browser.cjs`. Requer Chrome e Playwright disponível; `PLAYWRIGHT_MODULE` pode apontar a instalação existente. Ele compila somente os componentes usados com esbuild e usa `page.setContent`; nunca inicia o portal nem chama Server Actions reais.

Evidências em `docs/evidencias-2026-10-31/`: `videos-browser-resultados.json`, `video-antes-link.png`, `video-depois-link.png`, `video-seletor-desktop.png`, `video-seletor-mobile.png`. “Antes/depois” compara o campo vazio e o link preenchido no ensaio isolado, sem alegar captura histórica de produção.

## Conferência manual restante

- Na revisão integrada final, abrir um vídeo já existente em uma conta administradora, conferir o carregamento e a seleção sem alterar dados. Para testar salvar/publicar ponta a ponta, usar somente ambiente de teste e dados isolados.
- A execução de `npm run check`, build/sync do design system e revisão integrada pertencem à coordenação; não foram disparados por este trabalho paralelo. Fonte DS alterada: CardVideo CSS, README e preview; os derivados serão sincronizados juntos.
- Nenhum banco real foi alterado, nenhum conteúdo foi publicado, nenhuma API do YouTube foi usada e nenhum arquivo de imagem original foi sobrescrito.

## Fechamento integrado

Consulte o [relatório final](revisoes-2026-10-31.md) para checks, capturas e limitações consolidados. O build/sync do DS, contraste, check e build do portal passaram após integração. Os harnesses de navegador foram preservados em `portal/tests/*.browser.cjs`, sem caminhos pessoais fixos; comparações históricas usam `78355fb`.
