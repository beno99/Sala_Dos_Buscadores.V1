# Rodapé

Fecha todas as páginas do portal: marca e frase, colunas de links e a linha final.

## Anatomia
- `footer.sdb-footer` > `.sdb-footer__top` (grade: marca + até 4 colunas) e `.sdb-footer__bottom`.
- `.sdb-footer__brand`: `.sdb-footer__mark` (arco + nome em `display-lower`) e `.sdb-footer__tagline`.
- `nav.sdb-footer__col` com `aria-labelledby` apontando para o `h2` da coluna e uma lista de links.
- `.sdb-footer__bottom`: "A Sala dos Buscadores · Curador de museu, não pregador" e o aviso de dados simulados.

## Regras
- Colunas do portal: **Acervo** (Destaques, Biblioteca, Salas, Comparar, Assistente), **Sobre** (Como funciona o assistente, Política editorial, Política de publicidade), **Legal** (Termos em linguagem simples, Privacidade e LGPD), **Canal** (YouTube).
- Fica na mesma grade da página (mesma borda esquerda). Separado por divisória, sem fundo próprio.
- Abaixo de 900 px: marca em linha inteira e colunas de dois em dois.
