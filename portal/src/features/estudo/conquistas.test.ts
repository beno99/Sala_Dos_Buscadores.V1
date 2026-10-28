import { describe, expect, it } from "vitest";
import { avaliarConquistas, conquistasNovas } from "./conquistas";
import { type ItemAcervo, type Leitura, progressoVazio } from "./tipos";

const quando = "2026-09-01T00:00:00Z";
const acervo: [ItemAcervo, ItemAcervo, ItemAcervo, ItemAcervo, ItemAcervo, ItemAcervo] = [
  { sala: "caibalion", slug: "a", temas: [], tipo: "fonte-primaria", nivel: 1, publicadoEm: quando },
  { sala: "caibalion", slug: "b", temas: [], tipo: "artigo", nivel: 1, publicadoEm: quando },
  { sala: "corpus-hermeticum", slug: "a", temas: [], tipo: "fonte-primaria", nivel: 1, publicadoEm: quando },
  { sala: "nag-hammadi", slug: "a", temas: [], tipo: "fonte-primaria", nivel: 1, publicadoEm: quando },
  { sala: "urantia", slug: "a", temas: [], tipo: "artigo", nivel: 1, publicadoEm: quando },
  {
    sala: "apocrifos-cristianismo-primitivo",
    slug: "a",
    temas: [],
    tipo: "artigo",
    nivel: 1,
    publicadoEm: quando,
  },
];
const ctx = { acervo, totalSalas: 5 };
const lida = (c: Pick<ItemAcervo, "sala" | "slug">): Leitura => ({
  sala: c.sala,
  slug: c.slug,
  pct: 100,
  atualizadaEm: quando,
  concluidaEm: quando,
});

describe("conquistas", () => {
  it("apresenta as oito conquistas aprovadas, bloqueadas para uma conta sem estudo", () => {
    const lista = avaliarConquistas(progressoVazio(), ctx);
    expect(lista.map((c) => c.nome)).toEqual([
      "Primeiro passo",
      "Palavra por palavra",
      "Na fonte",
      "Além da primeira leitura",
      "Lado a lado",
      "Entre Salas",
      "Leitura atenta",
      "Caminho percorrido",
    ]);
    expect(lista.every((c) => !c.obtida && c.criterio.length > 0)).toBe(true);
  });

  it("Primeiro passo exige uma leitura concluída e ainda presente no acervo", () => {
    const p = progressoVazio();
    p.salasVisitadas = ["caibalion"];
    p.leituras = [
      { ...lida(acervo[0]), pct: 70, concluidaEm: undefined },
      lida({ sala: "caibalion", slug: "fora-do-acervo" }),
    ];
    p.conquistas["porta-aberta"] = quando;
    expect(conquistasNovas(p, ctx)).toEqual([]);

    p.leituras.push(lida(acervo[0]));
    expect(conquistasNovas(p, ctx)).toEqual(["primeiro-passo"]);
  });

  it("Na fonte conta fontes válidas distintas, inclusive slugs iguais em Salas diferentes", () => {
    const p = progressoVazio();
    p.leituras = [
      lida(acervo[0]),
      lida(acervo[0]),
      lida(acervo[1]),
      lida({ sala: "caibalion", slug: "sumiu" }),
    ];
    expect(avaliarConquistas(p, ctx).find((c) => c.id === "na-fonte")?.parcial).toEqual({
      atual: 1,
      alvo: 3,
    });

    p.leituras.push(lida(acervo[2]), lida(acervo[3]));
    expect(avaliarConquistas(p, ctx).find((c) => c.id === "na-fonte")?.obtida).toBe(true);
  });

  it("Entre Salas exige leituras concluídas em cinco Salas, sem contar visitas ou leituras repetidas", () => {
    const p = progressoVazio();
    p.salasVisitadas = [...new Set(acervo.map((c) => c.sala))];
    p.conquistas["cinco-salas"] = quando;
    p.leituras = [
      lida(acervo[0]),
      lida(acervo[1]),
      lida(acervo[0]),
      lida({ sala: "sala-removida", slug: "x" }),
    ];
    expect(avaliarConquistas(p, ctx).find((c) => c.id === "entre-salas")?.parcial).toEqual({
      atual: 1,
      alvo: 5,
    });

    p.leituras.push(...acervo.slice(2).map(lida));
    expect(avaliarConquistas(p, ctx).find((c) => c.id === "entre-salas")?.obtida).toBe(true);
  });

  it("Palavra por palavra normaliza acentos, caixa e espaços e ignora termos vazios", () => {
    const p = progressoVazio();
    p.verbetesAbertos = [
      " Nous ",
      "NOUS",
      "Ogdóade",
      "ogdoade",
      "",
      "   ",
      "Alma   do mundo",
      "alma do mundo",
    ];
    const badge = avaliarConquistas(p, ctx).find((c) => c.id === "palavra-por-palavra");
    expect(badge?.parcial).toEqual({ atual: 3, alvo: 10 });
    expect(badge?.criterio).toBe("Consulte 10 verbetes distintos.");

    p.verbetesAbertos.push("Gnose", "Demiurgo", "Logos", "Pleroma", "Sofia", "Mentalismo", "Nous divino");
    expect(avaliarConquistas(p, ctx).find((c) => c.id === "palavra-por-palavra")?.obtida).toBe(true);
  });

  it("mantém datas já conquistadas de Na fonte e Lado a lado e não as concede novamente", () => {
    const p = progressoVazio();
    p.conquistas = { "na-fonte": quando, "lado-a-lado": quando };
    const lista = avaliarConquistas(p, ctx);
    expect(lista.filter((c) => c.obtida).map((c) => ({ id: c.id, em: c.em }))).toEqual([
      { id: "na-fonte", em: quando },
      { id: "lado-a-lado", em: quando },
    ]);
    expect(conquistasNovas(p, ctx)).toEqual([]);
  });

  it("Lado a lado reconhece a consulta de comparação já registrada", () => {
    const p = progressoVazio();
    p.temasComparados = ["morte"];
    expect(conquistasNovas(p, ctx)).toEqual(["lado-a-lado"]);
    expect(avaliarConquistas(p, ctx).find((c) => c.id === "lado-a-lado")?.criterio).toBe(
      "Consulte a comparação de um tema entre Salas.",
    );
  });

  it("não converte conquistas legadas em novas atividades ainda sem registro", () => {
    const p = progressoVazio();
    p.conquistas = {
      "porta-aberta": quando,
      "cinco-salas": quando,
      vocabulario: quando,
      "com-as-fontes": quando,
      "degrau-iii": quando,
    };
    p.trilhas = { "corpus-hermeticum": 100 };
    p.fontesConferidas = 100;
    const antes = structuredClone(p);
    const lista = avaliarConquistas(p, ctx);
    const futuras = lista.filter((c) => c.disponibilidade === "em-breve");
    expect(futuras.map((c) => c.id)).toEqual([
      "alem-da-primeira-leitura",
      "leitura-atenta",
      "caminho-percorrido",
    ]);
    expect(futuras.every((c) => !c.obtida && c.indisponibilidade && !c.parcial)).toBe(true);
    expect(conquistasNovas(p, ctx)).toEqual([]);
    expect(p).toEqual(antes);
  });
});
