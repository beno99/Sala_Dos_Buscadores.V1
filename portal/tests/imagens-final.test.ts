import assert from "node:assert/strict";
import { test } from "node:test";
import type { SalaEditorial } from "../src/data/types";
import { imagemDaSala, imagemDoCardDaSala } from "../src/server/imagens";
import { salaParaPublico } from "../src/server/store";

test("P14 projeção pública preserva banner e card independentes", () => {
  const sala = { slug: "teste-imagens", imagem: "/midia/banner", imagemCard: "/midia/card" } as SalaEditorial;
  const publica = salaParaPublico(sala);
  assert.equal(imagemDaSala(publica), "/midia/banner");
  assert.equal(imagemDoCardDaSala(publica), "/midia/card");
  assert.equal(imagemDoCardDaSala({ slug: sala.slug, imagem: sala.imagem }), undefined);
});
