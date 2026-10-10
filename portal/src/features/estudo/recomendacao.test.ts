import { describe, expect, it } from "vitest";
import type { SalaSlug } from "@/data/types";
import { comecePorAqui, conteudoParaAmpliar, ordenarSalas } from "./recomendacao";
import type { ItemAcervo, Leitura } from "./tipos";

const SALAS: SalaSlug[] = [
  "apocrifos-cristianismo-primitivo",
  "caibalion",
  "corpus-hermeticum",
  "nag-hammadi",
  "urantia",
];
const it_ = (
  sala: SalaSlug,
  slug: string,
  temas: ItemAcervo["temas"],
  nivel: ItemAcervo["nivel"] = 1,
): ItemAcervo => ({
  sala,
  slug,
  temas,
  nivel,
  tipo: "artigo",
  publicadoEm: "2026-09-01",
});
const acervo: ItemAcervo[] = [
  it_("corpus-hermeticum", "c1", ["alma"]),
  it_("corpus-hermeticum", "c2", ["origem-do-universo"], 2),
  it_("nag-hammadi", "n1", ["alma"]),
  it_("nag-hammadi", "n2", ["morte"], 2),
  it_("caibalion", "k1", ["origem-do-universo"]),
  it_("urantia", "u1", ["alma"]),
  it_("apocrifos-cristianismo-primitivo", "a1", ["morte"]),
];
const lida = (sala: SalaSlug, slug: string, pct = 100, quando = "2026-09-10T00:00:00Z"): Leitura => ({
  sala,
  slug,
  pct,
  atualizadaEm: quando,
  concluidaEm: pct === 100 ? quando : undefined,
});

describe("ordenarSalas", () => {
  it("em andamento, depois interesses, depois uma para ampliar o olhar", () => {
    const r = ordenarSalas(SALAS, {
      acervo,
      leituras: [lida("nag-hammadi", "n1")],
      interesses: { temas: ["alma"], salas: [] },
      conviccao: { tipo: "pulada" },
    });
    expect(r[0]).toEqual({ sala: "nag-hammadi", motivo: "andamento" });
    expect(r.slice(1, 3).map((x) => x.motivo)).toEqual(["interesse", "interesse"]);
    const ampliar = r.filter((x) => x.motivo === "ampliar");
    expect(ampliar).toHaveLength(1);
    expect(["caibalion", "apocrifos-cristianismo-primitivo"]).toContain(ampliar[0]?.sala);
    expect(r).toHaveLength(SALAS.length);
  });

  it("sempre há uma Sala para ampliar o olhar, mesmo com tudo no perfil", () => {
    const r = ordenarSalas(SALAS, {
      acervo,
      leituras: [],
      interesses: { temas: [], salas: SALAS },
      conviccao: { tipo: "pulada" },
    });
    expect(r.filter((x) => x.motivo === "ampliar")).toHaveLength(1);
  });

  it("a convicção só desempata e nunca esconde uma Sala", () => {
    const base = { acervo, leituras: [], interesses: { temas: [], salas: [] } };
    const sem = ordenarSalas(SALAS, { ...base, conviccao: { tipo: "pulada" } });
    const com = ordenarSalas(SALAS, {
      ...base,
      conviccao: { tipo: "informada", opcoes: ["espiritismo"], consentidoEm: "x" },
    });
    expect(com.map((x) => x.sala).sort()).toEqual(sem.map((x) => x.sala).sort());
  });
});

describe("conteúdos", () => {
  it("para ampliar: outra Sala, fora do perfil, sobre um tema que a pessoa já leu", () => {
    const c = conteudoParaAmpliar(acervo, [lida("corpus-hermeticum", "c1")], {
      temas: [],
      salas: ["corpus-hermeticum"],
    });
    expect(c?.sala).not.toBe("corpus-hermeticum");
    expect(c?.temas).toContain("alma");
  });

  it("para ampliar: não repete o que já está na tela", () => {
    const interesses = { temas: [], salas: ["corpus-hermeticum" as SalaSlug] };
    const primeira = conteudoParaAmpliar(acervo, [], interesses);
    expect(primeira).toBeDefined();
    const outra = conteudoParaAmpliar(acervo, [], interesses, primeira ? [primeira] : []);
    expect(outra).toBeDefined();
    expect(`${outra?.sala}/${outra?.slug}`).not.toBe(`${primeira?.sala}/${primeira?.slug}`);
  });

  it("“Comece por aqui”: 3 iniciantes de Salas diferentes", () => {
    const lista = comecePorAqui(acervo, { temas: [], salas: [] });
    expect(lista).toHaveLength(3);
    expect(new Set(lista.map((c) => c.sala)).size).toBe(3);
    expect(lista.every((c) => c.nivel === 1)).toBe(true);
  });
});
