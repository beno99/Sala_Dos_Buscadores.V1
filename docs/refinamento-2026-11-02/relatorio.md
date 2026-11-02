# Refinamento do Portal — entrega local de 02/11/2026

> Atualização após a captura de erro enviada em 02/11: as migrações 0008 e 0009 foram aplicadas ao banco configurado. Login local voltou a responder HTTP 200. As referências abaixo a migrações pendentes descrevem a entrega inicial, anterior a essa correção. Veja [registro da aplicação](migracoes-aplicadas.md).

Base `b7a83ce`, branch `refinamento/portal-2026-11-02`. Referência principal: `Downloads/PORTAL/Orientacoes_Portal_Final.txt`, `Registro_Final.json` e referências visuais de anfitriões. O documento consolidado substitui instruções anteriores conflitantes; P05/landing permanece fora do lote.

Implementação dividida entre agentes de acesso, editorial, experiência e integridade, com revisão cruzada. Foram usados os agentes disponíveis nesta sessão. A revisão independente final não encontrou novo defeito crítico/alto/médio concreto no lote de conta + acervo, após as correções. O Design System foi alterado somente na origem e regenerado/sincronizado. Componentes mantêm classes, tokens, fontes e temas oficiais; não foi instalada biblioteca visual adicional.

## O que mudou

Home prioriza Salas e descoberta, preserva imagens inteiras no banner, separa ações da arte e apresenta prévia do feed existente. Catálogos `/videos` e `/anfitrioes` reutilizam dados elegíveis. Conteúdo de anfitrião recebe assinatura pública e detalhes dourados, mantendo autoria e procedência originais. Cards, títulos de leitura, imagens por finalidade, seletores, navegação móvel, indicadores e textos institucionais foram ajustados.

Novas publicações na Comunidade são restritas a Curadoria/Anfitrião no servidor e interface. Vídeo opcional vincula registro publicado do acervo. Relações artigo–vídeo podem ser editadas pelos dois lados, entre Salas, sem duplicação. Edições têm versão esperada; conflito preserva o rascunho local. Planos editoriais, referências e auditoria usam confirmação transacional por pedido. Promoção/rebaixamento e exclusão administrativa de contas foram integrados ao mesmo lote de seus efeitos no acervo; falha posterior reverte também papel, exclusão e cascatas de sessão/perfil. O ator e os alvos são rechecados no servidor, sem criar hierarquia nova de Curadoria. Lixeira de artigos antecede a Sala; somente Curadoria restaura e exclui definitivamente, recusando dependências em vez de apagá-las em cascata.

Confirmação de e-mail agora é requisito da sessão ativa. Correção de endereço, emissão/consumo de token e reenvio têm regras atômicas e feedback coerente. Destino padrão de login depende do papel. A aparência da esfera é independente do tema e não apaga conversa/rascunho.

## Status por ID

“Implementado/testado” abaixo limita-se aos ensaios descritos nesta entrega; não significa aceite em produção ou em dispositivo físico.

| ID | Estado |
| --- | --- |
| P01 | Implementado e testado em casos de uso; homologação HTTP por conta pendente |
| P02 | Proteção de concorrência e auditoria por conta implementadas; hierarquia/promoção de curadores pendente |
| P03 | Pendente de definição: participantes, retenção e operações do inbox |
| P04 | Matriz aplicada; interações legadas de Buscadores preservadas |
| P06 | Corrigido: duração nas variantes; cartões e autoria preservados |
| P07 | Corrigido: miniatura YouTube com cadeia de fallback no card da Sala |
| P08 | Preservado e testado: multitemas, seleção e rolagem interna |
| P09 | Corrigido: lista de fontes com altura limitada e rolagem, sem perda de seleção |
| P10 | Corrigido: H1 centralizado somente na coluna de leitura |
| P11 | Preservado e testado: multitemas de vídeos após salvar/reabrir |
| P12 | Implementado: relação única entre Salas pelos dois editores; CAS e transação |
| P13 | Inventário realizado; nenhuma exclusão sem decisão por ID |
| P14 | Corrigido: banner, card e topo independentes; sem reupload/mutação de arquivos |
| P15 | Implementado: prévia do feed, criação restrita e vídeo do acervo opcional |
| P16 | Pendente de definição: modelo e origem da agenda |
| P17 | Corrigido e testado: tema e aparência independentes; WebGL, pausa e fallback |
| P18 | Implementado e testado em SQL isolado: confirmação, correção, reenvio e expiração |
| P19 | Corrigido: foco/rolagem do Drawer; destinos compartilhados |
| P20 | Retirado link genérico incorreto; contatos oficiais aguardam endereços confirmados |
| P21 | Corrigido: margem de âncoras e foco nas seções; navegação autenticada real pendente |
| P22 | Inventário atual: zero itens de anfitrião em revisão; contagem/lista testadas com fixtures |
| P23 | Implementado: assinatura pública e detalhe dourado, sem trocar autoria original |
| P24 | Implementado: diretório de Anfitriões com Salas públicas, busca e paginação |
| P25 | Implementado: lixeira artigo → Sala, restauração e harddelete seguro pelo curador |
| P26 | Implementado: busca e filtros de contas por papel/situação |
| P27 | Implementado e testado: destino por papel e retorno interno seguro |
| P28 | Implementado: descoberta de Salas, banner íntegro e prévia de Comunidade |
| P29 | Implementado e testado em navegador: catálogo /videos com filtros e relações públicas |
| P30 | Parcial: Chrome em viewports desktop/tablet/mobile; dispositivos físicos e percurso real pendentes |
| P31 | Corrigido: interseção de visitas únicas com universo público elegível |
| P32 | Corrigido: texto distingue consulta do assistente de grade comparativa editorial |
| P33 | Corrigido: IDs de buscas administrativas gerados por instância |
| P34 | Corrigido: privacidade descreve dados e preferências reais |

## Matriz de papéis aplicada

| Operação | Buscador | Anfitrião | Curadoria |
| --- | --- | --- | --- |
| Acervo autenticado | Conta confirmada | Conta confirmada | Conta confirmada |
| Gestão de Salas/artigos | Não | Próprios; revisão antes de publicar | Oficiais; revisão de anfitriões sem substituir texto |
| Associar vídeos | Não | Vídeos públicos elegíveis aos próprios artigos | Registros elegíveis, inclusive entre Salas |
| Novo post | Não | Sim | Sim |
| Comentários/reações/seguir/salvar | Comportamento existente | Comportamento existente | Comportamento existente |
| Lixeira de artigo/Sala | Não | Próprios; artigo antes da Sala | Escopo global autorizado |
| Restaurar/excluir definitivamente | Não | Não | Sim, com guardas de dependências |
| Lista administrativa de usuários | Não | Não | Sim |

Não foram criadas contas, promovidos curadores, compartilhadas senhas ou alterada a matriz do curador principal. O documento deixa essa hierarquia pendente. Posts antigos de membros e suas ações de posse foram preservados; a nova regra impede criação, não apaga histórico.

## Diagnósticos e evidência

- **P06/P07/P14:** variante horizontal omitia duração; card de vídeo da Sala não usava a cadeia de miniaturas; projeção de Sala descartava imagemCard; fallbacks misturavam banner/card/topo. Corrigidos sem alterar os arquivos originais ou cadastros. `imagens-final.test.ts`, `videos.test.ts` e fixture de catálogo cobrem mapeamento/fallback; entrega real da imagem externa não foi ensaiada com YouTube.
- **P08/P09/P11/P12:** multitemas já existiam e foram preservados/testados. Lista de fontes não tinha limite de altura. Artigo não editava a relação e vídeo restringia à mesma Sala. Agora `videos.artigos` continua fonte única. Testes reais de caso de uso e SQL isolado verificam persistência, remoção de um vínculo mantendo os demais, posse A/B, referências indisponíveis e rollback.
- **P02/P25:** revisão detectou fila global de erros, planos multirregistro parcialmente confirmáveis e busca de referências de progresso pela chave errada. Foram introduzidos escopos por pedido, lote transacional/CAS e protocolo de locks de referências. Testes forçam falhas depois de UPDATEs e verificam rollback. Lixeira conserva conteúdo/slug e bloqueia dependências que usam ID e Sala/slug.
- **P18:** revisão encontrou feedback de reenvio incorreto, token de outra conta confundindo provider e retorno ao token inválido. Corrigidos e verificados por testes de conta, SQL e fixture de confirmação. Não foi enviado e-mail real.
- **P22:** [inventário somente leitura](salas-revisao.md) encontrou sete Salas e zero itens de anfitrião em revisão no ambiente atual. Não se converteram rascunhos. Fixture com duas Salas e dois artigos confirma quatro itens, depois dois ao excluir uma Sala da fila.
- **P13:** [inventário de fontes](fontes-revisao.md): 77 fontes, três títulos normalizados semelhantes, 13 sem vínculo em artigos. Esses critérios não provam cadastro indevido. Nenhuma fonte removida. Curadoria deve decidir por ID após conferir referência e usos.
- **P31:** contador bruto do histórico incluía Salas antigas/privadas/duplicadas; agora numerador, denominador e faltantes usam o mesmo universo elegível. Eventos antigos são preservados.

## Navegador e capturas

Chrome headless com componentes React reais e DS original, em 390, 768 e 1440 px. Fixtures identificam claramente dados demonstrativos e não se conectam ao banco nem usam conta real. Elas validam composição/interação local; não substituem E2E HTTP autenticado.

- Home: 0, 1, 3 e 7 Salas nas três larguras (12 combinações); quatro temas; título extenso, vazio, registro único, controles do banner por teclado, sem overflow e sem duplicação. Capturas [desktop](evidencias/home-fixture-1440-3-salas.png), [tablet](evidencias/home-fixture-768-3-salas.png), [mobile](evidencias/home-fixture-390-3-salas.png), [resultados](evidencias/home-fixture-resultados.json). Google Fonts externas são dispensadas nessa fixture; fallbacks dos tokens podem diferir do ambiente conectado. Gambetta local é servida pelo arquivo oficial.
- Comunidade e catálogo: 12 combinações por largura/papel; 24 envios locais dos quatro tipos, com seleções e requisitos condicionais. Fontes locais General Sans/Gambetta carregadas e verificadas. Capturas [Comunidade mobile](evidencias/comunidade-anfitriao-390.png), [compositor desktop](evidencias/comunidade-compositor-citacao-anfitriao-1440.png), [catálogo](evidencias/videos-membro-1440.png); [relatório e limites](evidencias/catalogo-comunidade-validacao.md).
- Assistente: WebGL disponível nas duas esferas; pausa suspende frames, movimento reduzido suspende frames, troca libera recursos gráficos, contexto/rascunho/conversa preservados. Três modos enviados pelo transporte real a endpoint local que devolve 503 controlado; erro conserva pergunta e retry não duplica turno. Capturas [desktop](evidencias/assistente-1440-inicio.png), [mobile](evidencias/assistente-390-inicio.png), [falha acessível](evidencias/assistente-390-erro.png), [resultados](evidencias/assistente-resultados.json). Isso não é consulta a IA real nem validação artística por GPU física.
- Drawer e esfera sem WebGL: fixture `experiencia.browser.cjs` confirma fallback, foco inicial em Portal, Escape e retorno ao gatilho, preferência de aparência após recarga, temas claro/escuro. Fixture `editorial-conflito.browser.cjs` verifica conflito preservando texto e suspendendo autosave. `conta-confirmacao.browser.cjs` verifica confirmação/reenvio com serviços isolados.

## Verificações executadas

- `node design-system/scripts/build.mjs`: passou; catálogo/exemplos regenerados.
- `node design-system/scripts/contraste.mjs`: passou, todos os pares de texto verificados AA (4,5:1) nos quatro temas.
- `npm run ds:sync`: passou.
- `npm run check`: passou (ds:check, testes de marcação do DS, Biome e Next typegen/TypeScript).
- `NODE_PATH=… PGLITE_MODULE=… npm run test:editorial`: **71 testes passaram, zero falhas e zero ignorados**, incluindo SQL isolado e aplicação das migrações locais.
- `npm run build`: passou, incluindo rotas novas e geração Next.
- `git diff --check`: passou.
- Fixtures Chrome home, catálogo/Comunidade, assistente, experiência, conflito editorial e confirmação: resultados específicos acima e nos relatórios. Sem produção alterada.

Não há script `test:e2e` neste checkout. Foram executados os testes browser específicos acima, sem chamá-los de teste completo da aplicação autenticada. Node disponível 26.5.1; o projeto declara Node 24.x. Os testes emitiram aviso de depreciação de module.register, sem falha; repetir no runtime de implantação faz parte da homologação.

## Arquivos principais

- DS fonte: `design-system/tokens.json`, `components/bundle.css`, CardConteudo, CardSala, TelaAssistente, guias/previews das peças afetadas; catálogo/exemplos e cópia `portal/src/design-system` regenerados.
- Composição: `features/portal/PortalCliente.tsx`, componentes BannerRotativo, CardSala, CardConteudo, CardConteudoVitrine, CardAcervo, RetomadaPortal, CabecalhoSala, MiniaturaVideo; `features/acervo/LeituraConteudo.tsx`, CardDoVideo, CatalogoVideos; rotas `/videos` e `/anfitrioes`.
- Editorial: `features/admin/ui/SeletorVideosArtigo.tsx`, SeletorArtigosVideo, editores e useEdicao; `modules/acervo/editorial-atomico.ts`, `referencias-integridade.ts`, repositório/contratos e `server/store.ts`; ações/revisão de Curadoria e anfitrião.
- Conta: `modules/conta/acesso.ts`, casos de uso corrigir-email/verificar, repositório/controller; ConfirmarEmail, login, sessão e layouts.
- Comunidade: regras de publicação, compositor, feed, leitura, hooks, operações/consultas e projeção pública.
- Lixeira/auditoria: `features/artigos/lixeira.ts`, `server/artigos/lixeira.ts`, lixeira de Salas, tabelas/ações administrativas, auditoria por atorId.
- Documentação: [manual de operação](../manual-operacao.md), CLAUDE.md, portal/README.md, inventários e este relatório. Testes novos em `portal/tests/*final*`, `editorial-*`, `artigos-lixeira*`, `conta-*`, `vinculos-artigo.test.ts` e fixtures específicas.

Relação completa, incluindo derivados e testes: [arquivos alterados](arquivos-alterados.txt).

## Migrações, implantação e reversão

**Duas migrações aditivas, não aplicadas ao banco conectado:** `0008_refinamento_portal.sql` adiciona conteudos.lixeira (JSONB opcional) e publicacoes.video_id (texto opcional); `0009_auditoria_ator.sql` adiciona auditoria.ator_id (texto opcional). Históricos não são reatribuídos e referências existentes não são regravadas. Testes SQL aplicam todas as migrações em banco descartável.

Antes de implantar: backup PostgreSQL/Storage conforme política do ambiente, aplicar as migrações pelo fluxo versionado, subir código e DS juntos e executar homologação com contas descartáveis autorizadas. Não executar seed para forçar screenshots. O servidor em execução com o schema antigo não constitui revisão desta versão até aplicar as migrações. A versão publicada do Design System precisa ser atualizada.

Reversão: pause escritas e retorne a versão compatível com leitura de `conteudos.lixeira`. Não remova colunas aditivas nem volte a código que ignore essa marca, pois pode reexpor conteúdo excluído. Mantenha o banco e arquivos atuais, sem restaurar backup sobre novas escritas. Exclusão definitiva autorizada não é reversível por código; requer o backup operacional, por isso depende da confirmação específica existente.

Nenhum commit, push, migração remota, publicação editorial ou alteração de contas reais foi feito nesta rodada. O banco conectado só recebeu as duas consultas de inventário somente leitura descritas acima. `.env` e segredos não foram alterados nem incluídos nas evidências.

## Pendências reais

1. Curador principal: definir quem pode atribuir/revogar outras contas de curadoria. Não criar permissões por suposição.
2. Inbox e agenda: definir participantes, operações, retenção e modelo de agenda antes de ativar. Contatos oficiais aguardam URLs/e-mail confirmados; o link genérico da home do YouTube foi removido, sem afetar links de vídeos.
3. Jornada do Buscador: estrutura aprovada registrada — jornada pessoal, percursos por tema, progresso por Sala; Citrino, Esmeralda, Cristal de Rocha, Safira, Turmalina, Opala, Ametista, Rubi; títulos Explorador, Investigador, Articulador, Aprofundador. Critérios numéricos/eligibilidade/privacidade/eventos versionados precisam de decisão da Curadoria antes da ativação. Conquistas existentes não foram convertidas ou removidas. P05/landing fora do escopo.
4. P13: decisão de quais IDs de fontes realmente devem sair; P22: identificação das quatro Salas relatadas, se pertencem a outro ambiente/status.
5. Homologação com sessões HTTP reais de Buscador, dois anfitriões e dois curadores; SMTP, Storage, provedor de IA/YouTube; múltiplos processos PostgreSQL, teclado virtual e dispositivos físicos, zoom 200% e acessibilidade integrada. SQL isolado comprova constraints/rollback dos cenários, não carga distribuída.
6. Locks são amplos no acervo atual e podem aumentar espera sob carga; preservar protocolo ao otimizar. Bytes S3 e entrega externa de e-mail não pertencem à transação PostgreSQL. Cadastro inicial por convite usa o fluxo de conta existente separado do acervo. Criação de Sala reserva slug atomicamente, mas sua auditoria de criação ainda é operação posterior; esse limite não equivale à atomicidade dos planos de revisão e edição testados.
