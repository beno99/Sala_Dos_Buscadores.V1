import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { videosDoConteudo } from "../src/data/repositorio";
import type { ConteudoEditorial } from "../src/data/types";
import { type FormVideo, videoParaForm, videoVazio } from "../src/features/admin/formularios";
import { salaOficialVazia } from "../src/features/admin/regras/sala";
import { listarArtigosParaVideo, videosDaPreviaDoArtigo } from "../src/server/admin/consultas";
import { salvarVideo } from "../src/server/admin/editorial";
import { salvarSalaOficial } from "../src/server/admin/salas";
import { acervo, aguardarGravacoes, esquecerAcervo, sincronizarAcervo } from "../src/server/store";
import { prepararAcervoEmMemoria } from "./acervo-memoria";

function existe<T>(valor: T | undefined): T {
  assert.ok(valor);
  return valor;
}

let sala: string;
beforeEach(async () => {
  await prepararAcervoEmMemoria();
  const resultado = await salvarSalaOficial(
    { ...salaOficialVazia(), nome: "Sala teste" },
    { id: "admin-teste", pseudonimo: "Curadoria" },
    "automatico",
  );
  assert.ok(resultado.ok);
  sala = resultado.valor.slug;
  const existente = existe(acervo().salas.get(resultado.valor.id));
  acervo().salas.set(existente.id, { ...existente, status: "publicado" });
});
const artigo = (id: string, status: "publicado" | "rascunho" = "rascunho") =>
  ({
    id,
    titulo: id,
    slug: id,
    sala,
    tipo: "artigo",
    status,
    criadoEm: "2026-10-31T00:00:00Z",
  }) as ConteudoEditorial;
const form = (): FormVideo => ({
  ...videoVazio(),
  sala,
  titulo: "Vídeo teste",
  url: "https://youtu.be/dQw4w9WgXcQ",
  duracao: "10:00",
  temas: ["alma"],
  nivel: 1,
});

test("salvar mantém ID, deduplica vínculos e remover associação não exclui artigo", async () => {
  const a = artigo("artigo-a");
  acervo().conteudos.set(a.id, a);
  const r = salvarVideo({ ...form(), artigos: [a.id, a.id] }, "Curadoria", "automatico");
  assert.ok(r.ok);
  await aguardarGravacoes();
  esquecerAcervo();
  await sincronizarAcervo();
  const salvo = existe(acervo().videos.get(r.valor.id));
  assert.deepEqual(salvo.artigos, [a.id]);
  assert.equal(salvo.status, "rascunho");
  const novo = salvarVideo({ ...videoParaForm(salvo), artigos: [] }, "Curadoria", "manual");
  assert.ok(novo.ok);
  assert.equal(novo.valor.id, salvo.id);
  assert.deepEqual(acervo().videos.get(salvo.id)?.artigos, []);
  assert.deepEqual(acervo().conteudos.get(a.id), a);
  await aguardarGravacoes();
});

test("vídeos e artigos rascunhos não vazam no público, mas aparecem na prévia administrativa", async () => {
  const a = artigo("artigo-a");
  acervo().conteudos.set(a.id, a);
  const r = salvarVideo({ ...form(), artigos: [a.id] }, "Curadoria", "automatico");
  assert.ok(r.ok);
  assert.equal(videosDaPreviaDoArtigo(a.id).length, 1);
  assert.equal(videosDoConteudo(sala, a.slug).length, 0);
  const v = existe(acervo().videos.get(r.valor.id));
  acervo().videos.set(v.id, { ...v, status: "publicado" });
  assert.equal(videosDoConteudo(sala, a.slug).length, 0);
  acervo().conteudos.set(a.id, { ...a, status: "publicado" });
  assert.equal(videosDoConteudo(sala, a.slug).length, 1);
  acervo().conteudos.set(a.id, { ...a, status: "publicado", slug: "slug-renomeado" });
  assert.equal(videosDoConteudo(sala, "slug-renomeado").length, 1);
  assert.equal(listarArtigosParaVideo(sala)[0]?.id, a.id);
  await aguardarGravacoes();
});

test("POST automático não altera vídeo publicado", async () => {
  const r = salvarVideo(form(), "Curadoria", "automatico");
  assert.ok(r.ok);
  const publicado = { ...existe(acervo().videos.get(r.valor.id)), status: "publicado" as const };
  acervo().videos.set(publicado.id, publicado);
  const resultado = salvarVideo(
    { ...videoParaForm(publicado), titulo: "Alteração indevida" },
    "Curadoria",
    "automatico",
  );
  assert.equal(resultado.ok, false);
  assert.deepEqual(acervo().videos.get(publicado.id), publicado);
  const manual = salvarVideo(
    { ...videoParaForm(publicado), titulo: "Alteração confirmada" },
    "Curadoria",
    "manual",
  );
  assert.ok(manual.ok);
  assert.equal(acervo().videos.get(publicado.id)?.titulo, "Alteração confirmada");
  assert.equal(acervo().videos.get(publicado.id)?.status, "publicado");
  await aguardarGravacoes();
});

test("vínculo arquivado existente é preservado até remoção explícita; ID externo novo é recusado", async () => {
  const a = artigo("artigo-a");
  acervo().conteudos.set(a.id, a);
  const r = salvarVideo({ ...form(), artigos: [a.id] }, "Curadoria", "automatico");
  assert.ok(r.ok);
  const v = existe(acervo().videos.get(r.valor.id));
  acervo().conteudos.set(a.id, { ...a, status: "arquivado" });
  assert.ok(salvarVideo(videoParaForm(v), "Curadoria", "manual").ok);
  assert.deepEqual(acervo().videos.get(v.id)?.artigos, [a.id]);
  assert.equal(
    salvarVideo({ ...videoParaForm(v), artigos: ["inexistente"] }, "Curadoria", "manual").ok,
    false,
  );
  acervo().conteudos.set("externo", { ...a, id: "externo", sala: "outra-sala", status: "rascunho" });
  assert.equal(salvarVideo({ ...videoParaForm(v), artigos: ["externo"] }, "Curadoria", "manual").ok, false);
  assert.deepEqual(acervo().videos.get(v.id)?.artigos, [a.id]);
  await aguardarGravacoes();
});
