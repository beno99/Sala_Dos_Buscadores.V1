import assert from "node:assert/strict";
import { test } from "node:test";
import { artigoVazio, fonteParaForm, fonteVazia } from "../src/features/admin/formularios";
import { salaOficialVazia } from "../src/features/admin/regras/sala";
import { mudarStatusArtigo, salvarArtigo, salvarFonte } from "../src/server/admin/editorial";
import { salvarSalaOficial } from "../src/server/admin/salas";
import { acervo, aguardarGravacoes, esquecerAcervo, sincronizarAcervo } from "../src/server/store";
import { prepararAcervoEmMemoria } from "./acervo-memoria";

test("C05 servidor ignora inicial manipulada e reabertura preserva demais dados bibliográficos", async () => {
  await prepararAcervoEmMemoria();
  const form = {
    ...fonteVazia(),
    titulo: "“The Kybalion’s New Clothes”",
    autor: "Responsável informado no teste",
    tradicao: "Hermetismo moderno e Novo Pensamento",
    referencia: "Referência de teste isolado",
    inicial: "X",
    capa: "bege" as const,
  };
  const r = salvarFonte(form, "Teste isolado");
  assert.ok(r.ok);
  await aguardarGravacoes();
  esquecerAcervo();
  await sincronizarAcervo();
  const fonte = acervo().fontes.get(r.valor.id);
  assert.ok(fonte);
  assert.equal(fonte.inicial, "T");
  assert.equal(fonte.capa, "bege");
  assert.equal(fonte.referencia, form.referencia);
  assert.equal(fonteParaForm(fonte).inicial, "T");
  const edit = salvarFonte({ ...form, id: r.valor.id, titulo: "“Ética”", inicial: "Z" }, "Teste isolado");
  assert.ok(edit.ok);
  assert.equal(acervo().fontes.get(r.valor.id)?.inicial, "É");
});
test("C06 rascunho incompleto é salvo, mas servidor bloqueia publicação sem abertura e campos editoriais", async () => {
  await prepararAcervoEmMemoria();
  const sala = await salvarSalaOficial(
    { ...salaOficialVazia(), nome: "Sala de teste isolado" },
    { id: "teste", pseudonimo: "Teste" },
    "manual",
  );
  assert.ok(sala.ok);
  const salvo = await salvarArtigo(
    { ...artigoVazio(sala.valor.slug), titulo: "Artigo de teste isolado", corpo: [""] },
    "Teste",
    "manual",
  );
  assert.ok(salvo.ok);
  assert.equal(acervo().conteudos.get(salvo.valor.id)?.status, "rascunho");
  const publicar = mudarStatusArtigo(salvo.valor.id, "publicar", "Teste");
  assert.equal(publicar.ok, false);
  assert.equal(acervo().conteudos.get(salvo.valor.id)?.status, "rascunho");
});
