# Comunidade — plano da Fase A

**Objetivo:** entregar a biblioteca visual da Comunidade para revisão, antes de criar rotas ou gravar dados.
**Especificação:** `docs/prompts/comunidade.md` e pedido do usuário nesta conversa (quatro fases, parada obrigatória após cada fase).
**Arquitetura:** composição das peças existentes, CSS no bundle canônico, tokens de geometria em tokens.json, exemplos gerados. Componentes React controlados e sem acesso a servidor. Demonstrações HTML locais não persistem nem enviam dados.

- [x] Criar CardPublicacao, CompositorComunidade, LinhaComentario, LinhaPessoa, CartaoLateralComunidade e BarraAcoesComunidade, cada qual com guia e preview.
- [x] Criar PainelComentarios (Modal/Drawer responsivo) e Comunidade (montagem de referência no catálogo).
- [x] Reutilizar Avatar, SeloNivel, Badge, Tabs, busca compacta, AreaTexto, CampoImagem, citação e conteúdo do acervo. Neutralidade própria da comunidade sem confundir autoria com revisão editorial.
- [x] Adicionar tokens de geometria, sem novas cores; documentar quatro temas, toque de 44 px, movimento reduzido e foco.
- [x] Emitir a mesma anatomia nos componentes React de `portal/src/components/ds/`. Dados e callbacks vêm do consumidor nas fases B e C.
- [x] Gerar catálogo/exemplos, verificar contraste e sincronizar a cópia. Rodar `npm run check` e conferir visualmente desktop, celular e quatro temas.
- [x] Entregar catálogo e parar para revisão.

## Decisões e limites

- O nível mostrado junto à autoria é por Sala/assunto, com contexto explícito, nunca nível global ou ranking. A nova especificação permite essa identificação na Comunidade; conquistas, histórico e convicção continuam privados.
- A identificação da publicação é texto simples. Citações informadas por pessoas usam o selo Comunidade com o rótulo “Fonte informada pelo autor”; não atestam revisão editorial. O conteúdo vinculado mantém sua própria proveniência.
- A Fase A não cria contas, rotas, tipos de domínio, store ou Server Actions. A página da Sala não é modificada.
- Mensagens diretas, vídeo enviado, enquetes, menções em tempo real, push, grupos privados, monetização, recomendação algorítmica e moderação por IA ficam fora do MVP.

## Entrega e verificação — 23/10/2026

Catálogo: `design-system/catalogo.html#comunidade`. Prévia integrada: `design-system/exemplos/Comunidade.html`. Não exigem login; Lúcia, Helena, Tomás e Rafael são personagens da demonstração, não contas de autenticação. Abra o compositor, alterne os quatro tipos, confira os campos obrigatórios e abra os comentários. O seletor do catálogo permite comparar os quatro temas.

Verificações concluídas: build canônico, contraste AA nos quatro temas, sincronização do portal, `npm run check` (lint, TypeScript, 10 testes de scripts do DS e 420 testes Vitest) e quatro testes adicionais do demonstrador (`node --test design-system/scripts/test-comunidade.cjs`). Conferência visual em desktop e celular; foco preso no painel, Escape e retorno de foco conferidos no navegador. Imagem da publicação confirmada em 4:3, sem transbordamento horizontal no desktop.

Limitação de verificação: o envio automatizado de arquivo foi bloqueado pela permissão da extensão do navegador para arquivos locais. A permissão não foi alterada; resta conferir manualmente o CampoImagem com um arquivo. O rodapé tem altura limitada e rolagem para acomodar a prévia do anexo.

A versão publicada do design system precisa ser atualizada. A Fase B aguarda revisão desta entrega. Rotas, contas de demonstração, persistência, permissões e integrações com Sala/perfil serão implementadas nas fases correspondentes.
