import type { SalaSlug } from "../types";

/*
 * Trilhas de estudo (RF-22, RF-23): uma por Sala, do contexto à comparação.
 * Degraus de leitura apontam para conteúdos publicados da Sala, do nível
 * iniciante ao avançado. Sem ranking nem pontuação (RF-24).
 */
export interface DegrauTrilha {
  titulo: string;
  descricao: string;
  /** Slug do conteúdo da Sala, quando o degrau é uma leitura. */
  conteudo?: string;
}

export interface Trilha {
  sala: SalaSlug;
  titulo: string;
  degraus: DegrauTrilha[];
}

const abrir = (nome: string): DegrauTrilha => ({
  titulo: "Contexto da Sala",
  descricao: `Abrir a Sala ${nome} e ler a apresentação, a linha do tempo e o glossário.`,
});
const comparar: DegrauTrilha = {
  titulo: "Comparar um tema",
  descricao: "Ver o mesmo tema respondido por todas as Salas, lado a lado.",
};

export const TRILHAS: Trilha[] = [
  {
    sala: "corpus-hermeticum",
    titulo: "Primeiros passos no Corpus Hermeticum",
    degraus: [
      abrir("Corpus Hermeticum"),
      {
        titulo: "A mente que fala",
        descricao: "O que o Tratado I narra.",
        conteudo: "poimandres-a-mente-que-fala",
      },
      {
        titulo: "A subida pelas esferas",
        descricao: "Fonte primária, com tradução.",
        conteudo: "poimandres-subida-pelas-esferas",
      },
      {
        titulo: "Renascimento e silêncio",
        descricao: "Tratado XIII.",
        conteudo: "tratado-xiii-renascimento-silencio",
      },
      comparar,
    ],
  },
  {
    sala: "nag-hammadi",
    titulo: "Primeiros passos em Nag Hammadi",
    degraus: [
      abrir("Biblioteca de Nag Hammadi"),
      {
        titulo: "Ditos 1 a 3",
        descricao: "Fonte primária do Evangelho de Tomé.",
        conteudo: "evangelho-de-tome-ditos-1-a-3",
      },
      { titulo: "Os 114 ditos", descricao: "Leitura comentada.", conteudo: "evangelho-de-tome-114-ditos" },
      {
        titulo: "O mito de Sofia",
        descricao: "Apócrifo de João.",
        conteudo: "apocrifo-de-joao-mito-de-sofia",
      },
      comparar,
    ],
  },
  {
    sala: "caibalion",
    titulo: "Primeiros passos no Caibalion",
    degraus: [
      abrir("O Caibalion"),
      {
        titulo: "O princípio do mentalismo",
        descricao: "Fonte primária.",
        conteudo: "caibalion-principio-do-mentalismo",
      },
      { titulo: "Os sete princípios", descricao: "Visão geral.", conteudo: "sete-principios-hermeticos" },
      {
        titulo: "Quem foram os Três Iniciados",
        descricao: "Autoria e contexto.",
        conteudo: "quem-foram-os-tres-iniciados",
      },
      comparar,
    ],
  },
  {
    sala: "urantia",
    titulo: "Primeiros passos no Livro de Urântia",
    degraus: [
      abrir("O Livro de Urântia"),
      {
        titulo: "Ajustador do Pensamento",
        descricao: "Um conceito central.",
        conteudo: "ajustador-do-pensamento",
      },
      {
        titulo: "Os mundos das mansões",
        descricao: "Documento 47.",
        conteudo: "documento-47-mundos-das-mansoes",
      },
      {
        titulo: "O universo segundo Urântia",
        descricao: "Cosmologia.",
        conteudo: "o-universo-segundo-urantia",
      },
      comparar,
    ],
  },
  {
    sala: "apocrifos-cristianismo-primitivo",
    titulo: "Primeiros passos nos Apócrifos",
    degraus: [
      abrir("Apócrifos do Cristianismo Primitivo"),
      { titulo: "O que é um apócrifo", descricao: "Cânone e fora dele.", conteudo: "o-que-e-um-apocrifo" },
      {
        titulo: "A subida da alma",
        descricao: "Evangelho de Maria.",
        conteudo: "evangelho-de-maria-a-subida-da-alma",
      },
      {
        titulo: "Imagens do além",
        descricao: "Apocalipse de Pedro.",
        conteudo: "apocalipse-de-pedro-imagens-do-alem",
      },
      comparar,
    ],
  },
];

export const trilhaDaSala = (sala: SalaSlug) => TRILHAS.find((t) => t.sala === sala);
