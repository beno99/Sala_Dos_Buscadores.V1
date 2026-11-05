# Marca · A Sala dos Buscadores

Síntese do DNA criativo da marca (apresentação em PDF de 28 páginas, removida do repositório e recuperável pelo histórico do git). Este arquivo é a referência de identidade para textos, imagens e componentes. Onde o DNA original e a interface atual divergem, a seção [Divergências](#divergências-do-dna-original) diz qual vale.

## Identidade

| Campo | Valor |
| --- | --- |
| Nome | A Sala dos Buscadores |
| Categoria | Educação e conhecimento espiritual independente |
| Tipo de presença | Produto autoral e plataforma editorial, sem rosto fixo |
| Slogan / ideia-guia | **A porta está aberta. A escada é de quem sobe.** |
| Voz | Curadora de acervo: precisa, serena, didática, firme |
| Símbolo | O arco com escada de degraus (o único símbolo da marca) |

## Propósito, missão e visão

- **Propósito:** tornar o saber espiritual independente acessível a quem o busca, em níveis progressivos, por escolha própria e sem julgamento.
- **Missão:** organizar o saber espiritual independente em trilhas de estudo, publicadas por estudiosos e religiosos, para que qualquer pessoa comece do zero e avance até onde quiser.
- **Visão:** ser, em 5 anos, o principal portal de espiritualidade do Brasil. O DNA marca o prazo e a meta como *[declarado]*, a validar.

## Nome

- "Buscador" é quem procura conhecimento espiritual sem precisar escolher uma linha antes de entrar.
- A palavra descreve o que a pessoa faz agora, não quem ela é. Por isso a marca não diz "nós, os buscadores" e não vira crachá.
- "Sala" é um espaço de consulta individual. Uma comunidade de troca de estudos existe como camada interna, *[declarado]*.
- O nome junta um lugar de permanência (sala) com uma ação em movimento (buscar).

## Ideia e território

- **A porta está aberta. A escada é de quem sobe.** A plataforma oferece o acesso e a estrutura; a pessoa faz o percurso. O arco com a escada dentro carrega essa ideia.
- A neutralidade é o que sustenta a ideia: a marca não conduz. Os degraus são explicados como níveis de trilha, nunca como graus de verdade.
- **Tensão principal:** neutralidade × acesso. Mostrar todas as visões pede densidade; ser acessível pede simplicidade. A decisão do fundador é que a neutralidade prevalece, então o acesso vem da estrutura (trilhas em degraus, linguagem clara) e nunca de recortar visões.

**O que entra:** acervos, livros, manuscritos, gravuras, arquitetura de biblioteca, mãos e gestos de estudo, citações atribuídas.

**O que fica fora:** símbolos de qualquer tradição, misticismo decorativo, estética gótica ou ocultista, promessa de transformação, urgência.

**Três leituras recusadas:** a marca não pode parecer (1) o canal de uma só religião, (2) esoterismo ou artes ocultas, nem (3) ter qualquer tom luciferiano ou de ocultismo.

**Ângulo de diferenciação:** é a única que trata a espiritualidade como acervo, com método, fonte e nível, e não como crença ou ambiente.

## Tradução prática

| Eixo | Regra |
| --- | --- |
| Soar | Descritiva, atribuída, calma. "Segundo esta tradição…", nunca "a verdade é…". |
| Aparecer | Ordem de biblioteca: grade rígida, margens amplas, um único elemento curvo (o arco). |
| Se comportar | Modera a comunidade de forma factual, sem tom de comando; cita a fonte em toda publicação. |
| Escolher referências | Acervos reais e bibliotecas históricas, nunca estética de ritual. |
| Evitar o genérico | Sem cristais, mandalas, lua, velas, fumaça ou gradiente roxo. |

Para o detalhamento de tom e escrita de interface, veja [DIRETRIZES.md](DIRETRIZES.md#conteúdo-e-tom-de-voz).

## Paleta

### Base da marca (DNA)

| Token | Nome | Hex | Papel |
| --- | --- | --- | --- |
| `graphite` | Grafite Profundo | `#111313` | Superfície escura da marca (editorial, redes, vídeo) |
| `damask` | Bege Damasco | `#F6E7CE` | Superfície clara da marca, papel do acervo |
| `bordeaux` | Bordô Rubro | `#390007` | Cor de profundidade: fundos, faixas, blocos |
| `gold` | Gold Texture | `#D3C759` | Textura de folha de ouro, só ornamento |
| `ui-dark` | Dark Mode | `#000000` | Interface da plataforma, modo escuro |
| `ui-light` | White Mode | `#FFFFFF` | Interface da plataforma, modo claro |

Presença visual estimada nas imagens da marca: grafite 47%, ouro 16%, branco-azulado `#EFF5FE` 11%, bege 10%, bordô 8%, preto 6%, branco 3%. É leitura aproximada, não norma.

### Proporção de uso

| Superfície | Modo escuro | Modo claro |
| --- | --- | --- |
| Base (grafite ou damasco) | 60% | 60% |
| Bordô | 25% | 25% |
| Texto (damasco, branco ou grafite) | 10% | 10% |
| Ouro (textura) | 5% | 5% |

### Fundo, arco e degraus

| Fundo | Arco | Degraus |
| --- | --- | --- |
| Preto ou grafite | Branco | Cor do fundo |
| Bege | Bordô | Cor do fundo |
| Bordô | Bege | Cor do fundo |
| Ouro (textura) | Preto | Cor do fundo |

### Contraste (referência do DNA)

| Combinação | Razão | Leitura |
| --- | --- | --- |
| Grafite sobre bege | 15,3 | Excelente |
| Bordô sobre bege | 14,6 | Excelente |
| Branco sobre grafite | 18,6 | Excelente |
| Bege sobre bordô | 14,6 | Excelente |
| Ouro sobre grafite | 10,7 | Bom, mas só como textura |
| Ouro sobre bordô | 10,3 | Bom, mas só como textura |
| Ouro sobre bege | 1,4 | **Ilegível, proibido** |

A verificação vale para os tokens atuais: `node design-system/scripts/contraste.mjs` (AA nos quatro temas).

## Tipografia

| Token | Família no DNA | Família na interface 1.0 | Uso |
| --- | --- | --- | --- |
| `display-caps` | Biges (só maiúsculas) | Gambetta | "SALA" e "DOS" no logo, títulos de impacto em caixa-alta |
| `display-lower` | Hident (maiúsculas e minúsculas) | Fraunces (provisória) | "Buscadores" no logo, títulos editoriais |
| `reading` | Source Serif 4 | Source Serif 4 | Artigos e estudos longos |
| `ui` | Inter | Inter | Menus, botões, legendas, metadados |

Escalas do DNA, para referência: display-xl 96–120 px, display-l 64–80 px, title 32–40 px, body 18–20 px, ui 14–16 px, meta 11–13 px. A interface usa a escala de `tokens.json`, que pode diferir.

## Logo

- Logotipo vertical "SALA / DOS / Buscadores", com fundo escuro, e versão horizontal ainda em construção, com guias.
- Os floreios da logo (S, A, u, s) usam glifos alternativos que não foram renderizados nos testes com as fontes. **Sem logotipo em vetor neste sistema.**
- Até a entrega, escreva o nome em `display-lower` e use o arco como marca.

## Imagem

- Gravuras e fotografias de acervo, com a polaridade luz/sombra da superfície. Duotone grafite → bege é o tratamento da marca (`portal/scripts/duotone-imagens.py`).
- Enquadramento, superfície, luz, pose, produto e ritmo editorial revelam a marca. A imagem não entra como anexo.
- Não há foto de produto. Sem foto disponível, use as placas da marca (bordô, grafite, bege) com o arco.
- Só imagens com direito de uso registrado ou domínio público.

## Linguagens por canal

| Canal | Principal | Apoio |
| --- | --- | --- |
| YouTube | Fotografia de acervo e gravura em movimento | Tipográfico nos créditos de fonte |
| Instagram | Tipográfico, com citação atribuída | Fotografia e ilustração |
| Plataforma | Ilustração e tipografia | Fotografia nas capas de trilha |

## É / Não é

| É | Não é |
| --- | --- |
| Precisa | Dogmática |
| Serena | Sensacionalista |
| Didática | Condescendente |
| Firme | Decorativa |

## Referências visuais estudadas

Os moodboards originais (imagens de Duomo App, Talk Sense, Figma Design System, A&B Testing, badges de conquista e apps de anotação) foram usados apenas como referência de linguagem e não fazem parte do sistema. Nenhum componente depende deles. Estão no histórico do git, na pasta `DESIGN SYSTEM/`.

## Divergências do DNA original

O DNA é anterior à linguagem da interface 1.0. Quando houver conflito, vale a interface:

1. **Tipografia:** o DNA prevê Biges e Hident. A 1.0 usa Gambetta (`display-caps`) e Fraunces como provisória no lugar de Hident, até a entrega dos arquivos licenciados. Gambetta e General Sans estão em `fonts/`, com licença ao lado; Hident não está no repositório.
2. **Paleta da interface:** o DNA define a base damasco `#F6E7CE`. O tema Sólido claro usa a paleta areia aprovada (fundo `bg-canvas` `#EBDCC1`, lateral caramelo, `card-warm`), definida nos tokens. Os tons de texto da paleta areia foram escurecidos o mínimo para passar AA.
3. **Instagram e YouTube:** o DNA registra que não foram analisados. Os @ e URLs estão marcados como "a definir" e o link genérico do YouTube foi removido da interface, sem afetar os links de vídeos.
4. **Visão com prazo:** a meta de "5 anos" e o alcance nacional estão marcados como declarados no DNA e não devem virar frase de produto sem validação.

## Pendências de marca

- Logotipo vertical final, com os floreios renderizados.
- Contas oficiais (@ e URLs) confirmadas.
- Decisão sobre a comunidade interna como camada da marca.
