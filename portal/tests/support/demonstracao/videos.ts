import type { Video } from "@/data/types";

/**
 * Vídeos do canal vinculados às Salas (RF-16). Enquanto o canal não tiver
 * URLs definitivas, os links abrem a busca do YouTube pelo tema do episódio.
 */
const busca = (termo: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(termo)}`;

export const VIDEOS: Video[] = [
  {
    id: "v-nag-hammadi-descoberta",
    sala: "nag-hammadi",
    titulo: "O que foi encontrado em Nag Hammadi",
    duracao: "18:42",
    tema: "conhecimento-interior",
    nivel: 1,
    episodio: "Episódio 3",
    publicadoEm: "2026-09-12",
    url: busca("biblioteca de nag hammadi descoberta 1945"),
    placa: "grafite",
  },
  {
    id: "v-poimandres",
    sala: "corpus-hermeticum",
    titulo: "Poimandres, a mente que fala",
    duracao: "24:10",
    tema: "alma",
    nivel: 2,
    episodio: "Episódio 5",
    publicadoEm: "2026-09-03",
    url: busca("corpus hermeticum poimandres"),
    placa: "bordo",
  },
  {
    id: "v-caibalion-principios",
    sala: "caibalion",
    titulo: "Os sete princípios do Caibalion, lidos devagar",
    duracao: "15:36",
    tema: "origem-do-universo",
    nivel: 1,
    episodio: "Episódio 7",
    publicadoEm: "2026-08-28",
    url: busca("caibalion sete princípios"),
    placa: "grafite",
    conteudos: ["sete-principios-hermeticos"],
  },
  {
    id: "v-urantia-mansoes",
    sala: "urantia",
    titulo: "Os mundos das mansões no Livro de Urântia",
    duracao: "21:05",
    tema: "morte",
    nivel: 2,
    episodio: "Episódio 9",
    publicadoEm: "2026-09-05",
    url: busca("livro de urantia mundos das mansões"),
    placa: "bordo",
  },
  {
    id: "v-evangelho-maria",
    sala: "apocrifos-cristianismo-primitivo",
    titulo: "O Evangelho de Maria e suas páginas perdidas",
    duracao: "19:48",
    tema: "alma",
    nivel: 2,
    episodio: "Episódio 11",
    publicadoEm: "2026-09-10",
    url: busca("evangelho de maria madalena papiro de berlim"),
    placa: "grafite",
  },
];
