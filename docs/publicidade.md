# Publicidade no Portal

O anfitrião acessa Minha publicidade pelo menu de Conta ou pelo Portal. A lista permite criar e reabrir anúncios. Endereços: `/anfitriao/publicidade`, `/anfitriao/publicidade/nova`, `/anfitriao/publicidade/[id]`.

Rascunhos aceitam campos incompletos e permanecem privados. Publicar valida imagem, descrição acessível, título, descrição, endereço e anunciante. A edição de uma peça publicada revalida todos os obrigatórios. Publicação direta pelo anfitrião é a regra solicitada para esta entrega; os textos da política foram alinhados com ela.

`CardPublicidade` é usado tanto no editor quanto no Portal. A imagem original é preservada e o enquadramento (posição horizontal, vertical e zoom) acompanha o anúncio em ambas as interfaces.

## Persistência e operação

A migração `0010_publicidade.sql` adiciona `publicidade_anuncios` e `publicidade_imagens`, com RLS habilitada e dono vinculado à conta. Use o processo existente de migração do projeto. Requer as mesmas variáveis DATABASE_URL e S3_* já usadas pelo Portal. O bucket precisa permanecer privado; os objetos de publicidade são servidos exclusivamente pela rota autenticada `/api/publicidade/imagens/[id]`.

O servidor verifica conta, papel, posse e versão dentro de uma transação. Colisões por versão são recusadas sem sobrescrever o anúncio. Os arquivos são conferidos por tamanho, assinatura e decodificação (Sharp, já usado pelo Next, agora dependência direta). A URL de mídia recusa acesso de terceiros a rascunhos e não permite cache compartilhado. Um anunciante rebaixado ou com conta não confirmada deixa de ter anúncios expostos.

Falhas de banco ou S3 produzem erro explícito; a interface não confirma publicação antes do commit. Objetos enviados e posteriormente substituídos ou abandonados podem permanecer no armazenamento, como ocorre com o fluxo de mídia existente. Uma rotina futura de retenção pode remover os órfãos sem afetar imagens ainda referenciadas.

## Verificação

Testes específicos: `node --import tsx --conditions=react-server --test tests/publicidade-*.test.ts`; renderização do card: `node --import tsx --test tests/publicidade-card.test.tsx`. O teste SQL usa PGLite isolado, com PGLITE_MODULE apontando para sua instalação e NODE_PATH incluindo o diretório de módulos. Sem PGLITE_MODULE ele é marcado como skipped, nunca como integração validada.

Nesta execução: 76 testes de domínio/SQL existentes e novos passaram (nenhum skipped), 4 testes SSR passaram, TypeScript e Biome dos arquivos alterados passaram, build Next de produção passou. A inspeção visual/interativa desktop e mobile não foi concluída: o serviço de controle do Chrome retornou timeout em duas tentativas. Ainda conferir seleção/arraste de arquivo, foco de erros, preview e enquadramento nos tamanhos reais antes de considerar a verificação visual encerrada.

## Integração da branch

Esta entrega foi isolada a partir de `f8b9737`, pois o checkout de trabalho recebeu alterações concorrentes no painel do anfitrião, nas rotas e na migração 0010. A migração desta branch não foi aplicada ao banco configurado. Ao integrar com o trabalho paralelo, reconciliar as rotas de anfitrião e regenerar a migração sobre o histórico final para evitar colisão de numeração. Não aplicar dois arquivos 0010 independentes sobre o mesmo histórico.
