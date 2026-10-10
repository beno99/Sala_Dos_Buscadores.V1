import { describe, expect, it } from "vitest";
import { gerarSlug, podeEditarSlug, slugUnico, validarSlug } from "./slug";

describe("slug", () => {
  it("gera do título, sem acento nem pontuação", () => {
    expect(gerarSlug("Poimandres: a Mente que fala a Hermes")).toBe("poimandres-a-mente-que-fala-a-hermes");
    expect(gerarSlug("  Evangelho de Tomé, ditos 1 a 3!  ")).toBe("evangelho-de-tome-ditos-1-a-3");
    expect(gerarSlug("Ogdóade §26 — o bom fim")).toBe("ogdoade-26-o-bom-fim");
  });

  it("limita o tamanho sem terminar em hífen", () => {
    const s = gerarSlug("a ".repeat(100));
    expect(s.length).toBeLessThanOrEqual(80);
    expect(s.endsWith("-")).toBe(false);
  });

  it("é único por Sala, acrescentando um número", () => {
    expect(slugUnico("poimandres", [])).toBe("poimandres");
    expect(slugUnico("poimandres", ["poimandres", "poimandres-2"])).toBe("poimandres-3");
    expect(slugUnico("", [])).toBe("sem-titulo");
  });

  it("valida o formato e explica como corrigir", () => {
    expect(validarSlug("poimandres-a-mente")).toBeNull();
    expect(validarSlug("Poimandres")).toMatch(/minúsculas/);
    expect(validarSlug("tome--2")).toMatch(/hífens/);
  });

  it("trava depois da primeira publicação, para não quebrar links", () => {
    expect(podeEditarSlug({ publicadoEm: "" })).toBe(true);
    expect(podeEditarSlug({ publicadoEm: "2026-09-28" })).toBe(false);
    expect(podeEditarSlug(null)).toBe(true);
  });
});
