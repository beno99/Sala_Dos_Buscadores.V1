import { describe, expect, it } from "vitest";
import { ordenarRanking, paginar } from "./ranking";

describe("ranking de buscas", () => {
  it("ordena por buscas, do maior para o menor, e desempata pelo título", () => {
    const r = ordenarRanking([
      { titulo: "Beta", buscas: 10 },
      { titulo: "Alfa", buscas: 10 },
      { titulo: "Gama", buscas: 30 },
    ]);
    expect(r.map((x) => x.titulo)).toEqual(["Gama", "Alfa", "Beta"]);
  });

  it("deixa de fora o que não teve busca", () => {
    expect(
      ordenarRanking([
        { titulo: "A", buscas: 0 },
        { titulo: "B", buscas: 2 },
      ]),
    ).toHaveLength(1);
  });

  it("pagina de sete em sete", () => {
    const itens = Array.from({ length: 15 }, (_, i) => i);
    expect(paginar(itens, 1, 7)).toEqual({ itens: [0, 1, 2, 3, 4, 5, 6], pagina: 1, total: 3 });
    expect(paginar(itens, 3, 7)).toEqual({ itens: [14], pagina: 3, total: 3 });
    expect(paginar(itens, 9, 7).pagina).toBe(3);
    expect(paginar([], 1, 7)).toEqual({ itens: [], pagina: 1, total: 1 });
  });
});
