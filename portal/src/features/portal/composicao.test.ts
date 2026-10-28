import { describe, expect, it } from "vitest";
import type { Conteudo } from "@/data/types";
import { comporLeituras, percentualDeLeitura } from "./composicao";

const item = (slug: string) => ({ conteudo: { slug, sala: "corpus-hermeticum" } as Conteudo });
const vazio = { emAndamento: [], comecePorAqui: [], recentes: [] };
describe("composição editorial da home", () => {
  it("não fabrica retomada nem sugestões para conta antiga sem leituras em andamento", () => {
    expect(comporLeituras(vazio)).toEqual({
      retomada: undefined,
      inicio: undefined,
      sugestoes: [],
      novidades: [],
    });
  });
  it("retoma o registro real e não repete conteúdos entre os blocos", () => {
    const a = item("a");
    const b = item("b");
    const c = item("c");
    const resultado = comporLeituras({
      emAndamento: [{ ...a, pct: 38 }],
      comecePorAqui: [a, b, b],
      ampliar: { ...b, motivo: "Outra Sala" },
      recentes: [a, b, c, c],
    });
    expect(resultado.retomada?.pct).toBe(38);
    expect(resultado.sugestoes).toEqual([expect.objectContaining(b)]);
    expect(resultado.novidades).toEqual([c]);
  });
  it("usa a primeira leitura disponível sem inventar percentual", () => {
    const a = item("a");
    const b = item("b");
    const resultado = comporLeituras({ ...vazio, comecePorAqui: [a, b] });
    expect(resultado.inicio).toEqual(a);
    expect(resultado.sugestoes).toEqual([b]);
    expect(resultado.retomada).toBeUndefined();
  });
  it("mantém apenas uma sugestão quando só existe uma", () => {
    expect(
      comporLeituras({ ...vazio, ampliar: { ...item("a"), motivo: "Outra Sala" } }).sugestoes,
    ).toHaveLength(1);
  });
  it("limita a barra sem arredondar o percentual textual", () => {
    expect([38, 38.5, -10, 120, Number.NaN].map(percentualDeLeitura)).toEqual([38, 38.5, 0, 100, undefined]);
  });
});
