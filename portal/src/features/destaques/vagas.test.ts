import { describe, expect, it } from "vitest";
import { type Candidato, montarVagas, podarEscolha, VAGAS_VAZIAS } from "./vagas";

const video = (id: string, publicadoEm: string): Candidato => ({
  id,
  titulo: id,
  publicadoEm,
  grupos: ["video"],
});
const texto = (id: string, publicadoEm: string): Candidato => ({
  id,
  titulo: id,
  publicadoEm,
  grupos: ["cards", "artigos"],
});
const verbete = (id: string, publicadoEm: string): Candidato => ({
  id,
  titulo: id,
  publicadoEm,
  grupos: ["cards"],
});

const candidatos: Candidato[] = [
  video("v1", "2026-09-01"),
  video("v2", "2026-09-20"),
  ...Array.from({ length: 10 }, (_, i) => texto(`t${i}`, `2026-09-${String(10 + i).padStart(2, "0")}`)),
  verbete("g1", "2026-09-30"),
];

describe("montagem das vagas", () => {
  it("mantém as escolhas da curadoria na ordem e marca como não automáticas", () => {
    const v = montarVagas(
      { video: ["v1"], cards: ["t1", "t2", "t3", "t4"], artigos: ["t5", "t6", "t7", "t8", "t0"] },
      candidatos,
    );
    expect(v.video).toEqual([{ id: "v1", automatica: false }]);
    expect(v.cards.map((x) => x.id)).toEqual(["t1", "t2", "t3", "t4"]);
    expect(v.artigos.map((x) => x.id)).toEqual(["t5", "t6", "t7", "t8", "t0"]);
    expect([...v.cards, ...v.artigos].every((x) => !x.automatica)).toBe(true);
  });

  it("vaga vazia é preenchida pelo publicado mais recente que ainda não está na página", () => {
    const v = montarVagas({ ...VAGAS_VAZIAS, cards: ["t9", null, null, null] }, candidatos);
    expect(v.video[0]).toEqual({ id: "v2", automatica: true });
    // g1 é o mais recente de todos; t9 já está na vaga 1.
    expect(v.cards.map((x) => x.id)).toEqual(["t9", "g1", "t8", "t7"]);
    expect(v.cards.map((x) => x.automatica)).toEqual([false, true, true, true]);
    // Artigos: só textos, sem repetir o que os cards já mostram.
    expect(v.artigos.map((x) => x.id)).toEqual(["t6", "t5", "t4", "t3", "t2"]);
  });

  it("um item não aparece em duas vagas da página: a primeira escolha vence", () => {
    const v = montarVagas({ video: [null], cards: ["t1", "t1", null, null], artigos: ["t1"] }, candidatos);
    const ids = [...v.cards, ...v.artigos].map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(v.cards[0]).toEqual({ id: "t1", automatica: false });
    expect(v.cards[1]?.automatica).toBe(true);
    expect(v.artigos[0]?.automatica).toBe(true);
  });

  it("item despublicado ou removido sai da vaga, que volta a ser automática", () => {
    const semT1 = candidatos.filter((c) => c.id !== "t1");
    const v = montarVagas({ video: ["vx"], cards: ["t1", null, null, null], artigos: [] }, semT1);
    expect(v.video[0]?.automatica).toBe(true);
    expect(v.cards[0]).toEqual({ id: "g1", automatica: true });
    expect(podarEscolha({ video: ["vx"], cards: ["t1", "t2"], artigos: [] }, semT1)).toEqual({
      video: [null],
      cards: [null, "t2", null, null],
      artigos: [null, null, null, null, null],
    });
  });

  it("só aceita na vaga o que cabe no grupo (verbete não vai para os artigos)", () => {
    const v = montarVagas({ video: [null], cards: [null, null, null, null], artigos: ["g1"] }, candidatos);
    expect(v.artigos.map((x) => x.id)).not.toContain("g1");
  });

  it("sem candidatos suficientes, a vaga fica vazia", () => {
    const v = montarVagas(VAGAS_VAZIAS, [texto("a", "2026-01-01")]);
    expect(v.video).toEqual([{ id: null, automatica: true }]);
    expect(v.cards.map((x) => x.id)).toEqual(["a", null, null, null]);
  });
});
