import { describe, expect, it } from "vitest";
import { EXPRESSOES_DE_VOZ, revisarVoz } from "./voz";

describe("revisão de voz", () => {
  it("aponta verdade absoluta e tom de conversão, com o lugar e a sugestão atribuída", () => {
    const achados = revisarVoz([
      { onde: "resumo", texto: "A verdade é que o Poimandres descreve a criação." },
      { onde: "parágrafo 2", texto: "Este é o único caminho, e você precisa acreditar." },
    ]);
    expect(achados.map((a) => [a.expressao, a.onde])).toEqual([
      ["a verdade e", "resumo"],
      ["o unico caminho", "parágrafo 2"],
      ["voce precisa acreditar", "parágrafo 2"],
    ]);
    expect(achados[0]?.sugestao).toMatch(/Segundo o Poimandres/);
  });

  it("ignora acentos e maiúsculas e pega variações de uma palavra", () => {
    expect(
      revisarVoz([{ onde: "título", texto: "COMPROVADAMENTE, uma leitura inquestionável" }]),
    ).toHaveLength(2);
  });

  it("não acusa a forma atribuída", () => {
    expect(
      revisarVoz([{ onde: "resumo", texto: "Segundo o Tratado I, a alma sobe pelas sete esferas." }]),
    ).toEqual([]);
  });

  it("a lista fica sem acento e em minúsculas, para a comparação funcionar", () => {
    for (const e of EXPRESSOES_DE_VOZ)
      expect(e.expressao).toBe(
        e.expressao
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .toLowerCase(),
      );
  });
});
