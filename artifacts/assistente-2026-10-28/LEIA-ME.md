# Assistente do acervo — implementação e validação

Implementado em `/assistente`. Desenvolvimento: http://localhost:3000/assistente. Build de produção validado: http://localhost:3002/assistente.

A tela usa a composição aprovada de `design-system/components/TelaAssistente`, General Sans/Gambetta locais e os renderizadores WebGL originais. Mantém navegação, busca, conta, rodapé e autenticação existentes. O tema escuro é local à rota; a preferência da pessoa não é alterada. A sidebar fictícia e o histórico de exemplo não foram copiados. Nova conversa fica na área de estudo; há apenas uma navegação móvel.

Os três modos e a Sala são enviados no contrato autenticado. As sugestões apenas preenchem o campo. Rascunho, contexto e conversa sobrevivem à troca de esfera; Nova conversa preserva contexto, aparência e pausa. Tentativas interrompidas não duplicam mensagens nem recebem respostas atrasadas. A origem no comparador prepara o modo Comparar.

## Integrações pendentes

Não existe provedor de IA/RAG nem histórico persistente neste checkout. O endpoint `/api/assistente` confere sessão e valida pergunta, modo e Sala publicada, depois retorna 503 explicitamente. O rascunho é preservado. O ponto de integração é `portal/src/server/assistente.ts`, interface `ServicoAssistente`; não foram criadas credenciais, respostas, fontes ou persistência fictícias.

A conversa atual permanece somente em memória, compartilhada com o mini chat. Sucesso, fontes e cópia foram exercitados com respostas controladas exclusivamente nos testes. A aplicação não importa o temporizador ou os dados de demonstração da prévia.

## Arquivos relevantes

- `portal/src/app/(app)/assistente/page.tsx`: rota, sessão e contexto inicial.
- `portal/src/features/assistente/TelaAssistente.tsx`: modos, Salas, sugestões, campo e conversa.
- `portal/src/components/ds/CabecalhoAssistente.tsx`, `EsferaAssistente.tsx`, `RespostaEstudo.tsx`: peças React com as classes aprovadas.
- `portal/src/features/assistente/ConversaProvider.tsx`: estado compartilhado, cancelamento, repetição e Nova conversa.
- `portal/src/features/assistente/contrato.ts`, `servico.ts`, `portal/src/server/assistente.ts`, `portal/src/app/api/assistente/route.ts`: contrato e transporte autenticado.
- `portal/src/components/layout/Moldura.tsx`, `Providers.tsx`: integração da moldura e isolamento de conversa por conta.
- `portal/src/features/assistente/MiniChatAssistente.tsx`: usa o mesmo serviço sem etapas/contagens simuladas; `motor.ts` recebeu apenas o tipo opcional do modo para compatibilidade dos testes legados.
- `design-system/components/TelaAssistente/tela-assistente.css`, `README.md`, exemplo gerado: adaptação à moldura, mensagens, alvos móveis e pausa do fallback.
- `portal/scripts/sync-design-system.mjs`, `portal/src/app/layout.tsx`: sincronização e carga dos estilos/renderizador escuro. As cópias em `portal/src/design-system/` foram geradas, nunca editadas manualmente.
- `portal/README.md`: contrato, funcionamento e pendências.
- Testes novos: `TelaAssistente.test.tsx`, `EsferaAssistente.test.tsx`, `tests/e2e/assistente-tela.spec.ts`. Jornadas existentes em `moldura.spec.ts` e `jornada-do-buscador.spec.ts` atualizadas para a indisponibilidade real.

## Checks executados

- `npm run check`: aprovado; sincronização DS, 10 testes de marcação, lint, TypeScript e **461 testes Vitest / 73 arquivos**.
- `npm run build`: aprovado.
- `node design-system/scripts/build.mjs --check`: em dia.
- `node design-system/scripts/contraste.mjs`: todos os pares testados passam AA nos quatro temas.
- `E2E_BASE_URL=http://localhost:3002 npm run test:e2e -- tests/e2e/assistente-tela.spec.ts tests/e2e/moldura.spec.ts tests/e2e/jornada-do-buscador.spec.ts`: **32 aprovados, 2 ignorados intencionalmente por dispositivo**. A suíte E2E completa do repositório não foi executada.
- `git diff --check`: sem erros.

No Chromium foram verificados: desktop e celular, larguras 1504/1440/1024/768/390/360, ausência de overflow horizontal, três modos e contexto no POST, sessão/validação, preservação do rascunho, IME, Enter móvel/desktop, fontes e foco após Escape, cópia com referências, navegação, duas esferas, pausa, troca pausada, fallback sem WebGL e movimento reduzido. A instrumentação de teste confirmou o tempo da animação congelado durante a pausa e a suspensão de desenho fora da tela. Suspensão com aba oculta e liberação de recursos permanecem no renderer original; a desmontagem/troca também foi verificada por teste de componente.

A validação visual usou o navegador Chromium da suíte Playwright: a conexão de navegador interativo estava indisponível nesta sessão. As capturas da referência foram feitas separadamente; a regressão não depende do servidor do catálogo na porta 4174.

## Capturas reais

Dados da conta de demonstração `buscador@exemplo.com`, usando os registros existentes, sem alterar seeds. As imagens da aplicação foram capturadas no build de produção.

- [Desktop — esfera escura](assistente-desktop-escura.png)
- [Desktop — esfera dourada pausada e rascunho preservado](assistente-desktop-dourada.png)
- [Celular — esfera escura](assistente-celular-escura.png)
- [Celular — esfera dourada pausada](assistente-celular-dourada.png)
- [Desktop — indisponibilidade real](assistente-desktop-indisponivel.png)
- [Celular — indisponibilidade real](assistente-celular-indisponivel.png)
- [Desktop — fallback sem WebGL](assistente-desktop-fallback.png)
- [Celular — fallback sem WebGL](assistente-celular-fallback.png)
- [Referência desktop](referencia-desktop.png) e [referência celular](referencia-celular.png).

A versão publicada do Design System precisa ser atualizada. Não houve publicação remota nem commit automático; alterações anteriores foram preservadas.
