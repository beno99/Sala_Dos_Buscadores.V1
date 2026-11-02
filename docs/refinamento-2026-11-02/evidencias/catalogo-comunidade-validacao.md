# Catálogo de vídeos e Comunidade — fixture local

02/11/2026. Dados explicitamente demonstrativos; nenhum usuário, sessão ou banco real. Componentes reais CatalogoVideos, FeedComunidade, CompositorPublicacao e componentes DS. CSS original do Design System; apenas reset neutro do host da fixture. Não houve modificação de produção ou de CSS/DS.

## Resultado

12 combinações em Chromium: 390, 768 e 1440 px; catálogo como Buscador e Comunidade como Buscador, Anfitrião e Curadoria. Sem erros JavaScript ou overflow horizontal. Capturas PNG nesta pasta; medidas e checks em `catalogo-comunidade-resultados.json`.

Catálogo: busca por título, filtro de Sala própria/do artigo vinculado, origem editorial, artigo, vídeo sem artigo, vazio e limpar filtros. Relação entre Salas não duplica o vídeo. Layouts revisados nas capturas, incluindo fallback neutro de miniatura.

Comunidade: somente Anfitrião/Curadoria recebem launcher; alternância Para você/Seguindo; busca com resultado vazio; compositor real percorre e envia os quatro tipos (Reflexão, Citação com fonte, Pergunta, Achado do acervo), validando obrigatórios e payload. Os 24 envios demonstrativos incluem videoId elegível; as ações são dublês locais. Vídeo público vinculado é renderizado pelo CardVideo real e oferece link externo ao YouTube.

Teste servidor `tests/comunidade-video.test.ts` usa operações reais e repositório de memória isolado: Buscador não cria, admin/host criam, videoId é preservado na gravação e projeção pública, vídeo em rascunho/arquivado, ID inexistente e Sala na lixeira são recusados. Conteúdos de teste são fictícios e não chegam ao banco.

## Limites

Não é E2E HTTP autenticado: ações de navegador, estante e toast foram isolados. O teste servidor cobre a autorização real por papel, sem prova dos cookies/rotas neste ensaio. Miniaturas externas foram indisponibilizadas para testar fallback; não foi verificada entrega real de imagens/YouTube, reprodução, mídia enviada por arquivo ou Storage. O vídeo atual é vínculo a registro publicado com abertura no YouTube, não upload/reprodução incorporada. O teste em memória não equivale à persistência PostgreSQL após reinício.

Comandos (em portal):

- `ESBUILD_MODULE=/tmp/portal-refino-tools/node_modules/esbuild PLAYWRIGHT_MODULE=/tmp/portal-refino-tools/node_modules/playwright node tests/catalogo-comunidade.browser.cjs`
- `npx tsx --conditions=react-server --test tests/comunidade-video.test.ts`

Arquivos de suporte: `tests/fixtures/catalogo-comunidade.tsx`, `tests/catalogo-comunidade.browser.cjs`. Nenhum defeito novo de produção comprovado nesta rodada; ajustes realizados somente na fixture de teste.

## Revalidação das fontes oficiais

Capturas regeneradas após corrigir o servidor local da fixture: HTML somente para navegação; arquivos .woff2 servidos pelo basename a partir de design-system/fonts com MIME font/woff2. Cada um dos 12 cenários carrega explicitamente General Sans e Gambetta, aguarda document.fonts.ready e verifica a face regular em estado loaded. O JSON registra famílias, resultado e estados; Gambetta itálica não usada permanece unloaded. Recursos externos e thumbnails são abortados explicitamente, permitindo o fallback DS sem devolver HTML como imagem. Os 12 cenários e 24 envios voltaram a passar, sem erros JavaScript ou overflow. Screenshots estabilizam animações antes da captura.
