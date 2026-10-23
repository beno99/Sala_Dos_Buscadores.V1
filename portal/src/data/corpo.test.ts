import { describe, expect, it } from "vitest";
import { copiarCorpo, corpoParaForm, limparCorpo, paragrafosDoCorpo, textoDoCorpo } from "./corpo";
import type { BlocoCorpo } from "./types";

const imagem: BlocoCorpo = {
  tipo: "imagem",
  src: "/imagens/salas/caibalion.webp",
  alt: "Pintura de um templo no alto de sete degraus",
  credito: "Pintura alquímica, provavelmente séc. XVII; autoria a confirmar.",
};

const corpo: BlocoCorpo[] = [
  "_O Caibalion_ organiza seu ensinamento em sete princípios.",
  {
    tipo: "destaque",
    texto: "O que está em cima é como o que está embaixo.",
    atribuicao: "_O Caibalion_, cap. II",
  },
  imagem,
  { tipo: "intertitulo", texto: "O que a pesquisa diz" },
  "A relação com os tratados herméticos antigos é contestada.",
];

describe("corpo em blocos", () => {
  it("textoDoCorpo devolve parágrafos, intertítulos e destaques, sem as imagens", () => {
    expect(textoDoCorpo(corpo)).toEqual([
      "_O Caibalion_ organiza seu ensinamento em sete princípios.",
      "O que está em cima é como o que está embaixo.",
      "O que a pesquisa diz",
      "A relação com os tratados herméticos antigos é contestada.",
    ]);
    expect(textoDoCorpo([imagem])).toEqual([]);
  });

  it("os textos soltos continuam sendo parágrafos (dados antigos funcionam sem mudança)", () => {
    expect(textoDoCorpo(["Um.", "Dois."])).toEqual(["Um.", "Dois."]);
    expect(paragrafosDoCorpo(corpo)).toHaveLength(2);
  });

  it("limparCorpo apara textos e tira blocos vazios", () => {
    const limpo = limparCorpo([
      "  Lead.  ",
      "   ",
      { tipo: "intertitulo", texto: " " },
      { tipo: "destaque", texto: "", atribuicao: "" },
      { tipo: "imagem", src: "", alt: "", credito: "" },
      { ...imagem, legenda: "  " },
    ]);
    expect(limpo).toEqual(["Lead.", imagem]);
  });

  it("copia sem compartilhar objetos e nunca devolve corpo vazio para o formulário", () => {
    const copia = copiarCorpo(corpo);
    expect(copia).toEqual(corpo);
    expect(copia[2]).not.toBe(corpo[2]);
    expect(corpoParaForm([])).toEqual([""]);
  });
});
