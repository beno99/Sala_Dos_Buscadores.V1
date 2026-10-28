import type { Tema } from "../types";

/**
 * Temas transversais (RF-17, RF-21). Nenhum usa vocabulário de uma só
 * tradição. Sinônimos sem acento e em minúsculas.
 */
export const TEMAS: Tema[] = [
  {
    slug: "morte",
    nome: "Morte",
    sinonimos: [
      "morte",
      "morrer",
      "morremos",
      "apos a morte",
      "vida apos a morte",
      "pos-morte",
      "alem",
      "outra vida",
      "sobrevivencia",
      "fim da vida",
    ],
  },
  {
    slug: "alma",
    nome: "Alma",
    sinonimos: ["alma", "almas", "psique", "espirito humano", "essencia humana"],
  },
  {
    slug: "meditacao",
    nome: "Meditação",
    sinonimos: ["meditacao", "meditar", "silencio", "oracao", "orar", "prece", "contemplacao", "hino"],
  },
  {
    slug: "origem-do-universo",
    nome: "Origem do universo",
    sinonimos: [
      "origem do universo",
      "universo",
      "criacao",
      "cosmos",
      "cosmogonia",
      "origem do mundo",
      "como o mundo comecou",
      "comeco de tudo",
    ],
  },
  {
    slug: "conhecimento-interior",
    nome: "Conhecimento interior",
    sinonimos: [
      "conhecimento interior",
      "autoconhecimento",
      "gnose",
      "conhecer a si",
      "conhece-te",
      "conhecimento de si",
      "interior",
    ],
  },
];
