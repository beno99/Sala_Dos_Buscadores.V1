# Campo de imagem

Envio de uma imagem com prévia: imagem da Sala, imagem do card, thumb do artigo, avatar do anfitrião.

## Estrutura
`.sdb-field` > rótulo (`span.sdb-label`) + ajuda (`p.sdb-help`, antes da escolha) + `.sdb-upload[data-max-mb="5"]` + erro (`p.sdb-error-msg[data-upload-error]`, `hidden` até haver erro).

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
Ao escolher ou soltar um arquivo, confere o tipo pelo `accept` e o tamanho por `data-max-mb`; se passar, mostra a prévia com `URL.createObjectURL`, o nome, as dimensões naturais e o tamanho. "Remover" limpa o campo e devolve o foco ao input. Em React, reimplemente o mesmo com estado.

A conferência no navegador é só conforto: o servidor confere de novo o tipo pelos *magic bytes* do arquivo (não pela extensão) e o tamanho.

## Texto
- Rótulo diz qual imagem é ("Imagem do card", "Imagem da Sala") e marca `opcional` em `<small>` quando for.
- Ajuda: "JPEG, PNG ou WebP, até 5 MB."
- Erros: "Erro: o arquivo precisa ser JPEG, PNG ou WebP." · "Erro: a imagem tem 7,2 MB; o limite é 5 MB."

## Perfil do buscador (out 2026)
Toda conta usa o Campo de imagem no "Editar perfil" para a própria foto (`quadrado`) e a capa. A imagem fica guardada com o dono e só entra no perfil da mesma conta.

## Imagem do corpo do artigo
Use `.sdb-upload--corpo` e `data-recommended-width="1472"` (React: `corpoArtigo`). A ajuda deve aparecer antes da escolha: “Recomendado: pelo menos 1.472 px de largura para leitura nítida em telas 2× (coluna de até 736 px). A altura é livre; a imagem aparece inteira, sem recorte. JPEG, PNG ou WebP, até 5 MB.” A conta vem da coluna do CorpoArtigo: 46rem × 16 px × 2 = 1472 px.

A prévia preserva toda a imagem (`height: auto`, sem proporção forçada nem `cover`). Após envio, mostra largura × altura em pixels e tamanho do arquivo. Imagens existentes mostram dimensões ao carregar; se os metadados de tamanho não estão disponíveis, informa isso sem inventar valor. Largura menor que a recomendação gera aviso de nitidez, sem bloquear. O limite de 5 MB aplica-se ao original, igual ao servidor.

O portal guarda os bytes originais: nenhuma redução, conversão ou recompressão substitui o arquivo enviado. Qualquer otimização futura deve gerar outro arquivo, mantendo o original e sua referência. A prévia local do catálogo não envia arquivos a servidor.

## Dimensões por finalidade (revisão de 31/10/2026)
Todo campo informa, **antes da escolha do arquivo**, a largura × altura recomendadas em pixels, a proporção, os formatos, o limite e como a imagem vai aparecer: `p.sdb-upload__guide` logo abaixo do rótulo, ligado ao input por `aria-describedby`. Os números vêm de uma fonte única no portal (`portal/src/features/midia/finalidades.ts`; React: `finalidade="banner-sala"` etc.), a mesma que alimenta o manual de operação.

| Finalidade | Recomendado (largura × altura) | Proporção | Exibição |
| --- | --- | --- | --- |
| Banner da Sala | 2.400 × 800 px | 3:1 | inteira, na largura da página; altura acompanha o arquivo |
| Imagem do card da Sala | 1.200 × 1.800 px | 2:3 | inteira no card vertical; sobra fundo |
| Imagem do card do artigo | 1.600 × 1.000 px | 16:10 | inteira no card; sobra fundo |
| Imagem de topo do artigo | 2.400 × 800 px | 3:1 | inteira, na largura da página; altura acompanha o arquivo |
| Imagem do corpo do artigo | 1.472 × 981 px | 3:2 | inteira, na coluna de texto; altura acompanha o arquivo |
| Foto de perfil | 512 × 512 px | 1:1 | círculo (envie quadrada) |
| Capa do perfil | 2.400 × 480 px | 5:1 | inteira; sobra fundo |
| Imagem da publicação (Comunidade) | 1.440 × 1.080 px | 4:3 | inteira; altura acompanha o arquivo |

- A prévia segue a regra da página pública: `object-fit: contain` na proporção da finalidade (`--sdb-upload-ratio`), ou altura livre com `.sdb-upload--livre`. Só a foto de perfil é mostrada em círculo, como no Avatar.
- Depois da escolha, a barra mostra largura × altura reais, proporção e tamanho. Abaixo do recomendado ou fora da proporção gera aviso (`role="status"`) que **não bloqueia**; só formato, arquivo inválido e o limite de 5 MB bloqueiam. Em erro, a imagem anterior e o resto do formulário ficam como estavam.

