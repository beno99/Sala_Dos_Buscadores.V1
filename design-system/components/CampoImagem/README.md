# Campo de imagem

Envio de uma imagem com prévia: imagem da Sala, imagem do card, thumb do artigo, avatar do anfitrião.

## Estrutura (revisão de 03/11/2026)
`.sdb-field.sdb-image-field` > `.sdb-upload__header` + `.sdb-upload` + orientação de exibição/ajuda + avisos + erro.

**Regra de alinhamento (critério de aprovação, igual no desktop e no celular):** o que está acima e abaixo da área fica à esquerda, começando na borda esquerda da área tracejada (sem recuo extra); o que está dentro da área fica centralizado.

- Acima, à esquerda: `.sdb-upload__header` empilha o rótulo (`.sdb-label`, diz qual imagem é, com `<small>opcional</small>` logo ao lado) e, embaixo, a descrição curta (`.sdb-upload__description`, o que enviar). Nunca coloque a descrição ao lado do rótulo.
- Dentro, centralizado: `.sdb-upload` é a superfície com fundo sutil (`--fill`), borda tracejada, raio `radius-lg`, cores dos quatro temas e anel de foco/arraste. Toda a superfície recebe arquivos arrastados, inclusive a região dos requisitos e a prévia.
  - `label.sdb-upload__drop`: ícone de envio e “Clique para enviar ou arraste a imagem aqui”, com o input JPEG/PNG/WebP visualmente oculto e focável pelo teclado.
  - `p.sdb-upload__requirements`: “Recomendado: largura × altura”, “Largura × altura · proporção X:Y” (e “· altura livre” quando aplicável), formatos e selo “Até 5 MB”. Continua visível após escolher o arquivo. O respiro em cima do ícone é igual ao de baixo dos requisitos (32 px; 24 px em campos com até 360 px).
  - `figure.sdb-upload__preview`: imagem inteira na proporção da finalidade, ou altura livre. Apenas o avatar usa recorte circular. A barra informa nome, dimensões reais, proporção e tamanho, com “Trocar” e “Remover” (nessa ordem), também no avatar.
- Abaixo, à esquerda: `.sdb-help` com a orientação de como a imagem aparece, ajudas editoriais, aviso de resolução (`role="status"`) e `.sdb-error-msg` (`role="alert"`). Dentro do `.sdb-image-field` esses textos perdem o recuo de 4 px das outras peças para alinhar com a borda da área.
- Descrição, requisitos, exibição, ajuda, aviso e erro são associados ao input com `aria-describedby`.

## Estados
| Estado | Marcação |
| --- | --- |
| Vazio | só a área de toque |
| Arrastando por cima | `.is-over` no `.sdb-upload` (o mesmo anel duplo do foco) |
| Com imagem | `.has-file` no `.sdb-upload`: a ação inicial some, a prévia aparece e os requisitos continuam visíveis |
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
Use `.sdb-upload--livre` e `data-recommended-width="1472"` (React: `finalidade="corpo-artigo"`). A ajuda deve aparecer antes da escolha: “Recomendado: pelo menos 1.472 px de largura para leitura nítida em telas 2× (coluna de até 736 px). A altura é livre; a imagem aparece inteira, sem recorte. JPEG, PNG ou WebP, até 5 MB.” A conta vem da coluna do CorpoArtigo: 46rem × 16 px × 2 = 1472 px.

A prévia preserva toda a imagem (`height: auto`, sem proporção forçada nem `cover`). Após envio, mostra largura × altura em pixels e tamanho do arquivo. Imagens existentes mostram dimensões ao carregar; se os metadados de tamanho não estão disponíveis, informa isso sem inventar valor. Largura menor que a recomendação gera aviso de nitidez, sem bloquear. O limite de 5 MB aplica-se ao original, igual ao servidor.

O portal guarda os bytes originais: nenhuma redução, conversão ou recompressão substitui o arquivo enviado. Qualquer otimização futura deve gerar outro arquivo, mantendo o original e sua referência. A prévia local do catálogo não envia arquivos a servidor.

## Dimensões por finalidade (revisão de 31/10/2026)
Todo campo informa, **antes da escolha do arquivo**, a largura × altura recomendadas em pixels, a proporção, os formatos e o limite dentro de `p.sdb-upload__requirements`. O cabeçalho traz uma descrição breve abaixo do rótulo; abaixo da área, a ajuda explica como a imagem aparece. Todos são ligados ao input por `aria-describedby`. Os números vêm de uma fonte única no portal (`portal/src/features/midia/finalidades.ts`; React: `finalidade="banner-sala"` etc.), a mesma que alimenta o manual de operação.

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

