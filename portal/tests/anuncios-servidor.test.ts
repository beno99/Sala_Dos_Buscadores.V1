import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { before, test } from "node:test";
import { normalizarAnuncio } from "../src/features/anuncios/regras";
import type { Membro } from "../src/modules/conta/conta.contratos";
import { acervo, sincronizarAcervo } from "../src/server/store";
import { prepararAcervoEmMemoria } from "./acervo-memoria";

type Servidor = typeof import("../src/server/anuncios");
type Revisao = typeof import("../src/server/anfitriao/revisao");
let s: Servidor;
let revisao: Revisao;
before(async () => {
  const hooks = registerHooks({
    resolve(e, c, next) {
      return next(e === "next/navigation" ? "next/dist/api/navigation.react-server.js" : e, c);
    },
  });
  s = await import("../src/server/anuncios");
  revisao = await import("../src/server/anfitriao/revisao");
  hooks.deregister();
});

const ana = { id: "ana", pseudonimo: "Ana", papel: "anfitriao" } as Membro;
const bia = { id: "bia", pseudonimo: "Bia", papel: "anfitriao" } as Membro;

async function preparar() {
  const dados = await prepararAcervoEmMemoria();
  dados.contas.set("ana", ana);
  dados.contas.set("bia", bia);
  dados.versao++;
  await sincronizarAcervo();
}

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

const ok = <T>(r: { ok: boolean; valor?: T; mensagem: string }): T => {
  assert.ok(r.ok, r.mensagem);
  return r.valor as T;
};

test("rascunho incompleto, envio à curadoria e aprovação", async () => {
  await preparar();
  midia("m-ana", "ana");
  const { id } = ok(s.salvarAnuncio(normalizarAnuncio({ titulo: "Sal grosso" }), ana, "automatico"));
  assert.equal(s.anuncioDoDono(id, "ana")?.status, "rascunho");

  const incompleto = s.enviarAnuncio(id, true, ana);
  assert.equal(incompleto.ok, false);
  assert.ok(!incompleto.ok && incompleto.erros?.["campo-imagem"]);

  ok(s.salvarAnuncio({ ...completo("m-ana"), id }, ana, "automatico"));
  assert.equal(s.enviarAnuncio(id, false, ana).ok, false, "sem aceite não envia");
  ok(s.enviarAnuncio(id, true, ana));
  assert.equal(s.anuncioDoDono(id, "ana")?.status, "em_revisao");
  assert.equal(s.anuncioParaOPortal("visitante"), undefined, "em revisão não vai ao Portal");
  assert.equal(s.salvarAnuncio({ ...completo("m-ana"), id }, ana, "automatico").ok, false);

  ok(await revisao.aprovarAnuncio(id, "Curadoria"));
  const publicado = s.anuncioDoDono(id, "ana");
  assert.equal(publicado?.status, "publicado");
  assert.ok(publicado?.publicadoEm);
  assert.equal(s.anuncioParaOPortal("visitante")?.id, id);
});

test("editar anúncio no ar exige confirmação e tira do ar", async () => {
  await preparar();
  midia("m-ana", "ana");
  const { id } = ok(s.salvarAnuncio(completo("m-ana"), ana, "automatico"));
  ok(s.enviarAnuncio(id, true, ana));
  ok(await revisao.aprovarAnuncio(id, "Curadoria"));

  const mudado = { ...completo("m-ana"), id, titulo: "Novo título" };
  assert.equal(s.salvarAnuncio(mudado, ana, "automatico").ok, false);
  const r = ok(s.salvarAnuncio(mudado, ana, "manual"));
  assert.equal(r.saiuDoAr, true);
  assert.equal(s.anuncioDoDono(id, "ana")?.status, "rascunho");
  assert.equal(s.anuncioParaOPortal("visitante"), undefined);
  assert.equal(s.excluirAnuncio(id, ana).ok, false, "o que já foi ao ar não se exclui");
});

test("reprovação volta com o motivo", async () => {
  await preparar();
  midia("m-ana", "ana");
  const { id } = ok(s.salvarAnuncio(completo("m-ana"), ana, "automatico"));
  ok(s.enviarAnuncio(id, true, ana));
  ok(await revisao.reprovarAnuncio(id, "Tire a promessa de resultado.", "Curadoria"));
  const a = s.anuncioDoDono(id, "ana");
  assert.equal(a?.status, "reprovado");
  assert.equal(a?.revisao?.ultimoMotivo, "Tire a promessa de resultado.");
  ok(s.excluirAnuncio(id, ana));
  assert.equal(s.anunciosDoDono("ana").length, 0);
});

test("outro anfitrião não edita nem usa imagem alheia", async () => {
  await preparar();
  midia("m-ana", "ana");
  const { id } = ok(s.salvarAnuncio(completo("m-ana"), ana, "automatico"));
  assert.equal(s.salvarAnuncio({ ...completo("m-ana"), id }, bia, "automatico").ok, false);
  assert.equal(s.enviarAnuncio(id, true, bia).ok, false);
  assert.equal(s.anuncioDoDono(id, "bia"), undefined);
  assert.equal(s.salvarAnuncio(completo("m-ana"), bia, "automatico").ok, false);
  assert.equal(s.anunciosDoDono("bia").length, 0);
});

test("membro não cria publicidade", async () => {
  await preparar();
  const r = s.salvarAnuncio(
    normalizarAnuncio({ titulo: "x" }),
    { id: "m", pseudonimo: "M", papel: "membro" } as Membro,
    "automatico",
  );
  assert.equal(r.ok, false);
});
