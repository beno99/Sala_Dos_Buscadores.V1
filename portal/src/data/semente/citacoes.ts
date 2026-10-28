import type { Citacao } from "../types";

/**
 * Trechos de fonte primária (RF-15): só excertos curtos, sempre com
 * referência bibliográfica completa.
 */
export const CITACOES: Citacao[] = [
  {
    id: "tome-dito-2",
    sala: "nag-hammadi",
    obra: "Evangelho de Tomé",
    localizacao: "Dito 2 · NHC II,2",
    proveniencia: "primaria",
    traducao:
      "“Quem busca não pare de buscar até encontrar. Quando encontrar, ficará perturbado; e, perturbado, ficará maravilhado, e reinará sobre o Todo.”",
    rotuloTraducao: "Tradução · original copta não exibido nesta edição",
    referencia:
      "Evangelho de Tomé, dito 2 (NHC II,2). Tradução da equipe da Sala a partir de MEYER, Marvin (ed.). The Nag Hammadi Scriptures. Nova York: HarperOne, 2007.",
    capa: "bordo",
    inicial: "T",
  },
  {
    id: "poimandres-26",
    sala: "corpus-hermeticum",
    obra: "Poimandres",
    localizacao: "Corpus Hermeticum, Tratado I, 26",
    proveniencia: "primaria",
    original: {
      texto: "“τοῦτό ἐστι τὸ ἀγαθὸν τέλος τοῖς γνῶσιν ἐσχηκόσι, θεωθῆναι.”",
      lang: "grc",
      idioma: "grego koiné, séc. I–III",
    },
    traducao: "“Este é o bom fim para os que alcançaram o conhecimento: ser divinizados.”",
    referencia:
      "CORPUS HERMETICUM, Tratado I, 26. Tradução da equipe da Sala, cotejada com COPENHAVER, Brian P. (trad.). Hermetica. Cambridge: Cambridge University Press, 1992.",
    capa: "grafite",
    inicial: "H",
  },
  {
    id: "caibalion-mentalismo",
    sala: "caibalion",
    obra: "O Caibalion",
    localizacao: "Capítulo II · O princípio do mentalismo",
    proveniencia: "primaria",
    original: { texto: "“The ALL is MIND; The Universe is Mental.”", lang: "en", idioma: "inglês, 1908" },
    traducao: "“O TODO é MENTE; o Universo é Mental.”",
    referencia:
      "TRÊS INICIADOS. The Kybalion: a study of the hermetic philosophy of ancient Egypt and Greece. Chicago: Yogi Publication Society, 1908. Cap. II.",
    capa: "bege",
    inicial: "K",
  },
  {
    id: "urantia-doc-1",
    sala: "urantia",
    obra: "O Livro de Urântia",
    localizacao: "Documento 1 · O Pai Universal, introdução",
    proveniencia: "primaria",
    original: {
      texto:
        "“THE Universal Father is the God of all creation, the First Source and Center of all things and beings.”",
      lang: "en",
      idioma: "inglês, 1955",
    },
    traducao:
      "“O Pai Universal é o Deus de toda a criação, a Primeira Fonte e Centro de todas as coisas e seres.”",
    referencia:
      "FUNDAÇÃO URÂNTIA. The Urantia Book. Chicago: Urantia Foundation, 1955. Documento 1, introdução.",
    capa: "bordo",
    inicial: "U",
  },
  {
    id: "maria-subida",
    sala: "apocrifos-cristianismo-primitivo",
    obra: "Evangelho de Maria",
    localizacao: "Papiro de Berlim 8502 · p. 16–17",
    proveniencia: "primaria",
    traducao:
      "“O que me prendia foi morto, o que me cercava foi vencido, meu desejo chegou ao fim e a ignorância morreu.”",
    rotuloTraducao: "Tradução · original copta não exibido nesta edição",
    referencia:
      "Evangelho de Maria, Papiro de Berlim 8502, p. 16–17. Tradução da equipe da Sala a partir de KING, Karen L. The Gospel of Mary of Magdala. Santa Rosa: Polebridge Press, 2003.",
    capa: "grafite",
    inicial: "M",
  },
];
