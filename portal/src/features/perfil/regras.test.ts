import { describe, expect, it } from "vitest";
import { LIMITE_SOBRE, validarSobre } from "./regras";

describe("Sobre a sua busca", () => {
  it("guarda o texto sem espaços nas pontas", () => {
    expect(validarSobre("  Comecei pelo Caibalion.  ")).toEqual({
      ok: true,
      texto: "Comecei pelo Caibalion.",
    });
  });

  it("vazio apaga o texto", () => {
    expect(validarSobre("   ")).toEqual({ ok: true, texto: "" });
  });

  it(`recusa mais de ${LIMITE_SOBRE} caracteres`, () => {
    const r = validarSobre("a".repeat(LIMITE_SOBRE + 1));
    expect(r.ok).toBe(false);
  });
});
