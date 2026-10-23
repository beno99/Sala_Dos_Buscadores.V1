import type { RespostaAssistente } from "../types";

/**
 * Respostas simuladas do assistente (RF-26 a RF-31). Cada trecho é
 * documental, editorial ou síntese da IA, e a síntese aponta a fonte [n]
 * de cada afirmação. Nenhuma resposta indica qual tradição é verdadeira.
 */
export const RESPOSTAS: RespostaAssistente[] = [
  {
    id: "morte-entre-salas",
    exemplo: "O que acontece com a alma após a morte?",
    gatilhos: ["morte", "morrer", "apos a morte", "alem", "vida apos", "morremos", "pos-morte"],
    salas: ["corpus-hermeticum", "apocrifos-cristianismo-primitivo", "nag-hammadi", "urantia"],
    trechosLidos: 14,
    trechos: [
      {
        tipo: "doc",
        rotulo: "Trecho documental · Corpus Hermeticum, Tratado I, 25",
        texto:
          "“E assim o ser humano sobe através da harmonia: à primeira zona entrega a força de crescer e diminuir; à segunda, a astúcia dos males…”",
        refs: [1],
        sala: "corpus-hermeticum",
      },
      {
        tipo: "doc",
        rotulo: "Trecho documental · Evangelho de Maria, BG 8502, p. 16–17",
        texto:
          "“O que me prendia foi morto, o que me cercava foi vencido, meu desejo chegou ao fim e a ignorância morreu.”",
        refs: [2],
        sala: "apocrifos-cristianismo-primitivo",
      },
      {
        tipo: "editorial",
        rotulo: "Interpretação editorial · Helena Prado, Sala Nag Hammadi",
        texto:
          "No ::Apócrifo de João::, só sobem as almas que recebem o *espírito de vida*; as demais voltam a ser presas ao corpo até alcançarem o conhecimento.",
        refs: [3],
        sala: "nag-hammadi",
      },
      {
        tipo: "editorial",
        rotulo: "Interpretação editorial · Equipe da Sala O Livro de Urântia",
        texto:
          "O Documento 47 descreve sete *mundos das mansões*, onde a personalidade que sobrevive à morte desperta e continua a ascensão.",
        refs: [4],
        sala: "urantia",
      },
      {
        tipo: "ai",
        rotulo: "Síntese da IA",
        texto:
          "As Salas descrevem o que vem depois da morte de formas que não se reduzem umas às outras. No Corpus Hermeticum, a alma se despoja do que recebeu de cada esfera [1]. No Evangelho de Maria, ela se liberta respondendo às potências que tentam retê-la [2]. No Apócrifo de João, a subida depende de ter recebido o espírito de vida [3]. No Livro de Urântia, a personalidade desperta em outros mundos e segue aprendendo [4]. O Caibalion não trata do tema diretamente. O acervo não indica qual dessas descrições é verdadeira: cada uma pertence ao seu texto.",
        refs: [1, 2, 3, 4],
      },
    ],
    fontes: [
      {
        titulo: "Corpus Hermeticum, Tratado I",
        referencia: "Fonte primária · §24–26",
        capa: "grafite",
        inicial: "H",
        href: "/salas/corpus-hermeticum/poimandres-subida-pelas-esferas",
      },
      {
        titulo: "Evangelho de Maria",
        referencia: "Fonte primária · Papiro de Berlim 8502",
        capa: "grafite",
        inicial: "M",
        href: "/salas/apocrifos-cristianismo-primitivo/evangelho-de-maria-a-subida-da-alma",
      },
      {
        titulo: "O Apócrifo de João e o mito de Sofia",
        referencia: "Especialista · Sala Nag Hammadi",
        capa: "bordo",
        inicial: "J",
        href: "/salas/nag-hammadi/apocrifo-de-joao-mito-de-sofia",
      },
      {
        titulo: "Documento 47: os sete mundos das mansões",
        referencia: "Fonte primária · O Livro de Urântia, 1955",
        capa: "bege",
        inicial: "U",
        href: "/salas/urantia/documento-47-mundos-das-mansoes",
      },
    ],
  },
  {
    id: "poimandres-criacao",
    exemplo: "Como o Poimandres descreve a criação?",
    gatilhos: ["poimandres", "criacao", "hermes", "hermetica", "corpus hermeticum", "logos", "nous"],
    salas: ["corpus-hermeticum"],
    trechosLidos: 9,
    trechos: [
      {
        tipo: "doc",
        rotulo: "Trecho documental · Corpus Hermeticum, Tratado I, 4",
        texto: "“Vejo uma visão sem limites: tudo se tornara luz, serena e alegre, e, ao vê-la, eu a amei.”",
        refs: [1],
        sala: "corpus-hermeticum",
      },
      {
        tipo: "editorial",
        rotulo: "Interpretação editorial · Equipe da Sala Corpus Hermeticum",
        texto:
          "Os editores destacam que o Poimandres une vocabulário da filosofia grega a imagens próximas ao Gênesis, proximidade discutida pela pesquisa.",
        refs: [2],
        sala: "corpus-hermeticum",
      },
      {
        tipo: "ai",
        rotulo: "Síntese da IA",
        texto:
          "Segundo o Tratado I, Hermes vê primeiro uma luz sem limites, que o texto identifica com a Mente, e depois uma escuridão úmida [1]. Da luz sai o *Logos*, que separa os elementos, e uma segunda Mente, artífice, forma os sete governadores [1][3]. A aproximação com o Gênesis é uma leitura editorial [2]. O texto não diz se deve ser lido como relato literal.",
        refs: [1, 2, 3],
      },
    ],
    fontes: [
      {
        titulo: "Corpus Hermeticum, Tratado I",
        referencia: "Fonte primária · §4–11",
        capa: "grafite",
        inicial: "H",
        href: "/salas/corpus-hermeticum/poimandres-a-mente-que-fala",
      },
      {
        titulo: "Poimandres: a Mente que fala a Hermes",
        referencia: "Editorial curado · Sala Corpus Hermeticum",
        capa: "bordo",
        inicial: "P",
        href: "/salas/corpus-hermeticum/poimandres-a-mente-que-fala",
      },
      {
        titulo: "Hermetica",
        referencia: "Brian P. Copenhaver · Cambridge University Press, 1992",
        capa: "bege",
        inicial: "C",
      },
    ],
  },
  {
    id: "pleroma",
    exemplo: "O que é o Pleroma?",
    gatilhos: ["pleroma", "sofia", "eon", "eons", "demiurgo", "ialdabaoth", "gnose", "gnostico", "arconte"],
    salas: ["nag-hammadi"],
    trechosLidos: 7,
    trechos: [
      {
        tipo: "editorial",
        rotulo: "Interpretação editorial · Verbete do glossário, Sala Nag Hammadi",
        texto:
          "Nos textos gnósticos de Nag Hammadi, o *Pleroma* é a totalidade da esfera divina, habitada pelos *éons*. Segundo o ::Apócrifo de João::, a queda de Sofia ocorre fora dele.",
        refs: [1],
        sala: "nag-hammadi",
      },
      {
        tipo: "editorial",
        rotulo: "Interpretação editorial · Helena Prado, Sala Nag Hammadi",
        texto:
          "O último dos éons, *Sofia*, age sem o consentimento de seu par e dá origem a Ialdabaoth, que molda o mundo material.",
        refs: [2],
        sala: "nag-hammadi",
      },
      {
        tipo: "ai",
        rotulo: "Síntese da IA",
        texto:
          "Pleroma, do grego “plenitude”, é o nome que textos de Nag Hammadi dão à esfera divina completa, formada pelos éons [1]. No mito do Apócrifo de João, o mundo material surge fora do Pleroma, a partir da ação de Sofia [2]. O termo aparece também no Novo Testamento com outros sentidos; esta resposta trata só do uso nos textos gnósticos do acervo.",
        refs: [1, 2],
      },
    ],
    fontes: [
      {
        titulo: "Glossário · Pleroma",
        referencia: "Editorial curado · Sala Nag Hammadi",
        capa: "bordo",
        inicial: "G",
        href: "/salas/nag-hammadi#glossario",
      },
      {
        titulo: "O Apócrifo de João e o mito de Sofia",
        referencia: "Especialista · Sala Nag Hammadi",
        capa: "grafite",
        inicial: "J",
        href: "/salas/nag-hammadi/apocrifo-de-joao-mito-de-sofia",
      },
    ],
  },
  {
    id: "tres-iniciados",
    exemplo: "Quem foram os Três Iniciados?",
    gatilhos: ["tres iniciados", "iniciados", "caibalion", "kybalion", "atkinson", "autoria"],
    salas: ["caibalion"],
    trechosLidos: 6,
    trechos: [
      {
        tipo: "doc",
        rotulo: "Trecho documental · folha de rosto da edição de 1908",
        texto:
          "“The Kybalion: a study of the hermetic philosophy of ancient Egypt and Greece, by Three Initiates.”",
        refs: [1],
        sala: "caibalion",
      },
      {
        tipo: "editorial",
        rotulo: "Interpretação editorial · Tomás Vieira, Sala O Caibalion",
        texto:
          "Pesquisadores como Philip Deslippe atribuem a redação a William Walker Atkinson, escritor do movimento *Novo Pensamento*. O livro nunca confirma a autoria.",
        refs: [2, 3],
        sala: "caibalion",
      },
      {
        tipo: "ai",
        rotulo: "Síntese da IA",
        texto:
          "O livro de 1908 se apresenta como obra de “Três Iniciados”, sem nomes [1]. A hipótese mais citada pela pesquisa atribui o texto a William Walker Atkinson, com base no estilo e na história da editora [2][3]. É uma hipótese, não um fato estabelecido pelo próprio livro.",
        refs: [1, 2, 3],
      },
    ],
    fontes: [
      {
        titulo: "The Kybalion",
        referencia: "Fonte primária · Yogi Publication Society, 1908",
        capa: "bege",
        inicial: "K",
        href: "/salas/caibalion/caibalion-principio-do-mentalismo",
      },
      {
        titulo: "Quem foram os Três Iniciados?",
        referencia: "Especialista · Sala O Caibalion",
        capa: "grafite",
        inicial: "T",
        href: "/salas/caibalion/quem-foram-os-tres-iniciados",
      },
      {
        titulo: "The Kybalion: The Definitive Edition",
        referencia: "Philip Deslippe (ed.) · Tarcher/Penguin, 2011",
        capa: "bordo",
        inicial: "D",
      },
    ],
  },
  {
    id: "qual-e-verdadeira",
    exemplo: "Qual dessas tradições está certa?",
    gatilhos: [
      "verdadeira",
      "verdadeiro",
      "verdade",
      "certa",
      "certo",
      "qual religiao",
      "melhor tradicao",
      "devo seguir",
      "em que acreditar",
    ],
    salas: [],
    trechosLidos: 0,
    trechos: [
      {
        tipo: "ai",
        rotulo: "Síntese da IA · sem trecho do acervo",
        texto:
          "Não cabe ao assistente dizer qual tradição é verdadeira, nem indicar em que acreditar. O que posso fazer é mostrar o que cada Sala diz sobre uma pergunta, com as fontes, para que você compare. Experimente perguntar sobre um tema, como a morte ou a origem do universo, ou abra a busca comparativa.",
        refs: [],
      },
    ],
    fontes: [],
  },
];
