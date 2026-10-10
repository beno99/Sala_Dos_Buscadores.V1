# Redesign · Fase B (moldura e acesso) Implementation Plan

> Executado inline (superpowers:executing-plans), TDD nas regras puras e nos componentes; parada para revisão ao fim da fase.

**Goal:** Trocar a casca do portal pelo layout de painel (lateral, barra superior, conteúdo, rodapé, botão flutuante, barra de abas no celular, painel de busca), tornar o cadastro obrigatório e abrir o onboarding no primeiro acesso.

**Architecture:** O layout raiz fica só com `<html>`, tema (cookie `sdb_tema`) e providers. Grupos de rota: `(app)` com a moldura e a checagem de sessão no servidor, `(conta)` com entrar/cadastro/recuperar. `/admin` mantém `CascaCuradoria`, agora com a Barra superior no topo. O proxy passa a cobrir todas as rotas, menos as de conta e os arquivos estáticos. Preferências do onboarding vivem na conta (memória do servidor), gravadas por Server Action e validadas por função pura.

**Spec:** `docs/superpowers/specs/2026-10-07-redesign-portal-design.md` + `docs/prompts/redesign-portal.md` (seções 1, 4, 7, 9).

## Global Constraints

- Só peças `sdb-*` da biblioteca; Tailwind só para layout de estrutura. Faltou peça → estender `design-system/` primeiro e rodar `npm run ds:sync`.
- "Portal", nunca "Home"/"Início". Sem emoji, sem exclamação, erros com "Erro:", confirmações no passado.
- Sem sessão, toda rota vai para `/entrar?voltar=…`, exceto `/entrar`, `/cadastro`, `/recuperar-senha`. O servidor confere de novo; papel de administrador continua conferido em cada Server Action.
- Religião ou convicção: opcional, nada pré-selecionado, finalidade visível, consentimento destacado antes de salvar, editável e apagável depois.
- Celular < 900 px: barra de abas no lugar da lateral.

---

### Task B1: Biblioteca · Drawer largo
- `design-system/`: `.sdb-drawer--wide` (até 560 px) no `bundle.css`, guia e exemplo do Drawer; `build.mjs` e `ds:sync`.

### Task B2: Acesso obrigatório
**Files:** `src/proxy.ts` (+ teste), `src/server/sessao.ts` (`exigirMembro` para páginas), `src/features/auth/{FormEntrar,FormCadastro,FormRecuperar}.tsx` (+ testes), remover `BoasVindas.tsx`, `contas.ts`.
- Proxy: função `precisaEntrar(caminho)` pura e testada; matcher amplo excluindo rotas de conta, `_next`, `imagens`, `favicon.ico` e arquivos com extensão.
- Formulários sem "Continuar sem cadastro"/"(opcional)"; cadastro sem tradições de interesse; textos dizem que a conta é necessária.
- `Membro` ganha `membroDesde` (ISO) e `preferencias: Preferencias | null`; sai `interesses`.

### Task B3: Preferências (regras puras + Server Action)
**Files:** Create `src/features/onboarding/preferencias.ts` (+ teste), `src/features/onboarding/acoes.ts`; modify `contas.ts`.
- Tipos: `Conviccao` (lista fixa do prompt), `Preferencias { temas, salas, conviccao: { opcoes, outra?, consentidoEm } | "nao-informar" | null, concluidoEm }`.
- `validarPreferencias(entrada)` → `Resultado<Preferencias>`: "Prefiro não informar" é exclusivo; qualquer convicção informada exige consentimento; "Outra" exige texto (até 60); valores fora da lista recusados.
- `OPCOES_CONVICCAO` na ordem pedida.
- `salvarPreferenciasAcao` (sessão obrigatória) e `apagarConviccaoAcao` (para Ajustes, Fase D).
- Conta de demonstração: `membroDesde` set 2026, preferências com 2 interesses e "Prefiro não informar". Administrador: preferências vazias concluídas.

### Task B4: Tema por cookie
**Files:** Create `src/features/aparencia/tema.ts` (+ teste), `src/features/aparencia/MenuAparencia.tsx`; modify `src/app/layout.tsx`.
- `temaDoCookie(valor) → "solido-claro" | "solido-escuro"` (padrão claro). Menu "Claro"/"Escuro" grava `document.cookie` (1 ano) e o atributo.

### Task B5: Peças da moldura em React
**Files:** Create em `src/components/ds/`: `NavegacaoLateralApp.tsx`, `BarraSuperior.tsx`, `BotaoFlutuante.tsx`, `BarraAbasApp.tsx`, `Rodape.tsx`, `Sheet.tsx` (Modal em sheet com foco preso) e `useFocoPreso.ts`. Testes da lateral (aberta/recolhida, `aria-expanded`, `localStorage`).
- Mesmas classes e atributos dos exemplos; comportamentos do `bundle.js` portados (recolher com memória, tooltip à direita, `is-scrolled`).

### Task B6: Moldura e grupos de rota
**Files:** Create `src/app/(app)/layout.tsx`, `src/app/(conta)/layout.tsx`, `src/components/layout/Moldura.tsx`, `src/components/layout/navegacao.ts` (itens e título por rota, testado); mover `page.tsx`, `salas/`, `comparar/`, `assistente/` para `(app)`; mover `entrar/`, `cadastro/`, `recuperar-senha/` para `(conta)`; `/salas` vira página com a grade de Salas; stubs `TODO(redesign)` de Destaques, Biblioteca, Trilhas, Estante e Ajustes (funcionais na Fase D). Remover `Cabecalho.tsx` e o `Rodape.tsx` antigo; `/admin` ganha Barra superior.

### Task B7: Painel de busca e assistente em Drawer
**Files:** Create `src/features/busca/PainelBusca.tsx` + `sugestoes.ts` (puro, testado); `src/features/assistente/AssistenteFlutuante.tsx`.
- Sugestões: temas ("Comparar «tema» entre as Salas"), Salas, conteúdos publicados (lista vinda do servidor), "Perguntar ao assistente: «texto»". ⌘K/Ctrl K, ↑ ↓ ↵ esc; "Comparar" leva a `/comparar`.
- Botão flutuante abre Drawer largo com `PainelAssistente` e "Abrir em tela cheia"; some em `/assistente`.

### Task B8: Onboarding
**Files:** Create `src/features/onboarding/Onboarding.tsx` (+ teste). Aberto pelo layout `(app)` quando `preferencias === null`; também por evento para "Refazer preferências" (Fase D).
- 4 etapas, foco preso, "Etapa N de 4" anunciado, pular interesses e religião, consentimento antes de salvar, resumo com "Ir para o Portal".

### Task B9: Testes E2E, documentação e verificação
- Atualizar jornada e testes que supunham visitante. Novos: sem sessão → `/entrar`; cadastro novo → onboarding → Portal; lupa abre busca e "Comparar" leva à grade; botão flutuante abre o assistente; 390 px: barra inferior e "Mais".
- `portal/README.md` (acesso, divergências do DRS RF-01/05/07) e `CLAUDE.md` (acesso).
- `npm run ds:sync`, `npm run check`, `npm run test:e2e`; conferência visual 1440/1024/390, claro e escuro.
