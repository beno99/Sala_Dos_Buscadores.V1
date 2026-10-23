# Tooltip

Nomeia um controle só com ícone ou expande uma sigla.

- `data-tip="texto"` em elemento focável; `data-tip-side="bottom"` para abrir abaixo; `data-tip-align="end"` alinha o balão pela direita do gatilho, para controles junto da borda direita (a última seta de um carrossel), onde o balão centrado passaria da borda.
- Material espesso com desfoque, raio 11 px, texto `label` 13 px.
- Aparece após 450 ms com mola, a partir da ponta voltada ao gatilho. Depois que um abriu, os vizinhos aparecem na hora, sem animação.
- Nunca coloque ação ou informação essencial no tooltip.

- Em telas de toque (sem hover), o balão sai do layout e só aparece com `.is-open`: posicionado e invisível, ele alargava a página perto da borda. O controle continua nomeado pelo `aria-label`.
