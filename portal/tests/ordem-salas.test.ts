import assert from "node:assert/strict";
import { test } from "node:test";
import { ordenarSalas, SALA_INICIAL } from "../src/features/anfitriao/regras/visibilidade";

test("Comece por aqui vem antes de todas as Salas", () => {
  const salas = [
    { slug: "apocrifos", nome: "Apócrifos do Cristianismo Primitivo", origem: "oficial" as const },
    { slug: "astrologia", nome: "Astrologia Hermética", origem: "anfitriao" as const },
    { slug: SALA_INICIAL, nome: "Comece por aqui", origem: "oficial" as const },
    { slug: "corpus", nome: "Corpus Hermeticum", origem: "oficial" as const },
  ];
  assert.deepEqual(
    ordenarSalas(salas).map((s) => s.slug),
    [SALA_INICIAL, "apocrifos", "corpus", "astrologia"],
  );
});
