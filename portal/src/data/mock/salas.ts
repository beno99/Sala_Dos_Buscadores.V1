import type { Sala } from "../types";

/**
 * Salas do primeiro ciclo editorial (DRS, cap. 1). A ordem é alfabética
 * pelo nome, para não sugerir hierarquia de importância.
 */
export const SALAS: Sala[] = [
  {
    slug: "apocrifos-cristianismo-primitivo",
    nome: "Apócrifos do Cristianismo Primitivo",
    tradicao: "Cristianismo dos séc. I–IV · textos fora do cânone",
    tradicaoCurta: "Cristianismo dos séc. I–IV",
    descricao:
      "Evangelhos, atos e apocalipses que circularam entre as primeiras comunidades cristãs e ficaram fora do cânone. A Sala apresenta cada texto no seu contexto de composição e de recepção, sem julgar sua legitimidade.",
    periodo: "séc. I – IV",
    placa: "grafite",
    atualizadaEm: "2026-09-10",
    inicial: "A",
    origem: "oficial",
    naComparacao: true,
  },
  {
    slug: "nag-hammadi",
    nome: "Biblioteca de Nag Hammadi",
    tradicao: "Gnosticismo cristão · 13 códices coptas",
    tradicaoCurta: "Gnosticismo cristão",
    descricao:
      "Treze códices de papiro em copta, encontrados em 1945 perto de Nag Hammadi, no Alto Egito. Reúnem 52 tratados, entre eles o Evangelho de Tomé e o Apócrifo de João, copiados no século IV.",
    periodo: "composição séc. II – III · cópias do séc. IV",
    placa: "bordo",
    atualizadaEm: "2026-09-12",
    inicial: "N",
    origem: "oficial",
    naComparacao: true,
  },
  {
    slug: "corpus-hermeticum",
    nome: "Corpus Hermeticum",
    tradicao: "Hermetismo greco-egípcio · séc. I–III",
    tradicaoCurta: "Hermetismo",
    descricao:
      "Tratados em grego atribuídos a Hermes Trismegisto, compostos provavelmente entre os séculos I e III no Egito romano. O primeiro, o Poimandres, narra a origem do cosmos e a subida da alma.",
    periodo: "séc. I – III",
    placa: "grafite",
    atualizadaEm: "2026-09-03",
    inicial: "H",
    origem: "oficial",
    naComparacao: true,
  },
  {
    slug: "caibalion",
    nome: "O Caibalion",
    tradicao: "Hermetismo moderno · Chicago, 1908",
    tradicaoCurta: "Hermetismo moderno",
    descricao:
      "Livro publicado em 1908 sob a assinatura “Três Iniciados”, que apresenta sete princípios atribuídos ao hermetismo. A Sala separa o que o texto afirma do debate histórico sobre sua autoria e suas fontes.",
    periodo: "1908",
    placa: "bege",
    atualizadaEm: "2026-08-28",
    inicial: "K",
    origem: "oficial",
    naComparacao: true,
  },
  {
    slug: "urantia",
    nome: "O Livro de Urântia",
    tradicao: "Revelação do séc. XX · Chicago, 1955",
    tradicaoCurta: "Revelação do séc. XX",
    descricao:
      "Obra de 196 documentos publicada em 1955 pela Fundação Urântia, em Chicago, que se apresenta como revelação. Trata de Deus, do universo, da história da Terra e da vida de Jesus.",
    periodo: "1955",
    placa: "bordo",
    atualizadaEm: "2026-09-05",
    inicial: "U",
    origem: "oficial",
    naComparacao: true,
  },
];
