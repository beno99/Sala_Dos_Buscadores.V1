import { describe, expect, it } from "vitest";
import { leiturasEmAndamento, resumoDoPainel } from "./painel";
import { type ItemAcervo, progressoVazio } from "./tipos";

const acervo: ItemAcervo[] = [
  {
    sala: "caibalion",
    slug: "a",
    temas: ["morte"],
    tipo: "fonte-primaria",
    nivel: 1,
    publicadoEm: "2026-09-01",
  },
  { sala: "caibalion", slug: "b", temas: [], tipo: "artigo", nivel: 1, publicadoEm: "2026-09-02" },
  { sala: "urantia", slug: "c", temas: [], tipo: "artigo", nivel: 1, publicadoEm: "2026-09-03" },
];

describe("resumoDoPainel", () => {
  it("só progresso pessoal: Salas visitadas, lidos, temas comparados e trilhas em andamento", () => {
    const p = progressoVazio();
    p.salasVisitadas = ["caibalion"];
    p.leituras = [
      { sala: "caibalion", slug: "a", pct: 100, atualizadaEm: "1", concluidaEm: "1" },
      { sala: "caibalion", slug: "b", pct: 40, atualizadaEm: "2" },
    ];
    p.temasComparados = ["morte"];
    p.trilhas = { caibalion: 2, urantia: 0 };
    expect(resumoDoPainel(p, acervo, 5)).toEqual({
      salas: { visitadas: 1, total: 5 },
      lidos: { total: 1, fontesPrimarias: 1 },
      temas: { total: 1, slugs: ["morte"] },
      trilhas: { emAndamento: 1, salas: ["caibalion"] },
    });
  });
});

describe("leiturasEmAndamento", () => {
  it("mais recente primeiro, sem as concluídas nem a dispensada", () => {
    const p = progressoVazio();
    p.leituras = [
      { sala: "caibalion", slug: "a", pct: 30, atualizadaEm: "2026-09-01" },
      { sala: "caibalion", slug: "b", pct: 60, atualizadaEm: "2026-09-05" },
      { sala: "urantia", slug: "c", pct: 100, atualizadaEm: "2026-09-09", concluidaEm: "2026-09-09" },
    ];
    expect(leiturasEmAndamento(p).map((l) => l.slug)).toEqual(["b", "a"]);
    p.continuarDispensado = "caibalion/b";
    expect(leiturasEmAndamento(p).map((l) => l.slug)).toEqual(["a"]);
  });
});
