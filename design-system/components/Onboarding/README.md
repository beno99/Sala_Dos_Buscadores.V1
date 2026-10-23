# Onboarding

Sequência de primeiro acesso num Modal em sheet: boas-vindas, áreas de interesse, religião ou convicção (opcional) e resumo.

## Anatomia (Figma 19537:4958)
- `.sdb-modal.sdb-sheet.sdb-onboarding.sdb-onboarding--<etapa>` (`role="dialog"`, `aria-modal`, `aria-labelledby` no título da etapa). Fundo no degradê `overlay-from` → `overlay-to`, cantos de 32 px.
- `.sdb-onboarding__hero`: capa com gravura de domínio público (`.sdb-onboarding__image`, `alt=""`), tom dourado e véu; `.sdb-onboarding__dots` (decorativo, ponto atual alongado) e, a partir da etapa 2, a pílula de vidro `.sdb-onboarding__back` (ícone `voltar`).
- `section.sdb-onboarding__step`: `.sdb-onboarding__heading` com o título `.sdb-onboarding__title` (Fraunces 600, `label-brand`) e o selo `.sdb-onboarding__status` ("Etapa 2 de 4", `aria-live="polite"`); texto `.sdb-onboarding__lead`.
- Interesses: `.sdb-onboarding__choices` com rótulos `.sdb-onboarding__label` (Temas, Salas) e chips `.sdb-onboarding__options`.
- Religião ou convicção: `fieldset.sdb-onboarding__radios` com `label.sdb-onboarding__option > input[type=radio]` em duas colunas (escolha única; a marcada ganha o painel `overlay-panel`). `.sdb-consent` aparece quando a escolha é uma religião ou convicção.
- `.sdb-onboarding__summary` (painel `overlay-panel`) e `.sdb-onboarding__note`.
- `.sdb-onboarding__actions`: em todas as etapas, "Começar" (`.sdb-btn--gold`) e "Pular e ir ao Portal" (`.sdb-btn--warm`).

## Regras
- Abre logo depois do cadastro e no primeiro login de uma conta sem preferências; "Refazer preferências", em Ajustes, reabre.
- Nada vem pré-selecionado. "Pular e ir ao Portal" fecha em qualquer etapa e guarda o que já foi escolhido.
- Religião ou convicção é **opcional** (LGPD art. 11, RNF-LEG-02) e de escolha única: "Pular e ir ao Portal" e "Prefiro não informar" sempre disponíveis, e a resposta nunca condiciona o acesso. Opções: "Não tenho religião", "Espiritualidade sem religião", "Prefiro não informar" e, em ordem alfabética, as tradições, terminando em "Outra" (com campo de texto).
- Texto de finalidade sempre visível: "Usamos só para sugerir conteúdos. Fica privado, ninguém mais vê, e você pode mudar ou apagar em Ajustes."
- Se a pessoa escolher uma religião ou convicção, o consentimento aparece e "Começar" fica bloqueado (`aria-disabled`) até a caixa ser marcada.
- Abaixo de 520 px, as ações e as opções de convicção ficam em uma coluna.
- Texto do modal em `label-secondary` (o branco do Figma não passa AA sobre o dourado); botão dourado com `on-gold-action`.
- Foco preso no Modal; Esc fecha (vale como "Pular" de todas as etapas restantes).
