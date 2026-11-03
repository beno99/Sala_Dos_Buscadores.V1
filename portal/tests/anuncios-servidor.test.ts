import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { before, beforeEach, test } from "node:test";
import { normalizarAnuncio } from "../src/features/anuncios/regras";
import type { Membro } from "../src/modules/conta/conta.contratos";
import { acervo } from "../src/server/store";
import { prepararAcervoEmMemoria } from "./acervo-memoria";

beforeEach(prepararAcervoEmMemoria);

let anuncioDoDono: typeof import("../src/server/anuncios").anuncioDoDono;
let anunciosDoDono: typeof import("../src/server/anuncios").anunciosDoDono;
let salvarAnuncio: typeof import("../src/server/anuncios").salvarAnuncio;
before(async () => {
  const hooks = registerHooks({
    resolve(s, c, next) {
      return next(s === "next/navigation" ? "next/dist/api/navigation.react-server.js" : s, c);
    },
  });
  ({ anuncioDoDono, anunciosDoDono, salvarAnuncio } = await import("../src/server/anuncios"));
  hooks.deregister();
});

const ana = { id: "ana", pseudonimo: "Ana", papel: "anfitriao" } as Membro;
const bia = { id: "bia", pseudonimo: "Bia", papel: "anfitriao" } as Membro;
const midia = (id: string, donoId: string) =>
  acervo().midias.set(id, {
    id,
    chave: `midias/${donoId}/${id}`,
    tipo: "image/webp",
    tamanho: 1,
    donoId,
    criadoEm: "",
  });

const completo = (m: string) =>
  normalizarAnuncio({
    midia: m,
    alt: "Pote de sal grosso com guiné",
    titulo: "Sal grosso e guiné",
    descricao: "Kit artesanal.",
    href: "https://sualoja.com/produto",
    anunciante: "Ana",
  });

test("rascunho, publicação e edição pelo dono", () => {
  midia("m-ana", "ana");
  const r1 = salvarAnuncio(normalizarAnuncio({ titulo: "Sal grosso" }), ana, "rascunho");
  assert.ok(r1.ok);
  const id = r1.valor.id;
  assert.equal(anuncioDoDono(id, "ana")?.status, "rascunho");

  const semImagem = salvarAnuncio({ ...completo("m-ana"), id, midia: null }, ana, "publicar");
  assert.equal(semImagem.ok, false);
  assert.ok(!semImagem.ok && semImagem.erros?.["campo-imagem"]);

  const r2 = salvarAnuncio({ ...completo("m-ana"), id }, ana, "publicar");
  assert.ok(r2.ok);
  const publicado = anuncioDoDono(id, "ana");
  assert.equal(publicado?.status, "publicado");
  assert.ok(publicado?.publicadoEm);
  assert.equal(anunciosDoDono("ana").length, 1);

  const r3 = salvarAnuncio({ ...completo("m-ana"), id, titulo: "Novo título" }, ana, "rascunho");
  assert.ok(r3.ok);
  assert.equal(anuncioDoDono(id, "ana")?.status, "rascunho");
  assert.equal(anuncioDoDono(id, "ana")?.titulo, "Novo título");
});

test("outro anfitrião não edita nem usa imagem alheia", () => {
  midia("m-ana", "ana");
  const r = salvarAnuncio(completo("m-ana"), ana, "publicar");
  assert.ok(r.ok);
  const invasao = salvarAnuncio({ ...completo("m-ana"), id: r.valor.id }, bia, "publicar");
  assert.equal(invasao.ok, false);
  assert.equal(anuncioDoDono(r.valor.id, "bia"), undefined);
  const imagemAlheia = salvarAnuncio(completo("m-ana"), bia, "publicar");
  assert.equal(imagemAlheia.ok, false);
  assert.equal(anunciosDoDono("bia").length, 0);
});

test("membro não cria publicidade", () => {
  const r = salvarAnuncio(
    normalizarAnuncio({}),
    { id: "m", pseudonimo: "M", papel: "membro" } as Membro,
    "rascunho",
  );
  assert.equal(r.ok, false);
});
