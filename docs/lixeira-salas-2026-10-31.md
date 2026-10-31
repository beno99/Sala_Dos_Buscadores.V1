# Lixeira de Salas — 31/10/2026

Implementação da opção escolhida pelo responsável: exclusão reversível, com restauração exclusiva pela curadoria. Base Git `318237a`. Após a validação local, o responsável solicitou o envio das alterações ao Git; a implantação do código segue o fluxo do projeto.

## Comportamento

- Anfitrião: **Excluir Sala** na lista `/anfitriao` e no editor. Só as próprias Salas; permitido também após publicação, em revisão ou arquivamento.
- Administrador/curador: exclui qualquer Sala, oficial ou de anfitrião, pela lista `/admin/salas`, cabeçalho/editor ou revisão de anfitriões.
- Curador: abre **Lixeira de Salas** em `/admin/lixeira/salas` e confirma a restauração. Não existe esvaziamento/exclusão definitiva.
- A confirmação explica o impacto. Cancelar/Escape não altera dados; o foco volta ao botão. O diálogo é montado no body para não ficar cortado pela tabela no celular. Erro mantém a confirmação aberta para nova tentativa; pedidos repetidos não duplicam a operação.
- Sala e conteúdos saem do catálogo público, buscas, destaques, conversas e listas editoriais. Artigos, vídeos, citações, conversas, comentários, fontes, mídias, progresso e vínculos permanecem guardados. O slug continua reservado.
- Restaurar conserva os estados: publicado pode voltar ao portal; rascunho permanece rascunho; arquivado permanece arquivado. O diálogo informa essa consequência.
- Arquivar continua sendo uma ação diferente. A restauração comum de arquivamento não retira uma Sala da lixeira.

## Integridade e permissões

`SalaEditorial.lixeira` guarda data e ID de quem excluiu, sem trocar o status editorial. Server Actions obtêm a conta pela sessão; a regra confere papel e posse no caso de uso e novamente na transação que bloqueia a linha da Sala. Exclusão/restauração e auditoria são gravadas juntas. Falha na auditoria desfaz a alteração inteira.

O repositório recusa exclusão física de Sala e gravações tardias em Salas/conteúdos na lixeira, inclusive tentativa de mover um conteúdo para outra Sala. O salvamento antigo não limpa a marca. Editor, prévia, revisão e publicação também verificam a Sala no servidor.

Alterações de perfil e gestão de conteúdo ao rebaixar/transferir anfitriões ignoram os registros congelados na lixeira. Restaure primeiro se precisar incluí-los nessa gestão; isso evita que uma mudança de perfil falhe tentando regravar conteúdo excluído.

## Arquivos principais

- `portal/src/features/salas/lixeira.ts`: regra de permissão e plano da operação.
- `portal/src/server/salas/{acoes,lixeira}.ts`: sessão, ações e consulta da lixeira.
- `portal/src/modules/acervo/{acervo.schema,acervo.contratos,acervo.repositorio}.ts` e `server/store.ts`: persistência, transação, proteção de gravações e snapshot.
- `portal/src/features/salas/AcaoLixeiraSala.tsx`: confirmação compartilhada.
- `portal/src/features/admin/ui/salas/LixeiraSalas.tsx` e `app/admin/lixeira/salas/page.tsx`: tela do curador.
- Listas e editores de Salas; consultas, sessão, revisão, gestão de anfitriões e visibilidade pública: integração e filtros.
- [Manual de operação](manual-operacao.md), `portal/README.md` e `CLAUDE.md`: instruções atualizadas.

Componentes e estilos existentes do Design System foram reutilizados. Nenhum token, CSS gerado ou fonte canônica do DS foi alterado nesta etapa.

## Verificações executadas

- `npm run db:generate`: gerou a migração aditiva.
- `npm run check`: sincronia DS, 10 testes de marcação, Biome e TypeScript passaram.
- `npm run test:editorial` com PGlite isolado: **32 passaram, nenhum falhou ou foi ignorado**. Inclui posse, curador em todas as origens, cinco estados editoriais, exclusão/restauração após recarregar, conservação dos registros, duplicidade, bloqueio de aba antiga e atualização de perfil.
- Teste SQL com o repositório real em PGlite: preservação de FK/citação, recusa de gravação e movimento atrasados, recusa de exclusão física, restauração apenas por administrador e rollback quando a auditoria falha. Não equivale a um ensaio de contenção entre sessões PostgreSQL independentes.
- `npm run build`: passou.
- `portal/tests/lixeira.browser.cjs`: Chrome, componentes reais com ações substituídas por fixtures, em 390 e 1440 px. Confirmação, foco seguro, ciclo de Tab, Escape/retorno de foco, erro/retry, cliques repetidos e ausência de overflow passaram.
- `git diff --check`: passou. Servidor reiniciado em `http://localhost:3000`; login HTTP 200 e rota da lixeira sem sessão HTTP 307 para autenticação.

Capturas de dados controlados, sem contas reais: [anfitrião no celular](evidencias-lixeira/host-390.png), [confirmação no celular](evidencias-lixeira/host-confirmacao-390.png), [lixeira desktop](evidencias-lixeira/curador-1440.png), [restauração no celular](evidencias-lixeira/curador-confirmacao-390.png). [Resultados do navegador](evidencias-lixeira/resultados.json). As fixtures usam fallbacks de fontes e não representam uma sessão autenticada completa contra o banco conectado. Nenhuma Sala real foi excluída/restaurada para produzir as capturas.

## Migração e implantação

`portal/drizzle/0006_salas_lixeira.sql` contém apenas:

```sql
ALTER TABLE "salas" ADD COLUMN "lixeira" jsonb;
```

Foi aplicada ao banco configurado no `.env` deste ambiente após conferir que somente essa migração estava pendente. O histórico passou de seis para sete migrações. A consulta posterior confirmou **zero Salas na lixeira**: não houve exclusão nem alteração dos valores editoriais existentes. Não foram executados seeds, exclusão de arquivos ou testes de escrita de conteúdo nesse banco.

Em outro ambiente, aplicar as migrações pelo fluxo habitual **antes** de iniciar este código, preservando os backups operacionais do banco e armazenamento. Não há nova variável de ambiente nem dependência de produção.

**Reversão:** manter a coluna é seguro e evita perder a identificação da lixeira. Depois que houver Salas excluídas, não voltar a código que ignore essa coluna, pois ele poderia voltar a mostrar conteúdos excluídos. Manter o filtro de visibilidade no rollback ou, mediante decisão da curadoria, restaurar as Salas antes. Não remover a coluna nem limpar marcas como atalho de rollback. Os arquivos e conteúdos não precisam ser recuperados de backup para a restauração normal pela interface.
