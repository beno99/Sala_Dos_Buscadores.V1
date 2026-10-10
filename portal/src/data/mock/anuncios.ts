import type { Placa } from "../types";

/*
 * Anúncios fictícios, coerentes com o produto. Nenhuma marca real. Política
 * (DRS): curadoria editorial; vedados charlatanismo, promessa de cura e
 * manipulação religiosa; sem contagem regressiva nem urgência.
 */
export interface Anuncio {
  id: string;
  anunciante: string;
  /** Título em dois tons: a segunda parte sai em label-secondary. */
  titulo: [string, string];
  texto: string;
  chamada: string;
  href: string;
  placa: Placa;
  /** Até dois atributos com ícone, mostrados no anúncio do painel. */
  atributos?: { icone: "fontePrimaria" | "glossario" | "relogio" | "artigo"; texto: string }[];
  locais: ("banner" | "painel")[];
}

export const ANUNCIOS: Anuncio[] = [
  {
    id: "edicoes-portico",
    anunciante: "Edições Pórtico (anunciante fictício)",
    titulo: ["Textos antigos em domínio público", "em edição de bolso, com notas"],
    texto: "Coleção com traduções revisadas e referência à edição de origem de cada texto.",
    chamada: "Conhecer a coleção",
    href: "https://example.com/edicoes-portico",
    placa: "bordo",
    atributos: [
      { icone: "fontePrimaria", texto: "Domínio público" },
      { icone: "glossario", texto: "Notas de tradução" },
    ],
    locais: ["banner", "painel"],
  },
  {
    id: "curso-linguas-antigas",
    anunciante: "Curso Livre de Línguas Antigas (anunciante fictício)",
    titulo: ["Grego koiné", "para leitores de textos antigos"],
    texto: "Turmas aos sábados, com leitura de trechos do Corpus Hermeticum no original.",
    chamada: "Ver as turmas",
    href: "https://example.com/curso-linguas-antigas",
    placa: "grafite",
    locais: ["banner"],
  },
];
