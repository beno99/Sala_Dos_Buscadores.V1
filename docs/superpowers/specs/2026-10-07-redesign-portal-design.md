# Redesign do portal · design (2026-10-07)

Base: `docs/prompts/redesign-portal.md` (requisitos completos). Este documento registra só as decisões tomadas sobre ele.

## Decisões aprovadas

- **Fases A → D** do prompt, com parada para revisão visual depois da Fase A (catálogo do design system) antes de tocar no `portal/`.
- **Leitura:** abrir um conteúdo registra leitura em andamento; a porcentagem acompanha a rolagem do texto; chegar ao fim marca como lida. Só leituras concluídas contam para níveis e para a conquista "Na fonte". A conta de demonstração já vem com porcentagens simuladas.
- **Tema:** `solido-claro` padrão; a escolha claro/escuro fica num cookie `sdb_tema`, lido no servidor (sem piscar).
- **Progresso do membro:** novo `portal/src/server/progresso.ts`, em memória e por conta (Salas visitadas, leituras, comparações, trilhas, estante, verbetes, conquistas). Preferências do onboarding ficam em `features/auth/contas.ts`.
- **Moldura:** grupo de rotas `(app)` com lateral, barra superior, rodapé e botão flutuante; autenticação fica fora; `/admin` mantém `CascaCuradoria`.
- **Lógica pura** em `portal/src/features/estudo/` (`niveis.ts`, `conquistas.ts`, `recomendacao.ts`, `banner.ts`), com testes.

## Conflitos registrados

- Wireframe × marca/DRS: "Home" → "Portal"; pontos e "lev 6" → níveis por assunto sem pontos; sininho → `TODO(notificacoes)`; botão laranja e emoji fora; "27 disponíveis" → "5 abertas".
- Skill de brainstorming pede commit do spec: o projeto não é repositório git, então o spec fica só salvo.
- `ui-ux-pro-max` sugere paletas e estilos próprios: valem só os tokens da marca.

## Imagens

`portal/public/imagens/` está vazia; toda peça usa a placa da marca com o arco até as imagens chegarem.
