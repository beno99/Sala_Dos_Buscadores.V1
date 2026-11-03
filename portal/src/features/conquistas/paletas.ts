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
  citrino: {
    gema: "Citrino",
    sentido: "Toda busca começa com uma descoberta.",
    colors: ["#EDAD25", "#FFF0A3", "#AE5410"],
    seed: 2,
    style: 0,
  },
  esmeralda: {
    gema: "Esmeralda",
    sentido: "Cada palavra abre uma possibilidade de leitura.",
    colors: ["#079F70", "#A7EDBD", "#064D3E"],
    seed: 5,
    style: 1,
  },
  "cristal-de-rocha": {
    gema: "Cristal de Rocha",
    sentido: "Um encontro direto com as palavras da fonte.",
    colors: ["#B8D5DF", "#F5FBFA", "#42758C"],
    seed: 11,
    style: 2,
  },
  safira: {
    gema: "Safira",
    sentido: "Voltar ao texto também é seguir adiante.",
    colors: ["#2452DB", "#79C9FF", "#19165A"],
    seed: 17,
    style: 3,
  },
  turmalina: {
    gema: "Turmalina",
    sentido: "Duas perspectivas, espaço para novas perguntas.",
    colors: ["#DE4F8E", "#7CDBAD", "#74335F"],
    seed: 23,
    style: 4,
    bicolor: true,
  },
  opala: {
    gema: "Opala",
    sentido: "O conhecimento ganha outras cores em cada Sala.",
    colors: ["#16B8BC", "#FFD18B", "#AD50CD"],
    seed: 31,
    style: 5,
  },
  ametista: {
    gema: "Ametista",
    sentido: "Reconhecer as camadas de uma leitura.",
    colors: ["#9446CF", "#E0C1FF", "#48206C"],
    seed: 41,
    style: 6,
  },
  rubi: {
    gema: "Rubi",
    sentido: "Um percurso concluído, novas perguntas pela frente.",
    colors: ["#CE2855", "#FFABB7", "#6B1031"],
    seed: 53,
    style: 7,
  },
  agata: {
    gema: "Ágata",
    sentido: "Cada leitura acrescenta uma camada.",
    colors: ["#D98A2B", "#FFD9A0", "#7A3E12"],
    seed: 61,
    style: 1,
    bicolor: true,
  },
  jaspe: {
    gema: "Jaspe",
    sentido: "Um percurso começa a tomar forma.",
    colors: ["#A8442E", "#E9A07F", "#4F1C12"],
    seed: 67,
    style: 2,
  },
  "quartzo-rosa": {
    gema: "Quartzo Rosa",
    sentido: "Voltar ao estudo também é seguir.",
    colors: ["#E7A0B4", "#FFE3EA", "#8C4C63"],
    seed: 71,
    style: 3,
  },
  fluorita: {
    gema: "Fluorita",
    sentido: "Duas Salas, duas perspectivas.",
    colors: ["#3FAE8C", "#B996F0", "#3A2A6B"],
    seed: 73,
    style: 4,
    bicolor: true,
  },
  "lapis-lazuli": {
    gema: "Lápis Lazúli",
    sentido: "Permanecer para ver mais fundo.",
    colors: ["#1E3F9C", "#E7C764", "#0D1A4A"],
    seed: 79,
    style: 5,
  },
  amazonita: {
    gema: "Amazonita",
    sentido: "Os horizontes do acervo se abrem.",
    colors: ["#3FB3A6", "#C5F2EA", "#16564F"],
    seed: 83,
    style: 6,
  },
  granada: {
    gema: "Granada",
    sentido: "Um percurso que se amplia.",
    colors: ["#7A1530", "#E4728B", "#3A0715"],
    seed: 89,
    style: 7,
  },
  "pedra-da-lua": {
    gema: "Pedra da Lua",
    sentido: "Cada um encontra o próprio ritmo.",
    colors: ["#D8E1EC", "#FFFFFF", "#6C86A8"],
    seed: 97,
    style: 0,
  },
  topazio: {
    gema: "Topázio",
    sentido: "Um caminho construído passo a passo.",
    colors: ["#7FC4E8", "#E2F5FF", "#2C6A8E"],
    seed: 101,
    style: 1,
  },
  alexandrita: {
    gema: "Alexandrita",
    sentido: "Raízes que se aprofundam numa Sala.",
    colors: ["#2E8C86", "#B58CE0", "#1C3F4A"],
    seed: 103,
    style: 2,
  },
  benitoita: {
    gema: "Benitoíta",
    sentido: "Percursos que atravessam Salas.",
    colors: ["#2A4FD6", "#9DB8FF", "#101E66"],
    seed: 107,
    style: 3,
  },
  espinelio: {
    gema: "Espinélio",
    sentido: "Uma busca que se mantém.",
    colors: ["#D9465F", "#FFB3C0", "#6B1426"],
    seed: 109,
    style: 4,
  },
  demantoide: {
    gema: "Demantoide",
    sentido: "Continuidade construída dia a dia.",
    colors: ["#3DBE3A", "#C6F7A8", "#1A5A16"],
    seed: 113,
    style: 5,
  },
  paraiba: {
    gema: "Paraíba",
    sentido: "Três caminhos aprofundados.",
    colors: ["#20D2D6", "#C8FBFF", "#0B5F68"],
    seed: 127,
    style: 6,
  },
  "rubi-estrela": {
    gema: "Rubi Estrela",
    sentido: "Muitas leituras, um horizonte.",
    colors: ["#C3133C", "#FFD0D9", "#550716"],
    seed: 131,
    style: 7,
  },
  padparadscha: {
    gema: "Padparadscha",
    sentido: "A amplitude do percurso.",
    colors: ["#F08E6E", "#FFD9C7", "#8A3B2A"],
    seed: 137,
    style: 0,
  },
  "diamante-rosa": {
    gema: "Diamante Rosa",
    sentido: "Dedicação ao percurso.",
    colors: ["#F4A9C8", "#FFF0F6", "#A0476F"],
    seed: 139,
    style: 1,
  },
} satisfies Record<string, ArteConquista>;

export function arteDaConquista(id: string): ArteConquista {
  return PALETAS[id as keyof typeof PALETAS] ?? PALETAS.citrino;
}

export function coresDaConquista(id: string): CSSProperties {
  const { colors } = arteDaConquista(id);
  return {
    "--cosmos-cor": colors[0],
    "--cosmos-luz": colors[1],
    "--cosmos-fundo": colors[2],
  } as CSSProperties;
}
