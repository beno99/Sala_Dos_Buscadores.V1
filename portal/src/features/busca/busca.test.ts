import { describe, expect, it } from "vitest";
import { acervoPublico } from "@/data/repositorio";
import {
  buscar as buscarNo,
  contarFacetas as contarNo,
  detectarTemas,
  FILTROS_VAZIOS,
  lerFiltros,
  paraQueryString,
} from "./busca";

const buscar = (f: Parameters<typeof buscarNo>[0]) => buscarNo(f, acervoPublico());
const contarFacetas = (f: Parameters<typeof contarNo>[0]) => contarNo(f, acervoPublico());

const filtros = (parcial: Partial<typeof FILTROS_VAZIOS>) => ({ ...FILTROS_VAZIOS, ...parcial });

describe("detectarTemas", () => {
  it("reconhece a pergunta pelo tema, sem acento e sem pontuação", () => {
    expect(detectarTemas("Vida após a morte?")[0]).toBe("morte");
    expect(detectarTemas("O que acontece com a alma após a morte?")).toEqual(["morte", "alma"]);
    expect(detectarTemas("como o mundo começou")[0]).toBe("origem-do-universo");
    expect(detectarTemas("silêncio e oração")[0]).toBe("meditacao");
  });

  it("não inventa tema para texto sem relação", () => {
    expect(detectarTemas("receita de bolo")).toEqual([]);
  });
});

describe("buscar", () => {
  it("abre a grade comparativa do tema e lista conteúdos relacionados (RF-17, RF-18)", () => {
    const r = buscar(filtros({ q: "vida após a morte" }));
    expect(r.tema).toBe("morte");
    expect(r.comparacao?.respostas).toHaveLength(5);
    expect(r.itens.length).toBeGreaterThan(0);
    expect(r.vazio).toBe(false);
  });

  it("mantém colunas sem resposta em vez de preencher a lacuna (RF-19)", () => {
    const r = buscar(filtros({ temas: ["morte"] }));
    const caibalion = r.comparacao?.respostas.find((x) => x.sala === "caibalion");
    expect(caibalion?.vazia).toBe(true);
  });

  it("o filtro de Sala tira colunas; nível e formato refinam só a lista (RF-20)", () => {
    const r = buscar(filtros({ q: "morte", salas: ["urantia", "corpus-hermeticum"], formato: "video" }));
    expect(r.comparacao?.respostas.map((x) => x.sala)).toEqual(["corpus-hermeticum", "urantia"]);
    expect(r.itens.every((i) => i.tipo === "video")).toBe(true);
    expect(r.itens.every((i) => ["urantia", "corpus-hermeticum"].includes(i.item.sala))).toBe(true);
  });

  it("marca como vazio o termo que nenhuma Sala trata", () => {
    expect(buscar(filtros({ q: "xyzabc" })).vazio).toBe(true);
  });

  it("filtra por nível", () => {
    const r = buscar(filtros({ niveis: [3] }));
    expect(r.itens.length).toBeGreaterThan(0);
    expect(r.itens.every((i) => i.item.nivel === 3)).toBe(true);
  });
});

describe("parâmetros de URL", () => {
  it("ida e volta preservam os filtros e descartam valores inválidos", () => {
    const f = filtros({
      q: "alma",
      modo: "sala",
      salas: ["caibalion"],
      temas: ["alma"],
      niveis: [1, 2],
      formato: "texto",
    });
    expect(lerFiltros(new URLSearchParams(paraQueryString(f).slice(1)))).toEqual(f);
    expect(lerFiltros({ sala: ["inexistente"], nivel: "9", formato: "audio" })).toEqual(FILTROS_VAZIOS);
  });
});

describe("contarFacetas", () => {
  it("conta cada opção considerando os outros filtros", () => {
    const f = contarFacetas(filtros({ formato: "video" }));
    const totalPorSala = [...f.salas.values()].reduce((a, b) => a + b, 0);
    expect(totalPorSala).toBe(5);
  });
});
