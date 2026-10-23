# Comunidade — Fase B

**Objetivo:** integrar ao portal a leitura da Comunidade aprovada na Fase A.
**Especificação:** docs/prompts/comunidade.md e instruções da conversa; parar após B.
**Arquitetura:** dados no store existente; repositório filtra visibilidade e projeta apenas dados públicos; consultas pessoais no servidor; páginas autenticadas em `(app)`; componentes React do DS para a apresentação.

- [x] Tipos, 14 publicações e seis autores (dois anfitriões), comentários, relações e denúncias de demonstração. Migração aditiva do store sem apagar alterações existentes.
- [x] Regras puras testadas: validação, limites, posse/moderação, transições, feed determinístico e debate semanal.
- [x] Repositório com remoção de conteúdo oculto e campos privados; testes de privacidade e visibilidade.
- [x] `/comunidade`, publicação, salvos, pessoas e perfil público; abas, busca, comentários de leitura, estados e navegação.
- [x] Publicações nos perfis próprios e de anfitrião. ConversasDaSala isolado, pois outra sessão mantém a página de Sala.
- [x] `npm run check`, revisão de código e conferência no navegador. Entregar rotas e parar.

Decisões: nenhuma escrita de comunidade nesta fase. Controles de escrita desabilitados, sem simular sucesso. A ordenação concede até duas horas de prioridade a Salas seguidas, anfitriões seguidos e trilhas; segue recência e desempate por id. “Seguindo” filtra apenas pessoas. Nenhuma convicção, e-mail ou histórico privado sai no contrato público. Novidades só terão contador quando existir leitura registrada, na fase de interação.

## Conferência e decisões da entrega

- Rotas: `/comunidade`, `/comunidade/p/p-demo-1`, `/comunidade/salvos`, `/comunidade/pessoas`, `/perfil/u-lucia-demo`, `/anfitrioes/ana-ribeiro` e aba Publicações em `/perfil` e nos anfitriões.
- Membro: `buscador@exemplo.com` / `escada-de-quem-sobe`, com dois salvos e pessoas/uma Sala acompanhadas. Anfitriões: Helena e Ana (credenciais de demonstração em `features/auth/contas.ts`). Administrador: conta de curadoria existente, sem publicações. Uma conta nova tem Seguindo/Salvos vazios.
- Revisão independente de código: corrigido o repasse de salvos e curtidas nas abas de perfil; teste de regressão adicionado. Testes de consulta conferem isolamento dos salvos por sessão e recusa sem sessão.
- A página da Sala permanece sob responsabilidade da outra sessão. `features/comunidade/ui/ConversasDaSala.tsx` é o painel isolado pronto para inserir na aba Conversas. O feed já permite filtrar por Sala e tema via URL.
- O nível público, quando existe, é calculado por Sala e respeita a preferência de mostrar níveis; não expõe leituras nem conquistas. O campo Sobre e a capa privados não são publicados.
- Não há marcador artificial de novidades. Contagem de não lidas e marcação de leitura serão conectadas na fase de interação.
- A demonstração é persistida apenas na memória do processo, como o restante do projeto; reiniciar recompõe os seeds. Migração desta versão acrescenta Comunidade e o segundo perfil de anfitrião sem apagar o acervo em edição.
- Ajuste do DS: grade limitada aos tokens de largura do feed e lateral. Build, contraste e sincronização executados; a versão publicada da biblioteca precisa ser atualizada.
- Conferência visual: feed desktop, busca, Seguindo vazio (curadoria), comentários em modal/drawer, Escape e retorno de foco, publicação por link direto. Na largura de 390 px, o conteúdo da Comunidade cabe; o painel global de busca oculto já existente excede a viewport. Registrar esse ajuste da moldura no passe responsivo da Fase D.
- Escrita, notificações e reações persistidas: Fase C. Denúncias/decisões administrativas, suspensão e auditoria: Fase D. As denúncias no store são apenas seeds nesta fase. Nenhuma ação de escrita da Comunidade foi criada.

Validação final: `npm run check` aprovado (69 arquivos Vitest, 437 testes; 10 testes do DS; lint e TypeScript), `build.mjs --check` aprovado e todos os pares de contraste AA. Perfis de buscador e anfitrião conferidos no navegador, incluindo a aba Publicações. E2E de escrita/moderação permanece nas fases C/D, conforme a especificação.
