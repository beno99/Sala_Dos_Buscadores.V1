import { describe, expect, it } from "vitest";
import { cookieDoTema, temaDoCookie } from "./tema";

describe("tema", () => {
  it("o padrão é o Sólido claro", () => {
    expect(temaDoCookie(undefined)).toBe("solido-claro");
    expect(temaDoCookie("qualquer")).toBe("solido-claro");
  });

  it("escuro vira Sólido escuro", () => {
    expect(temaDoCookie("escuro")).toBe("solido-escuro");
    expect(temaDoCookie("claro")).toBe("solido-claro");
  });

  it("grava por um ano, para o site todo", () => {
    expect(cookieDoTema("escuro")).toBe("sdb_tema=escuro; path=/; max-age=31536000; samesite=lax");
  });
});
