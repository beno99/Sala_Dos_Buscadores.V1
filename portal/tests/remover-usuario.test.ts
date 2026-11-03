import assert from "node:assert/strict";
import { test } from "node:test";
import { validarContaNoLote } from "../src/modules/acervo/contas-no-lote";
import type { Papel } from "../src/modules/conta/conta.contratos";

const contas = new Map<string, { id: string; papel: Papel }>([
  ["cur", { id: "cur", papel: "administrador" }],
  ["cur2", { id: "cur2", papel: "administrador" }],
  ["mem", { id: "mem", papel: "membro" }],
  ["anf", { id: "anf", papel: "anfitriao" }],
]);
const excluir = (id: string, atorId: string, esperado: "membro" | "anfitriao" = "membro") =>
  validarContaNoLote({ tipo: "excluir-conta", id, esperado, atorId }, contas);

test("curador remove buscador e anfitrião", () => {
  assert.doesNotThrow(() => excluir("mem", "cur"));
  assert.doesNotThrow(() => excluir("anf", "cur", "anfitriao"));
});

test("só curador remove", () => {
  assert.throws(() => excluir("mem", "anf"));
  assert.throws(() => excluir("anf", "mem", "anfitriao"));
});

test("conta de curador não é removida", () => {
  assert.throws(() => excluir("cur2", "cur"));
  assert.throws(() => excluir("cur", "cur"));
});
