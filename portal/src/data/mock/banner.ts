/*
 * Episódios do canal em destaque no banner do Portal. O título vem em dois
 * tons; o vídeo (duração, link) vem do acervo publicado.
 */
export interface DestaqueDoCanal {
  video: string;
  titulo: [string, string];
  sub: string;
}

export const DESTAQUES_DO_CANAL: DestaqueDoCanal[] = [
  {
    video: "v-poimandres",
    titulo: ["Poimandres,", "a mente que fala"],
    sub: "Leitura comentada do primeiro tratado do Corpus Hermeticum, com o texto grego ao lado.",
  },
  {
    video: "v-evangelho-maria",
    titulo: ["O Evangelho de Maria", "e suas páginas perdidas"],
    sub: "O que o papiro de Berlim preserva, o que se perdeu e como os estudiosos leem as lacunas.",
  },
  {
    video: "v-caibalion-principios",
    titulo: ["Os sete princípios do Caibalion,", "lidos devagar"],
    sub: "O livro de 1908, princípio por princípio: o que cada um afirma e de onde vem a ideia.",
  },
];
