# Bloco de citação de fonte primária

Trecho de fonte primária com original, tradução, referência e ação de copiar.

## O consumidor fornece
Obra e localização (capítulo, dito, verso), selo de proveniência, original com `lang` e idioma/data, tradução, referência completa (ABNT) e o texto a copiar em `data-copy`.

## Comportamento
- O segmentado alterna Original · Tradução · Lado a lado (`data-view` em `.sdb-quote__views`). O trecho que entra materializa (desfoque 3 px → nítido).
- Lado a lado quebra em uma coluna abaixo de ~520 px.
- "Copiar citação" copia trecho + referência e confirma com toast; se a área de transferência for recusada, seleciona o texto e avisa.
- Sem original disponível, diga isso no rótulo e omita o segmentado.

## Variante de Comunidade

`figure.sdb-quote.sdb-quote--community` é a composição sólida de uma citação compartilhada: ícone de citação, trecho editorial, obra/passagem, referência e procedência declarada. O componente React `BlocoCitacao` aceita `comunidade` para a variante sem original; conserva a cópia com referência. Não representa revisão editorial. A variante usa os tokens e o CSS de Comunidade e está demonstrada em `CardPublicacao/preview.html`.
