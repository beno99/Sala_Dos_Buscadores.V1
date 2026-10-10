import { describe, expect, it } from "vitest";
import { avaliarConquistas, conquistasNovas } from "./conquistas";
import { type ItemAcervo, progressoVazio } from "./tipos";

const acervo: ItemAcervo[] = [
  { sala: "caibalion", slug: "a", temas: [], tipo: "fonte-primaria", nivel: 1, publicadoEm: "2026-09-01" },
  { sala: "caibalion", slug: "b", temas: [], tipo: "artigo", nivel: 1, publicadoEm: "2026-09-01" },
];
const ctx = { acervo, totalSalas: 5 };

describe("conquistas", () => {
  it("todas começam bloqueadas, com o critério visível", () => {
    const lista = avaliarConquistas(progressoVazio(), ctx);
    expect(lista.map((c) => c.nome)).toEqual([
      "Porta aberta",
      "Cinco Salas",
      "Lado a lado",
      "Na fonte",
      "Vocabulário",
      "Com as fontes",
      "Degrau III",
    ]);
    expect(lista.every((c) => !c.obtida && c.criterio.length > 0)).toBe(true);
  });

  it("mostram o progresso parcial em números", () => {
    const p = progressoVazio();
    p.salasVisitadas = ["caibalion", "urantia"];
    p.verbetesAbertos = ["a", "b", "c"];
    const lista = avaliarConquistas(p, ctx);
    expect(lista.find((c) => c.id === "cinco-salas")?.parcial).toEqual({ atual: 2, alvo: 5 });
    expect(lista.find((c) => c.id === "vocabulario")?.parcial).toEqual({ atual: 3, alvo: 10 });
  });

  it("acusa só as novas, e Degrau III vem de um assunto em Avançado", () => {
    const p = progressoVazio();
    p.salasVisitadas = ["caibalion"];
    p.conquistas = { "porta-aberta": "2026-09-01T00:00:00Z" };
    p.temasComparados = ["morte"];
    p.leituras = acervo.map((c) => ({
      sala: c.sala,
      slug: c.slug,
      pct: 100,
      atualizadaEm: "x",
      concluidaEm: "x",
    }));
    expect(conquistasNovas(p, ctx)).toEqual(["lado-a-lado", "degrau-iii"]);
  });
});
