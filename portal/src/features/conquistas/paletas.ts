import type { CSSProperties } from "react";
/** Arte de uma gema: paleta, semente e estilo do `solid-orb.js` (Conquista 1.1). */
export interface ArteConquista {
  gema: string;
  sentido: string;
  /** Cor principal, luz e fundo. */
  colors: [string, string, string];
  seed: number;
  style: number;
  /** Degradê do topo em duas cores (Turmalina bicolor). */
  bicolor?: boolean;
}

/** Identidade visual da coleção aprovada. A cor nunca determina a concessão. */
export const PALETAS = {
  "primeiro-passo": {
    gema: "Citrino",
    sentido: "Toda busca começa com uma descoberta.",
    colors: ["#EDAD25", "#FFF0A3", "#AE5410"],
    seed: 2,
    style: 0,
  },
  "palavra-por-palavra": {
    gema: "Esmeralda",
    sentido: "Cada palavra abre uma possibilidade de leitura.",
    colors: ["#079F70", "#A7EDBD", "#064D3E"],
    seed: 5,
    style: 1,
  },
  "na-fonte": {
    gema: "Cristal de rocha",
    sentido: "Um encontro direto com as palavras da fonte.",
    colors: ["#B8D5DF", "#F5FBFA", "#42758C"],
    seed: 11,
    style: 2,
  },
  "alem-da-primeira-leitura": {
    gema: "Safira",
    sentido: "Voltar ao texto também é seguir adiante.",
    colors: ["#2452DB", "#79C9FF", "#19165A"],
    seed: 17,
    style: 3,
  },
  "lado-a-lado": {
    gema: "Turmalina bicolor",
    sentido: "Duas perspectivas, espaço para novas perguntas.",
    colors: ["#DE4F8E", "#7CDBAD", "#74335F"],
    seed: 23,
    style: 4,
    bicolor: true,
  },
  "entre-salas": {
    gema: "Opala",
    sentido: "O conhecimento ganha outras cores em cada Sala.",
    colors: ["#16B8BC", "#FFD18B", "#AD50CD"],
    seed: 31,
    style: 5,
  },
  "leitura-atenta": {
    gema: "Ametista",
    sentido: "Reconhecer as camadas de uma leitura.",
    colors: ["#9446CF", "#E0C1FF", "#48206C"],
    seed: 41,
    style: 6,
  },
  "caminho-percorrido": {
    gema: "Rubi",
    sentido: "Um percurso concluído, novas perguntas pela frente.",
    colors: ["#CE2855", "#FFABB7", "#6B1031"],
    seed: 53,
    style: 7,
  },
} satisfies Record<string, ArteConquista>;

export function arteDaConquista(id: string): ArteConquista {
  return PALETAS[id as keyof typeof PALETAS] ?? PALETAS["primeiro-passo"];
}

export function coresDaConquista(id: string): CSSProperties {
  const { colors } = arteDaConquista(id);
  return {
    "--cosmos-cor": colors[0],
    "--cosmos-luz": colors[1],
    "--cosmos-fundo": colors[2],
  } as CSSProperties;
}
