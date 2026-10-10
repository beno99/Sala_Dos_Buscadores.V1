# Linha do tempo

Eventos e documentos em ordem, ligados por arcos cuja altura mostra quanto tempo separa um do outro.

## O consumidor fornece
Para cada item: data exibida (aceita "c." e "séc."), ano de referência para calcular o arco, título, uma frase de contexto, tipo (documento ou evento), período e Sala de origem.

## Comportamento
- Pontos igualmente espaçados sobre uma linha pontilhada; arcos já percorridos em `label`, os seguintes em `label-tertiary`. O ponto selecionado é um disco `accent-fill` que desliza com mola.
- Clique num ponto, use as setas ou a lista abaixo. A lista agrupa por período e mostra o tipo pelo marcador (cheio = documento, vazado = evento).
- Datas incertas ficam incertas; nunca invente precisão.
