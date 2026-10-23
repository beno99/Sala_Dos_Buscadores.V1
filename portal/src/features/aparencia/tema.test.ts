import { describe, expect, it } from "vitest";
import { aparenciaDoCookie, cookieDaLateral, cookieDoTema, lateralDoCookie, temaDoCookie } from "./tema";

describe("tema", () => {
  it("o padrão é o Sólido claro (areia)", () => {
    expect(temaDoCookie(undefined)).toBe("solido-claro");
    expect(temaDoCookie("qualquer")).toBe("solido-claro");
    expect(aparenciaDoCookie(undefined)).toBe("claro");
  });

  it("cada escolha vira o tema da biblioteca", () => {
    expect(temaDoCookie("claro")).toBe("solido-claro");
    expect(temaDoCookie("escuro")).toBe("solido-escuro");
    expect(temaDoCookie("vidro-claro")).toBe("vidro-claro");
    expect(temaDoCookie("vidro-escuro")).toBe("vidro-escuro");
    expect(aparenciaDoCookie("vidro-escuro")).toBe("vidro-escuro");
  });

  it("grava por um ano, para o site todo", () => {
    expect(cookieDoTema("escuro")).toBe("sdb_tema=escuro; path=/; max-age=31536000; samesite=lax");
    expect(cookieDaLateral(true)).toBe("sdb_lateral=translucida; path=/; max-age=31536000; samesite=lax");
  });

  it("a lateral é opaca, a não ser que a pessoa escolha a translúcida", () => {
    expect(lateralDoCookie(undefined)).toBe(false);
    expect(lateralDoCookie("translucida")).toBe(true);
    expect(lateralDoCookie("outra")).toBe(false);
  });
});
