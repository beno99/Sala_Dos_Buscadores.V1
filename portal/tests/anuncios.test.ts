import assert from "node:assert/strict";
import { test } from "node:test";
import {
  anuncioDoPortal,
  linkValido,
  normalizarAnuncio,
  validarAnuncio,
} from "../src/features/anuncios/regras";

const completo = normalizarAnuncio({
  midia: "m-1",
  alt: "Pote de vidro com sal grosso e folhas de guiné",
  titulo: "Sal grosso e guiné",
  descricao: "Kit artesanal.",
  href: "https://sualoja.com/produto",
  anunciante: "Ateliê Exemplo",
});

test("rascunho incompleto pode ser salvo", () => {
  assert.deepEqual(validarAnuncio(normalizarAnuncio({ titulo: "Só o título" }), "rascunho"), {});
});

test("publicar exige todos os obrigatórios", () => {
  const erros = validarAnuncio(normalizarAnuncio({}), "publicar");
  assert.deepEqual(Object.keys(erros).sort(), [
    "campo-alt",
    "campo-anunciante",
    "campo-descricao",
    "campo-href",
    "campo-imagem",
    "campo-titulo",
  ]);
  assert.deepEqual(validarAnuncio(completo, "publicar"), {});
});

test("limites valem também no rascunho", () => {
  const e = validarAnuncio(
    { ...completo, categoria: "x".repeat(41), descricao: "y".repeat(241) },
    "rascunho",
  );
  assert.ok(e["campo-categoria"]);
  assert.ok(e["campo-descricao"]);
});

test("link só http ou https", () => {
  assert.equal(linkValido("https://sualoja.com/produto"), true);
  assert.equal(linkValido("http://a.b"), true);
  assert.equal(linkValido("javascript:alert(1)"), false);
  assert.equal(linkValido("ftp://a.b"), false);
  assert.equal(linkValido("sualoja.com"), false);
  assert.ok(validarAnuncio({ ...completo, href: "javascript:alert(1)" }, "rascunho")["campo-href"]);
});

test("normaliza espaços e foco", () => {
  const f = normalizarAnuncio({ titulo: "  Sal   grosso ", focoX: 140, focoY: -3 });
  assert.equal(f.titulo, "Sal grosso");
  assert.equal(f.focoX, 100);
  assert.equal(f.focoY, 0);
});

test("Portal mostra só publicados", () => {
  const lista = anuncioDoPortal([{ status: "rascunho" as const }, { status: "publicado" as const }]);
  assert.equal(lista.length, 1);
});
