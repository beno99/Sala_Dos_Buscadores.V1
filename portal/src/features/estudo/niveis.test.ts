import { describe, expect, it } from "vitest";
import { assuntoEmFoco, calcularNivel, nivelNoAssunto, textoQuantoFalta } from "./niveis";
import { type ItemAcervo, type Leitura, progressoVazio } from "./tipos";

const item = (sala: ItemAcervo["sala"], slug: string, temas: ItemAcervo["temas"] = []): ItemAcervo => ({
  sala,
  slug,
  temas,
  tipo: "artigo",
  nivel: 1,
  publicadoEm: "2026-09-01",
});
const lida = (sala: Leitura["sala"], slug: string, quando = "2026-09-10T10:00:00Z"): Leitura => ({
  sala,
  slug,
  pct: 100,
  atualizadaEm: quando,
  concluidaEm: quando,
});
const acervo = [
  item("corpus-hermeticum", "a", ["alma"]),
  item("corpus-hermeticum", "b"),
  item("corpus-hermeticum", "c", ["alma"]),
  item("nag-hammadi", "d", ["alma"]),
];

describe("calcularNivel", () => {
  it("Intermediário com metade lida (arredondada para cima) e Avançado com tudo", () => {
    expect(calcularNivel(0, 3)).toMatchObject({ nivel: 1, proximo: 2, faltam: 2 });
    expect(calcularNivel(1, 3)).toMatchObject({ nivel: 1, proximo: 2, faltam: 1 });
    expect(calcularNivel(2, 3)).toMatchObject({ nivel: 2, proximo: 3, faltam: 1 });
    expect(calcularNivel(3, 3)).toMatchObject({ nivel: 3, proximo: null, faltam: 0 });
    expect(calcularNivel(3, 6)).toMatchObject({ nivel: 2, proximo: 3, faltam: 3 });
  });

  it("os degraus mostram o caminho até o próximo nível", () => {
    expect(calcularNivel(1, 4).degraus).toEqual([1, 0.5, 0]);
    expect(calcularNivel(3, 4).degraus).toEqual([1, 1, 0.5]);
    expect(calcularNivel(4, 4).degraus).toEqual([1, 1, 1]);
  });

  it("assunto sem conteúdo fica em Iniciante, sem meta", () => {
    expect(calcularNivel(0, 0)).toMatchObject({ nivel: 1, proximo: null, faltam: 0 });
  });
});

describe("nivelNoAssunto", () => {
  it("conta só leituras concluídas, por Sala ou por tema", () => {
    const leituras = [
      lida("corpus-hermeticum", "a"),
      { ...lida("corpus-hermeticum", "b"), pct: 40, concluidaEm: undefined },
    ];
    expect(nivelNoAssunto({ tipo: "sala", sala: "corpus-hermeticum" }, acervo, leituras)).toMatchObject({
      lidas: 1,
      total: 3,
      nivel: 1,
    });
    expect(nivelNoAssunto({ tipo: "tema", tema: "alma" }, acervo, leituras)).toMatchObject({
      lidas: 1,
      total: 3,
    });
  });
});

describe("textoQuantoFalta", () => {
  it("fala em leituras e degraus, sem pontos", () => {
    expect(textoQuantoFalta(calcularNivel(1, 6))).toBe("Faltam 2 leituras para Intermediário");
    expect(textoQuantoFalta(calcularNivel(2, 3))).toBe("Falta 1 leitura para Avançado");
    expect(textoQuantoFalta(calcularNivel(3, 3))).toBe("Chegou ao Avançado neste assunto");
  });
});

describe("assuntoEmFoco", () => {
  it("é a Sala da leitura mais recente; sem leitura, o primeiro interesse", () => {
    const p = progressoVazio();
    p.leituras = [
      lida("nag-hammadi", "d", "2026-09-01T00:00:00Z"),
      lida("corpus-hermeticum", "a", "2026-09-20T00:00:00Z"),
    ];
    expect(assuntoEmFoco(p, { temas: [], salas: [] })).toEqual({ tipo: "sala", sala: "corpus-hermeticum" });
    expect(assuntoEmFoco(progressoVazio(), { temas: ["alma"], salas: [] })).toEqual({
      tipo: "tema",
      tema: "alma",
    });
    expect(assuntoEmFoco(progressoVazio(), { temas: [], salas: [] })).toBeNull();
  });
});
