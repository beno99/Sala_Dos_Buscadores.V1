import assert from "node:assert/strict";
import test from "node:test";
import { resumirVisitas, resumoDoPainel } from "../src/features/estudo/painel";
import { progressoVazio } from "../src/features/estudo/tipos";

test("visitas e faltantes usam IDs únicos do mesmo universo elegível", () => {
  assert.deepEqual(resumirVisitas(["a", "a", "antiga", "privada"], ["a", "b", "b"]), {
    visitadas: ["a"],
    faltantes: ["b"],
    total: 2,
  });
  assert.deepEqual(resumirVisitas(["antiga"], []), { visitadas: [], faltantes: [], total: 0 });
});

test("painel não conta visitas antigas, privadas nem duplicadas", () => {
  const p = progressoVazio();
  p.salasVisitadas = ["a", "a", "removida"];
  assert.deepEqual(resumoDoPainel(p, [], ["a", "b"]).salas, { visitadas: 1, total: 2 });
});

import { assinaturasPublicadas } from "../src/features/anfitriao/regras/diretorio";

test("diretório reaproveita somente assinaturas publicadas e não duplica Anfitriões", () => {
  const assinatura = { slug: "nome-publico", nome: "Nome público", credencial: "Pesquisador" };
  assert.deepEqual(assinaturasPublicadas([{}, { anfitriao: assinatura }, { anfitriao: assinatura }]), [
    assinatura,
  ]);
  assert.deepEqual(assinaturasPublicadas([]), []);
});
