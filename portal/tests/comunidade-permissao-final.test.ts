import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { beforeEach, test } from "node:test";
import type { Membro } from "../src/modules/conta/conta.contratos";
import { acervo } from "../src/server/store";
import { prepararAcervoEmMemoria } from "./acervo-memoria";

beforeEach(prepararAcervoEmMemoria);
test("P15 chamada direta de Buscador não cria post, Curadoria e Anfitrião criam", async () => {
  const form = { tipo: "reflexao" as const, texto: "Estudo o contexto do Poimandres.", temas: [] };
  const hooks = registerHooks({
    resolve(s, c, next) {
      return next(s === "next/navigation" ? "next/dist/api/navigation.react-server.js" : s, c);
    },
  });
  const { publicar } = await import("../src/server/comunidade/operacoes");
  hooks.deregister();
  for (const papel of ["membro", "administrador", "anfitriao"] as const) {
    const conta = { id: papel, pseudonimo: papel, papel } as Membro;
    const r = publicar(form, conta);
    assert.equal(r.ok, papel !== "membro");
  }
  assert.equal(acervo().comunidade.publicacoes.size, 2);
  assert.ok([...acervo().comunidade.publicacoes.values()].every((p) => p.autorId !== "membro"));
});
