import type { Comparacao } from "../types";

/**
 * Grade comparativa por tema (RF-18, RF-19). Cada Sala responde na própria
 * voz, com termos próprios em *destaque*. Quando a fonte não trata do tema,
 * a coluna fica vazia: a equipe não completa a lacuna.
 */
export const COMPARACOES: Comparacao[] = [
  {
    tema: "morte",
    pergunta: "O que acontece com a alma após a morte?",
    temasLigados: ["morte", "alma"],
    respostas: [
      {
        sala: "apocrifos-cristianismo-primitivo",
        resposta:
          "O ::Apocalipse de Pedro:: (séc. II) narra visões de lugares de *castigo* e de *recompensa* para as almas. No ::Evangelho de Maria::, a alma sobe e responde às potências que tentam retê-la.",
        nivel: 2,
        proveniencia: "curado",
        referencia: "Apocalipse de Pedro, versão etíope · Evangelho de Maria, BG 8502",
        conteudo: "apocalipse-de-pedro-imagens-do-alem",
      },
      {
        sala: "nag-hammadi",
        resposta:
          "Em textos como o ::Apócrifo de João::, a alma que recebeu a *gnose* sobe pelas esferas dos *arcontes* e retorna ao *Pleroma*. A que não despertou volta a ser presa ao mundo material.",
        nivel: 3,
        proveniencia: "primaria",
        referencia: "Apócrifo de João, NHC II,1 · trad. Meyer, 2007",
        conteudo: "apocrifo-de-joao-mito-de-sofia",
      },
      {
        sala: "caibalion",
        vazia: true,
        nota: "O texto não trata da morte de forma explícita. A equipe da Sala não completa a lacuna com interpretação.",
        linkRotulo: "Ver o princípio do mentalismo nesta Sala",
        conteudo: "caibalion-principio-do-mentalismo",
      },
      {
        sala: "corpus-hermeticum",
        resposta:
          "No ::Poimandres:: (Tratado I, 24–26), o corpo se dissolve e a alma sobe pelas sete esferas, devolvendo a cada uma a paixão que dela recebeu, até chegar à *Ogdóade* e entrar em Deus.",
        nivel: 2,
        proveniencia: "primaria",
        referencia: "CH I, 24–26 · trad. Copenhaver, 1992",
        conteudo: "poimandres-subida-pelas-esferas",
      },
      {
        sala: "urantia",
        resposta:
          "O livro descreve a sobrevivência da personalidade: a *alma morontial* desperta nos *mundos das mansões*, onde a ascensão continua sob a guia do *Ajustador do Pensamento*.",
        nivel: 2,
        proveniencia: "curado",
        referencia: "Documentos 47 e 112 · Fundação Urântia, 1955",
        conteudo: "documento-47-mundos-das-mansoes",
      },
    ],
  },
  {
    tema: "alma",
    pergunta: "Como cada tradição descreve a alma?",
    temasLigados: ["alma", "conhecimento-interior"],
    respostas: [
      {
        sala: "apocrifos-cristianismo-primitivo",
        resposta:
          "No ::Evangelho de Maria::, a alma dialoga com potências que a acusam de pertencer a elas; ela responde que as reconhece e se liberta de cada uma.",
        nivel: 2,
        proveniencia: "primaria",
        referencia: "Evangelho de Maria, BG 8502, p. 15–17",
        conteudo: "evangelho-de-maria-a-subida-da-alma",
      },
      {
        sala: "nag-hammadi",
        resposta:
          "A ::Exegese sobre a Alma:: (NHC II,6) descreve a alma como originalmente junto do Pai, caída no corpo e chamada de volta. No ::Apócrifo de João::, ela precisa do *espírito de vida* para subir.",
        nivel: 3,
        proveniencia: "primaria",
        referencia: "NHC II,6 e NHC II,1 · trad. Meyer, 2007",
        conteudo: "apocrifo-de-joao-mito-de-sofia",
      },
      {
        sala: "caibalion",
        vazia: true,
        nota: "O livro fala da mente e do TODO, mas não define a alma. A equipe da Sala não equipara os termos.",
        linkRotulo: "Ler sobre os sete princípios",
        conteudo: "sete-principios-hermeticos",
      },
      {
        sala: "corpus-hermeticum",
        resposta:
          "Segundo o ::Poimandres:: (I, 15), o ser humano é duplo: mortal pelo corpo, imortal pelo *homem essencial*, que vem da Mente.",
        nivel: 2,
        proveniencia: "primaria",
        referencia: "CH I, 15 · trad. Copenhaver, 1992",
        conteudo: "poimandres-a-mente-que-fala",
      },
      {
        sala: "urantia",
        resposta:
          "O livro descreve a alma como uma realidade *morontial* que cresce da cooperação entre a mente humana e o *Ajustador do Pensamento*.",
        nivel: 1,
        proveniencia: "curado",
        referencia: "Documentos 107 e 111 · Fundação Urântia, 1955",
        conteudo: "ajustador-do-pensamento",
      },
    ],
  },
  {
    tema: "meditacao",
    pergunta: "O que as Salas dizem sobre meditação e silêncio?",
    temasLigados: ["meditacao", "conhecimento-interior"],
    respostas: [
      {
        sala: "apocrifos-cristianismo-primitivo",
        vazia: true,
        nota: "Os textos desta Sala tratam de narrativas e visões; nenhum deles descreve uma prática de meditação.",
        linkRotulo: "Ver o que é um apócrifo",
        conteudo: "o-que-e-um-apocrifo",
      },
      {
        sala: "nag-hammadi",
        resposta:
          "O ::Discurso sobre a Oitava e a Nona:: (NHC VI,6), tratado hermético guardado em Nag Hammadi, descreve oração, visão e um *hino silencioso* entre mestre e discípulo.",
        nivel: 3,
        proveniencia: "primaria",
        referencia: "NHC VI,6 · trad. Meyer, 2007",
      },
      {
        sala: "caibalion",
        vazia: true,
        nota: "O livro trata de “transmutação mental”, mas não descreve meditação. A equipe não aproxima os dois termos.",
        linkRotulo: "Ler o capítulo sobre o mentalismo",
        conteudo: "caibalion-principio-do-mentalismo",
      },
      {
        sala: "corpus-hermeticum",
        resposta:
          "No Tratado X, o conhecimento de Deus é descrito como *silêncio divino* e suspensão dos sentidos. O Tratado XIII termina com um hino secreto, recitado depois de um pedido de silêncio.",
        nivel: 3,
        proveniencia: "curado",
        referencia: "CH X, 5 e CH XIII · trad. Copenhaver, 1992",
        conteudo: "tratado-xiii-renascimento-silencio",
      },
      {
        sala: "urantia",
        resposta:
          "O livro fala mais de *oração* e *adoração* do que de meditação. O Documento 91 descreve a evolução da oração, da súplica material à comunhão com Deus.",
        nivel: 2,
        proveniencia: "curado",
        referencia: "Documento 91 · Fundação Urântia, 1955",
      },
    ],
  },
  {
    tema: "origem-do-universo",
    pergunta: "Como o universo começou?",
    temasLigados: ["origem-do-universo"],
    respostas: [
      {
        sala: "apocrifos-cristianismo-primitivo",
        vazia: true,
        nota: "Os textos desta Sala tratam das origens de Jesus e das comunidades, não da origem do cosmos.",
        linkRotulo: "Ver os textos desta Sala",
      },
      {
        sala: "nag-hammadi",
        resposta:
          "O ::Apócrifo de João:: e ::Sobre a Origem do Mundo:: (NHC II,5) narram emanações do Espírito invisível até *Sofia*, cuja ação gera *Ialdabaoth*, o *demiurgo* que molda o mundo material.",
        nivel: 3,
        proveniencia: "curado",
        referencia: "NHC II,1 e NHC II,5 · trad. Meyer, 2007",
        conteudo: "apocrifo-de-joao-mito-de-sofia",
      },
      {
        sala: "caibalion",
        resposta:
          "Segundo o livro, o universo é uma criação mental do *TODO*: “O TODO é MENTE; o Universo é Mental.”",
        nivel: 1,
        proveniencia: "primaria",
        referencia: "The Kybalion, cap. II · 1908",
        conteudo: "caibalion-principio-do-mentalismo",
      },
      {
        sala: "corpus-hermeticum",
        resposta:
          "No ::Poimandres::, Hermes vê uma luz sem limites, que é a Mente, e uma escuridão úmida. Da luz sai o *Logos*, que separa os elementos e ordena o cosmos.",
        nivel: 1,
        proveniencia: "curado",
        referencia: "CH I, 4–11 · trad. Copenhaver, 1992",
        conteudo: "poimandres-a-mente-que-fala",
      },
      {
        sala: "urantia",
        resposta:
          "O livro descreve um universo centrado na Ilha do *Paraíso*, cercada por *Havona* e por sete superuniversos. O Documento 57 narra a formação do sistema solar.",
        nivel: 3,
        proveniencia: "curado",
        referencia: "Documentos 11–14 e 57 · Fundação Urântia, 1955",
        conteudo: "o-universo-segundo-urantia",
      },
    ],
  },
  {
    tema: "conhecimento-interior",
    pergunta: "O que é conhecer a si mesmo em cada tradição?",
    temasLigados: ["conhecimento-interior", "alma"],
    respostas: [
      {
        sala: "apocrifos-cristianismo-primitivo",
        resposta:
          "No ::Evangelho de Maria::, o ensinamento afirma que “o *Filho do Homem* está dentro de vós” e pede que se siga essa presença.",
        nivel: 2,
        proveniencia: "primaria",
        referencia: "Evangelho de Maria, BG 8502 · trad. King, 2003",
        conteudo: "evangelho-de-maria-a-subida-da-alma",
      },
      {
        sala: "nag-hammadi",
        resposta:
          "No ::Evangelho de Tomé::, dito 3, o *Reino* está “dentro de vós e fora de vós”; quem conhece a si mesmo será conhecido.",
        nivel: 2,
        proveniencia: "primaria",
        referencia: "Evangelho de Tomé, dito 3 · NHC II,2",
        conteudo: "evangelho-de-tome-ditos-1-a-3",
      },
      {
        sala: "caibalion",
        resposta:
          "O livro abre com a máxima de que “os lábios da sabedoria estão fechados, exceto para os ouvidos do *entendimento*”: o ensinamento só se revela a quem está pronto.",
        nivel: 1,
        proveniencia: "curado",
        referencia: "The Kybalion, introdução · 1908",
        conteudo: "sete-principios-hermeticos",
      },
      {
        sala: "corpus-hermeticum",
        resposta:
          "Segundo o Tratado XI, quem não se torna semelhante a Deus não pode compreender Deus. O conhecimento é descrito como transformação de quem conhece.",
        nivel: 3,
        proveniencia: "curado",
        referencia: "CH XI, 20 · trad. Copenhaver, 1992",
        conteudo: "tratado-xiii-renascimento-silencio",
      },
      {
        sala: "urantia",
        resposta:
          "O livro associa o autoconhecimento à relação com o *Ajustador do Pensamento*, presença divina que, segundo o texto, habita a mente.",
        nivel: 1,
        proveniencia: "curado",
        referencia: "Documento 107 · Fundação Urântia, 1955",
        conteudo: "ajustador-do-pensamento",
      },
    ],
  },
];
