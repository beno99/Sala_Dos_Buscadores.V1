# Onboarding

Sequência de primeiro acesso num Modal em sheet: boas-vindas, áreas de interesse, religião ou convicção (opcional) e resumo.

## Anatomia
- `.sdb-modal.sdb-sheet.sdb-onboarding[data-sdb-steps]` (`role="dialog"`, `aria-modal`, `aria-labelledby` no título da etapa).
- `.sdb-onboarding__top`: `.sdb-onboarding__status` ("Etapa 2 de 4", anunciado com `aria-live="polite"`) e `.sdb-dots` com um ponto por etapa (`[data-step-dot]`, decorativo).
- `section.sdb-onboarding__step` por etapa: título `.sdb-onboarding__title[data-step-title]`, texto `.sdb-onboarding__lead`, opções `.sdb-onboarding__options` (chips de múltipla escolha) ou `.sdb-onboarding__checks` (checkboxes em grade, alinhados) e `.sdb-onboarding__actions`.
- `.sdb-onboarding__purpose`: finalidade em texto visível. `.sdb-consent`: consentimento destacado (contorno em `accent`).
- `.sdb-onboarding__summary`: o que foi salvo.
- Botões: `[data-step-next]` (Continuar), `[data-step-prev]` (Voltar), `[data-step-skip]` (Pular). O runtime mostra uma etapa por vez e leva o foco ao título da nova etapa. `SalaBuscadores.showStep(raiz, i, true)` faz o mesmo por código.

## Regras
- Abre logo depois do cadastro e no primeiro login de uma conta sem preferências; "Refazer preferências", em Ajustes, reabre.
- Nada vem pré-selecionado. Interesses têm "Pular por agora".
- Religião ou convicção é **opcional** (LGPD art. 11, RNF-LEG-02): "Pular" e "Prefiro não informar" sempre disponíveis, e a resposta nunca condiciona o acesso. Opções: "Não tenho religião", "Espiritualidade sem religião", "Prefiro não informar" e, em ordem alfabética, as tradições, terminando em "Outra" (com campo de texto).
- Texto de finalidade sempre visível: "Usamos só para sugerir conteúdos. Fica privado, ninguém mais vê, e você pode mudar ou apagar em Ajustes."
- Se a pessoa informar algo (`[data-sensitive]` marcado), o consentimento aparece e o Continuar fica bloqueado (`aria-disabled`) até a caixa ser marcada.
- Abaixo de 480 px, "Pular" desce para uma linha própria, abaixo de Voltar e Continuar.
- Foco preso no Modal; Esc fecha (vale como "Pular" de todas as etapas restantes).
