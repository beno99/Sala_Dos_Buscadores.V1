# Grade Comparativa · 1.0

Uma pergunta e as respostas das Salas lado a lado, com fontes, termos e proveniência preservados. Containers de 24 px, cabeçalhos de 16 px, recuo de 8 px e intervalos de 24 px. Três, duas ou uma coluna visível conforme o espaço. Remover só oculta o exemplo; Desfazer recupera a última Sala e Restaurar recupera todas. Ao menos uma Sala permanece. Use `CardComparativo/card-comparativo.css` e `initializeComparison` de `card-comparativo.js`.

O arquivo `preview.html` é a fonte do exemplo. Execute `node scripts/build.mjs` na raiz do design system após alterações.

## Grade dentro do portal (1.0.1)

As regras da faixa (`.comparison*`) moram em `CardComparativo/card-comparativo.css` e medem o próprio contêiner (container queries): 3 colunas, 2 até 860 px e 1 até 560 px de largura da grade. Assim a grade se ajusta ao lado da navegação lateral. O título da pergunta pode ser `h1` ou `h2` dentro de `.comparison__intro`.
