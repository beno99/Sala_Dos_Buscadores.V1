import { describe, expect, it } from "vitest";
import { type ConteudoBuscavel, sugerir } from "./sugestoes";

const conteudos: ConteudoBuscavel[] = [
  {
    titulo: "O Evangelho de Tomé e os 114 ditos",
    salaNome: "Biblioteca de Nag Hammadi",
    href: "/salas/nag-hammadi/tome",
    tipo: "artigo",
  },
  {
    titulo: "Poimandres: a visão do Nous",
    salaNome: "Corpus Hermeticum",
    href: "/salas/corpus-hermeticum/poimandres",
    tipo: "fonte-primaria",
  },
];

const grupos = (lista: ReturnType<typeof sugerir>) => [...new Set(lista.map((s) => s.grupo))];

describe("sugerir", () => {
  it("sem texto: oferece os temas para comparar e as Salas", () => {
    const s = sugerir("", "tema", conteudos);
    expect(grupos(s)).toEqual(["Temas", "Salas"]);
    expect(s[0]).toMatchObject({ rotulo: "Comparar «Morte» entre as Salas", href: "/comparar?tema=morte" });
  });

  it("com texto: temas reconhecidos, Salas, conteúdos e a pergunta ao assistente, nessa ordem", () => {
    const s = sugerir("alma", "tema", conteudos);
    expect(s[0]).toMatchObject({ grupo: "Temas", rotulo: "Comparar «Alma» entre as Salas" });
    expect(s.at(-1)).toMatchObject({
      grupo: "Assistente",
      rotulo: "Perguntar ao assistente: «alma»",
      href: "/assistente?pergunta=alma",
    });
  });

  it("acha por sinônimo, sem acento e por título de conteúdo", () => {
    expect(sugerir("vida após a morte", "tema", conteudos)[0]).toMatchObject({
      rotulo: "Comparar «Morte» entre as Salas",
    });
    expect(sugerir("tome", "tema", conteudos).find((x) => x.grupo === "Conteúdos")).toMatchObject({
      href: "/salas/nag-hammadi/tome",
    });
    expect(sugerir("hermet", "tema", conteudos).find((x) => x.grupo === "Salas")).toMatchObject({
      href: "/salas/corpus-hermeticum",
    });
  });

  it("modo Por Sala mostra só Salas", () => {
    expect(grupos(sugerir("nag", "sala", conteudos))).toEqual(["Salas"]);
  });
});
