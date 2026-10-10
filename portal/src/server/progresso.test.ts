import { beforeEach, describe, expect, it } from "vitest";
import type { ItemAcervo } from "@/features/estudo/tipos";
import { progressoDe, registrarEvento, reiniciarProgresso } from "./progresso";

const acervo: ItemAcervo[] = [
  {
    sala: "caibalion",
    slug: "a",
    temas: ["morte"],
    tipo: "fonte-primaria",
    nivel: 1,
    publicadoEm: "2026-09-01",
  },
  { sala: "caibalion", slug: "b", temas: ["morte"], tipo: "artigo", nivel: 1, publicadoEm: "2026-09-02" },
];
const email = "nova@exemplo.com";

describe("progresso", () => {
  beforeEach(reiniciarProgresso);

  it("abrir registra a leitura e a Sala; a rolagem só sobe; o fim marca lida", () => {
    expect(
      registrarEvento(email, { tipo: "leitura", sala: "caibalion", slug: "a", pct: 20 }, acervo),
    ).toEqual({
      novas: ["porta-aberta"],
      mudouResumo: true,
    });
    registrarEvento(email, { tipo: "leitura", sala: "caibalion", slug: "a", pct: 10 }, acervo);
    expect(progressoDe(email).leituras[0]).toMatchObject({ pct: 20 });
    expect(progressoDe(email).salasVisitadas).toEqual(["caibalion"]);
    const fim = registrarEvento(email, { tipo: "leitura", sala: "caibalion", slug: "a", pct: 100 }, acervo);
    expect(fim?.mudouResumo).toBe(true);
    expect(progressoDe(email).leituras[0]?.concluidaEm).toBeTruthy();
  });

  it("conquista registrada uma vez só", () => {
    expect(registrarEvento(email, { tipo: "comparacao", tema: "morte" }, acervo)?.novas).toEqual([
      "lado-a-lado",
    ]);
    expect(registrarEvento(email, { tipo: "comparacao", tema: "morte" }, acervo)).toEqual({
      novas: [],
      mudouResumo: false,
    });
  });

  it("ignora eventos fora do acervo", () => {
    expect(
      registrarEvento(email, { tipo: "leitura", sala: "caibalion", slug: "x", pct: 50 }, acervo),
    ).toBeNull();
    expect(registrarEvento(email, { tipo: "comparacao", tema: "astrologia" as never }, acervo)).toBeNull();
    expect(registrarEvento(email, { tipo: "sala", sala: "vedas" as never }, acervo)).toBeNull();
  });

  it("a conta de demonstração já tem histórico", () => {
    const p = progressoDe("buscador@exemplo.com");
    expect(p.salasVisitadas).toHaveLength(3);
    expect(p.leituras.filter((l) => !l.concluidaEm)).toHaveLength(1);
  });
});
