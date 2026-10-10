# Indicador de salvamento

Mostra, em uma cápsula discreta, se o rascunho está salvo.

- `span.sdb-savestate[data-state]` com um ponto `<i>` e o texto, dentro de uma região `aria-live="polite"`.
- Estados: `salvo` ("Salvo às 14:32", ponto `accent-fill`), `salvando` ("Salvando…", ponto pulsando), `pendente` ("Alterações não salvas", ponto vazado), `erro` ("Erro: não foi salvo", fundo `critical-soft`).
- Hora em algarismos tabulares, formato 24 h. Com movimento reduzido o ponto não pulsa.
