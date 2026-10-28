# Progresso real

Barra horizontal dourada sobre trilho escuro, com rótulo, porcentagem e contagem. O valor vem das etapas concluídas; o componente não inicia requisições nem cria temporizadores.

Em frameworks, emita a estrutura HTML do exemplo e reutilize o CSS compartilhado. No portal, use `ProgressoReal` em `@/components/ds/EstadosInterface`.

HTML: copie a estrutura do exemplo. Para atualizar: `SalaInterface.atualizarProgresso(elemento, concluidos, total)`.

- Porcentagem: arredondamento de concluídos / total × 100.
- Valores fora dos limites são limitados ao intervalo 0–total.
- Total zero, negativo ou não finito: nenhuma barra ou porcentagem fictícia; exibe explicação.
- Elemento nativo `progress` com rótulo acessível.
- O percentual de etapas concluídas não representa tempo restante.
- O visual é compartilhado com CardSala e as demais barras: `progress-track`, `progress-gradient` e `progress-glow`, definidos no bundle. O CSS de EstadosInterface preserva apenas a composição e os estados, sem redefinir o preenchimento.
- O halo acompanha somente a área preenchida; em 0% não aparece preenchimento dourado. Não há animação que simule avanço.
- Em cores forçadas, o padrão usa as cores do sistema. Movimento reduzido não altera valores ou contagens.
