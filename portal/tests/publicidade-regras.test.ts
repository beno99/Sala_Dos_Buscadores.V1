import assert from "node:assert/strict";
import { test } from "node:test";
import { validarPublicidade } from "../src/features/publicidade/regras";
import { formularioVazio } from "../src/features/publicidade/tipos";

test("rascunho incompleto não ganha conteúdo de placeholder; publicação exige todos os obrigatórios", () => {
  const vazio = formularioVazio("");
  const rascunho = validarPublicidade(vazio, false);
  assert.deepEqual(rascunho.erros, {});
  assert.equal(rascunho.form.titulo, "");
  const { erros } = validarPublicidade(vazio, true);
  for (const campo of ["imagemId", "alt", "titulo", "descricao", "href", "anunciante"])
    assert.ok(erros[campo], campo);
});
test("limites, esquemas executáveis, campos malformados e enquadramento inválido são recusados", () => {
  for (const [campo, limite] of [
    ["categoria", 40],
    ["titulo", 80],
    ["descricao", 240],
    ["textoLink", 30],
    ["anunciante", 80],
  ] as const) {
    assert.ok(
      validarPublicidade({ ...formularioVazio(), [campo]: "a".repeat(limite + 1) }, false).erros[campo],
    );
    assert.equal(
      validarPublicidade({ ...formularioVazio(), [campo]: "a".repeat(limite) }, false).erros[campo],
      undefined,
    );
  }
  for (const href of [
    "javascript:alert(1)",
    "data:text/html,abc",
    "ftp://loja.com",
    "/relativo",
    "https://",
    "https://user:senha@loja.com",
  ])
    assert.ok(validarPublicidade({ ...formularioVazio(), href }, false).erros.href, href);
  for (const href of ["http://loja.com/produto", "https://loja.com/produto?q=1"])
    assert.equal(validarPublicidade({ ...formularioVazio(), href }, false).erros.href, undefined);
  assert.ok(validarPublicidade({ ...formularioVazio(), titulo: 12 }, false).erros.titulo);
  assert.ok(
    validarPublicidade({ ...formularioVazio(), enquadramento: { x: -1, y: 50, zoom: Infinity } }, false).erros
      .enquadramento,
  );
  assert.ok(Object.keys(validarPublicidade(null, true).erros).length);
});
test("texto do link em branco aplica só o padrão e textos são aparados", () => {
  const { form, erros } = validarPublicidade(
    { ...formularioVazio(), textoLink: " ", titulo: "  Produto  " },
    false,
  );
  assert.deepEqual(erros, {});
  assert.equal(form.titulo, "Produto");
  assert.equal(form.textoLink, "Conhecer o produto");
});
