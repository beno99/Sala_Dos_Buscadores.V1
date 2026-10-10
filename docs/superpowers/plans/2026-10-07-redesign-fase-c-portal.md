# Redesign · Fase C (Portal) Implementation Plan

> Executado inline, TDD nas regras puras; parada para revisão ao fim da fase.

**Goal:** A página Portal (`/`) completa, como no wireframe: banner rotativo, Salas recomendadas com chips de tema, painel de indicadores, "Continue de onde parou", "Publicados recentemente", "Para ampliar o olhar", anúncio na coluna direita e rodapé; lateral do membro com "Continuar", "Salvos para depois", nível no assunto em foco e conquistas. Níveis e conquistas privados, contados em leituras.

**Architecture:** Progresso de estudo por conta em memória (`server/progresso.ts`), alimentado por eventos de estudo (Sala visitada, leitura com porcentagem pela rolagem, tema comparado, verbete aberto, fontes conferidas) que o cliente emite (`sdb:estudo`) e a Moldura grava por Server Action, mostrando o Toast de conquista nova. Toda a regra é pura e testada em `features/estudo/` (níveis, conquistas, recomendação, painel, rotação do banner). A página `/` monta o modelo no servidor e entrega às peças da biblioteca.

**Spec:** `docs/prompts/redesign-portal.md` (seções 1, 3, 5) + spec do redesenho.

## Global Constraints
- Só peças `sdb-*`; Tailwind só para estrutura. Grade de até 1280 px, mesma borda esquerda.
- Níveis por assunto (Sala e tema): Iniciante → Intermediário com metade dos conteúdos do assunto lidos (arredondado para cima) → Avançado com todos. Sem pontos, sem nível global, sem comparação entre pessoas. Os níveis medem só o estudo no acervo.
- Conquistas: Porta aberta, Cinco Salas, Lado a lado, Na fonte (3 fontes primárias), Vocabulário (10 verbetes), Com as fontes, Degrau III. Toast "Conquista: X." no passado, sem "parabéns". Desligáveis ("Mostrar níveis e conquistas").
- Recomendação: interesses primeiro, convicção só como desempate fraco, nada escondido, e sempre ao menos uma Sala e um conteúdo "Para ampliar o olhar" fora do perfil declarado.
- Anúncio: rótulo "Publicidade", anunciante fictício, "Por que estou vendo isto?", nunca em grade, assistente ou leitura.
- Banner: 7 s, pausa (botão, hover, foco), parado com `prefers-reduced-motion`, operável por teclado.

---

### C1 · Regras puras (`src/features/estudo/`, com testes)
`niveis.ts` (nível, quanto falta, segmentos dos degraus, assunto em foco), `conquistas.ts` (definições, avaliação, novas), `recomendacao.ts` (ordem das Salas com "Para ampliar o olhar", conteúdo para ampliar, "Comece por aqui"), `painel.ts` (indicadores e continuar), `banner.ts` (rotação e montagem dos slides).

### C2 · Progresso e eventos de estudo
`server/progresso.ts` (estado por conta, conta de demonstração com histórico), `features/estudo/acoes.ts` (`registrarEstudoAcao`, `dispensarContinuarAcao`), `features/estudo/eventos.ts` (`emitirEstudo`) e ouvinte na Moldura. Pontos de registro: página da Sala, leitura (`AcompanharLeitura`: porcentagem pela rolagem, fim marca lida), `/comparar` com tema, verbete aberto, fontes conferidas no assistente.

### C3 · Dados simulados e imagens
`data/mock/banner.ts` (marca + episódios), `data/mock/anuncios.ts` (fictícios), `data/mock/trilhas.ts` (uma trilha por Sala); `server/imagens.ts` devolve a imagem só se o arquivo existir em `public/imagens/`.

### C4 · Peças em React (`components/ds/`)
`BannerRotativo`, `Carrossel`, `PainelIndicadores`, `CardSala` (progresso, "Para ampliar o olhar", imagem), `CardConteudoLinha`, `SeloNivelProgresso`, `Conquista`, `EspacoPublicitario`, cartões da lateral ("Continuar", rodapé).

### C5 · Página Portal e lateral
`app/(app)/page.tsx` + `features/portal/` (chips de tema filtrando o carrossel com "Comparar {tema} entre as Salas", estado vazio do filtro, "Comece por aqui" para conta nova, Modais "Como os níveis funcionam", "Ver conquistas" e "Por que estou vendo isto?"). `app/(app)/loading.tsx` (esqueletos) e `app/(app)/error.tsx` ("Erro:" + "Tentar de novo"). Lateral recebe "Continuar" e rodapé pelo layout.

### C6 · Testes, documentação, verificação
E2E: conta de demonstração vê indicadores, "Continuar" e conquistas; o banner pausa; ler um conteúdo põe ele em "Continue de onde parou". README: divergências RF-24 e Publicidade, progresso em memória. `npm run check`, `test:e2e`, conferência visual 1440/1024/390, claro e escuro, demonstração e conta nova.
