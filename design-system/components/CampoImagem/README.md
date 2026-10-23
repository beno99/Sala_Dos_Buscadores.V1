# Campo de imagem

Envio de uma imagem com prévia: imagem da Sala, imagem do card, thumb do artigo, avatar do anfitrião.

## Estrutura
`.sdb-field` > rótulo (`span.sdb-label`) + `.sdb-upload[data-max-mb="5"]` + ajuda (`p.sdb-help`) + erro (`p.sdb-error-msg[data-upload-error]`, `hidden` até haver erro).

- `label.sdb-upload__drop`: a área de toque (fundo `fill`, raio `radius-md`, 144 px de altura mínima), com o ícone `imagem` em disco `accent-soft`, a ação em negrito ("Escolher imagem") e "ou arraste até aqui". Dentro dela, `input.sdb-upload__input[type=file][accept="image/jpeg,image/png,image/webp"]`, visualmente oculto mas focável.
- `figure.sdb-upload__preview`: `<img alt="">` na proporção `--sdb-upload-ratio` (padrão 16 / 9; `.sdb-upload--quadrado` para avatar, 1 / 1 e até 240 px) e `.sdb-upload__bar` com `.sdb-upload__meta` (nome e tamanho) e os botões "Trocar" (`data-upload-replace`) e "Remover" (`data-upload-remove`), `sdb-btn--secondary sdb-btn--sm`.
- Sem contorno tracejado: o tracejado é reservado ao texto da IA.

## Estados
| Estado | Marcação |
| --- | --- |
| Vazio | só a área de toque |
| Arrastando por cima | `.is-over` na área (o mesmo anel duplo do foco) |
| Com imagem | `.has-file` no `.sdb-upload`: a área some e a prévia aparece |
| Erro | `.is-error` (anel `critical`) e a mensagem visível, começando por "Erro:" e dizendo o que aceitar |
| Desabilitado | `.is-disabled` no `.sdb-upload` e `disabled` no input |

## Comportamento (`bundle.js`)
Ao escolher ou soltar um arquivo, confere o tipo pelo `accept` e o tamanho por `data-max-mb`; se passar, mostra a prévia com `URL.createObjectURL`, o nome e o tamanho. "Remover" limpa o campo e devolve o foco ao input. Em React, reimplemente o mesmo com estado.

A conferência no navegador é só conforto: o servidor confere de novo o tipo pelos *magic bytes* do arquivo (não pela extensão) e o tamanho.

## Texto
- Rótulo diz qual imagem é ("Imagem do card", "Imagem da Sala") e marca `opcional` em `<small>` quando for.
- Ajuda: "JPEG, PNG ou WebP, até 5 MB."
- Erros: "Erro: o arquivo precisa ser JPEG, PNG ou WebP." · "Erro: a imagem tem 7,2 MB; o limite é 5 MB."

## Perfil do buscador (out 2026)
Toda conta usa o Campo de imagem no "Editar perfil" para a própria foto (`quadrado`) e a capa. A imagem fica guardada com o dono e só entra no perfil da mesma conta.
