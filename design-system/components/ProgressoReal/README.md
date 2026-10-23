# Progresso real

Barra horizontal em degradê, com rótulo, porcentagem e contagem. O valor vem das etapas concluídas; o componente não inicia requisições nem cria temporizadores.

Em frameworks, emita a estrutura HTML do exemplo e reutilize o CSS compartilhado. No portal, use `ProgressoReal` em `@/components/ds/EstadosInterface`.

HTML: copie a estrutura do exemplo. Para atualizar: `SalaInterface.atualizarProgresso(elemento, concluidos, total)`.

- Porcentagem: arredondamento de concluídos / total × 100.
- Valores fora dos limites são limitados ao intervalo 0–total.
- Total zero, negativo ou não finito: nenhuma barra ou porcentagem fictícia; exibe explicação.
- Elemento nativo `progress` com rótulo acessível.
- O percentual de etapas concluídas não representa tempo restante.
- As barras e o progresso internos do CardSala original não foram substituídos.
