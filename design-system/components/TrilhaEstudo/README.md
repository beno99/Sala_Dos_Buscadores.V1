# Trilha de estudo

Sequência de etapas que leva do iniciante ao avançado dentro de uma Sala, desenhada como degraus ligados por arcos que sobem.

## Estados de cada degrau
| Estado | `data-state` | No trilho | Na lista |
| --- | --- | --- | --- |
| Concluído | `done` | disco `accent-fill` com marca | check preenchido |
| Em andamento | `current` | anel de progresso | anel parcial + % |
| Disponível | `available` | círculo vazado com numeral | círculo vazado, clicável |
| Bloqueado | `locked` | disco `fill-strong` com cadeado | cadeado, diz o que falta |

## O consumidor fornece
Título e Sala da trilha, etapas (título, tipo, duração) e o estado e progresso (0–100) de cada uma.

## Regras
- Os arcos entre degraus crescem da esquerda para a direita: a escada da marca. Arcos percorridos ficam contínuos; os seguintes, tracejados.
- Emblema de ouro com o arco preto no cabeçalho; porcentagem grande em algarismos tabulares.
- O botão principal diz a próxima ação ("Concluir degrau III"). Concluir libera o seguinte. Cores em 400 ms, anel em 600 ms.
- Linguagem de escolha: "Disponível quando quiser", nunca "Você precisa".
