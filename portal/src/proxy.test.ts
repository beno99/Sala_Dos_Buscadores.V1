// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { precisaEntrar, proxy } from "./proxy";

describe("precisaEntrar", () => {
  it("libera só as rotas de conta", () => {
    for (const livre of ["/entrar", "/cadastro", "/recuperar-senha", "/entrar/"]) {
      expect(precisaEntrar(livre)).toBe(false);
    }
    for (const fechada of [
      "/",
      "/salas",
      "/salas/corpus-hermeticum",
      "/comparar",
      "/assistente",
      "/admin",
      "/entrarx",
    ]) {
      expect(precisaEntrar(fechada)).toBe(true);
    }
  });
});

describe("proxy", () => {
  it("sem sessão, manda para /entrar com a volta preservada", () => {
    const r = proxy(new NextRequest("http://localhost/comparar?tema=morte"));
    expect(r.status).toBe(307);
    expect(r.headers.get("location")).toBe("http://localhost/entrar?voltar=%2Fcomparar%3Ftema%3Dmorte");
  });

  it("com cookie de sessão, segue e informa o caminho ao servidor", () => {
    const req = new NextRequest("http://localhost/salas", { headers: { cookie: "sdb_sessao=abc" } });
    const r = proxy(req);
    expect(r.headers.get("location")).toBeNull();
    expect(r.headers.get("x-middleware-request-x-sdb-caminho")).toBe("/salas");
  });

  it("deixa as rotas de conta abertas", () => {
    const r = proxy(new NextRequest("http://localhost/cadastro"));
    expect(r.headers.get("location")).toBeNull();
  });
});
