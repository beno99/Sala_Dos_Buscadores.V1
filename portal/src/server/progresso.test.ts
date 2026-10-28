import { prepararDemonstracao } from "@tests/support/demonstracao";
import { beforeEach, describe, expect, it } from "vitest";
import type { ItemAcervo } from "@/features/estudo/tipos";
import { progressoDe, registrarEvento } from "./progresso";

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
// Conta da demonstração sem histórico de estudo (o progresso é guardado pelo id da conta).
const email = "u-candidato-demo";

describe("progresso", () => {
  beforeEach(() => prepararDemonstracao());

  it("abrir acompanha a leitura, mas Primeiro passo só chega quando ela termina", () => {
    expect(
      registrarEvento(email, { tipo: "leitura", sala: "caibalion", slug: "a", pct: 20 }, acervo),
    ).toEqual({
      novas: [],
      mudouResumo: true,
    });
    registrarEvento(email, { tipo: "leitura", sala: "caibalion", slug: "a", pct: 10 }, acervo);
    expect(progressoDe(email).leituras[0]).toMatchObject({ pct: 20 });
    expect(progressoDe(email).salasVisitadas).toEqual(["caibalion"]);

    const quando = new Date("2026-10-26T12:00:00Z");
    const fim = registrarEvento(
      email,
      { tipo: "leitura", sala: "caibalion", slug: "a", pct: 100 },
      acervo,
      quando,
    );
    expect(fim).toEqual({ novas: ["primeiro-passo"], mudouResumo: true });
    expect(progressoDe(email).conquistas["primeiro-passo"]).toBe(quando.toISOString());
    expect(progressoDe(email).leituras[0]?.concluidaEm).toBe(quando.toISOString());
    expect(
      registrarEvento(email, { tipo: "leitura", sala: "caibalion", slug: "a", pct: 100 }, acervo),
    ).toEqual({
      novas: [],
      mudouResumo: false,
    });
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

  it("não concede por visitar uma Sala ou por conferir fontes do assistente", () => {
    expect(registrarEvento(email, { tipo: "sala", sala: "caibalion" }, acervo)?.novas).toEqual([]);
    expect(registrarEvento(email, { tipo: "fontes" }, acervo)?.novas).toEqual([]);
  });

  it("variações do mesmo verbete não desbloqueiam Palavra por palavra", () => {
    for (const termo of ["Nous", "NOUS", " Nous ", "nous", "Nóus", "noús", "NoUs", "NOÚS", "noûs", "Noùs"]) {
      expect(registrarEvento(email, { tipo: "verbete", termo }, acervo)?.novas).toEqual([]);
    }
    expect(progressoDe(email).conquistas["palavra-por-palavra"]).toBeUndefined();
  });

  it("ignora eventos fora do acervo", () => {
    expect(
      registrarEvento(email, { tipo: "leitura", sala: "caibalion", slug: "x", pct: 50 }, acervo),
    ).toBeNull();
    expect(registrarEvento(email, { tipo: "comparacao", tema: "astrologia" as never }, acervo)).toBeNull();
    expect(registrarEvento(email, { tipo: "sala", sala: "vedas" as never }, acervo)).toBeNull();
  });

  it("preserva o histórico da demonstração ao registrar estudo novo", () => {
    const demo = "u-buscador";
    const antes = progressoDe(demo);
    expect(antes.salasVisitadas).toHaveLength(3);
    expect(antes.leituras.filter((l) => !l.concluidaEm)).toHaveLength(1);
    registrarEvento(demo, { tipo: "comparacao", tema: "meditacao" }, acervo);
    expect(progressoDe(demo).conquistas).toMatchObject(antes.conquistas);
  });
});
