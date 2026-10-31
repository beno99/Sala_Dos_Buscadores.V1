import assert from "node:assert/strict";
import { test } from "node:test";
import { artigosParaVincular, idsDeArtigosValidos } from "./vinculos-video";

const artigo = (id: string, criadoEm = "2026-10-31T12:00:00Z") =>
  ({ id, titulo: `Artigo ${id}`, sala: "sala", status: "rascunho", tipo: "artigo", criadoEm }) as const;
test("ordena por criação desc e ID, busca antes de paginar e exclui itens inelegíveis", () => {
  const itens = [
    artigo("b"),
    artigo("a"),
    artigo("antigo", "2026-01-01"),
    { ...artigo("x"), sala: "outra" },
    { ...artigo("z"), status: "arquivado" as const },
  ];
  assert.deepEqual(
    artigosParaVincular(itens, "sala").map((a) => a.id),
    ["a", "b", "antigo"],
  );
  assert.deepEqual(
    artigosParaVincular(itens, "sala", "antigo").map((a) => a.id),
    ["antigo"],
  );
});
test("deduplica IDs, restringe Sala e revisão e mantém rascunhos", () => {
  const itens = [artigo("a"), { ...artigo("b"), sala: "outra" }, { ...artigo("c"), revisao: {} }];
  assert.deepEqual(idsDeArtigosValidos(["a", "a", "b", "c", "ausente"], itens, "sala"), ["a"]);
});
