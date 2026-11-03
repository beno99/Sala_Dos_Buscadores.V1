# Editor de anúncio

Tela em que o anfitrião cria a publicidade e vê, ao vivo, como ela aparecerá no Portal. Nada vai ao ar daqui: o anúncio é salvo como rascunho e enviado à curadoria, que aprova ou reprova com motivo.

## Anatomia
- `div.sdb-ad-editor`: duas colunas no desktop; abaixo de 960 px, uma coluna (prévia depois do formulário).
- `form.sdb-ad-editor__form` com, nesta ordem:
  1. **Imagem do produto** (obrigatória): o CampoImagem com a finalidade `anuncio` (1.200 × 900 px, 4:3, JPEG, PNG ou WebP até 5 MB).
  2. **Categoria** (opcional, até 40): linha curta acima do título, em `label-brand`.
  3. **Título** (obrigatório, até 80).
  4. **Descrição** (obrigatória, até 240): a AreaTexto com contador.
  5. **Link do produto** (obrigatório, só `https://`).
  6. **Nome do anunciante** (obrigatório, até 80).
  7. Accordion **Texto do link e acessibilidade**: texto do link (padrão “Conhecer o produto”) e a descrição da imagem para leitores de tela (obrigatória para enviar).
- Rótulo com contador: `.sdb-ad-editor__label` com o nome à esquerda e `<small>` à direita (“Obrigatória”, “Opcional”, “18/80”). O contador é `aria-hidden`; o limite real é o `maxlength`.
- `aside.sdb-ad-editor__preview` (fixa ao rolar no desktop): cabeçalho `.sdb-ad-editor__preview-head` com “Prévia do anúncio” e `.sdb-ad-editor__live` “Ao vivo” (ponto em `positive`), o anúncio `sdb-ad--portal` exatamente como sai no Portal e `.sdb-ad-editor__caption` “Assim seu anúncio aparecerá no Portal.”
- `.sdb-ad-editor__actions`: “Salvar rascunho” (secundário) e “Enviar para revisão” (primário). O checklist de envio fica ao lado, na área do anfitrião.

## Anúncio no Portal (`sdb-ad--portal`)
Ordem: `.sdb-ad__label` PUBLICIDADE, `.sdb-ad__media` com a imagem (o `alt` é a descrição dada pelo anfitrião), `.sdb-ad__category`, `.sdb-ad__title` (Fraunces), `.sdb-ad__text`, `a.sdb-ad__link` com ícone `externo` (`rel="sponsored noopener noreferrer"`, nova aba) e `.sdb-ad__foot` com o anunciante. Sem categoria, a linha some. Mora na coluna direita da Home, logo abaixo de “Seu caminho”.

## Regras
- Política (DRS): curadoria editorial; vedados charlatanismo, promessa de cura, manipulação religiosa e urgência. O editor avisa (sem bloquear) quando o texto usa expressões que a curadoria costuma recusar.
- Visual distinto do acervo: sem Selo de proveniência, sem tracejado de IA. “Publicidade” e o anunciante sempre visíveis.
- Editar um anúncio no ar tira o anúncio do ar até a nova aprovação; o editor pede confirmação.
- Nos exemplos, só anunciantes fictícios marcados como tais. Nenhuma marca real.
