import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { test } from "node:test";
import type { ConteudoEditorial, FonteEditorial, RegistroAuditoria, SalaEditorial } from "../src/data/types";
import { ConflitoEditorial } from "../src/modules/acervo/editorial-atomico";
import {
  acervo,
  aguardarGravacoes,
  comGravacoesDoPedido,
  esquecerAcervo,
  incluirAuditoria,
  sincronizarAcervo,
} from "../src/server/store";
import { prepararAcervoEmMemoria } from "./acervo-memoria";

const sala = () =>
  ({
    id: "s",
    slug: "s",
    nome: "Sala",
    origem: "anfitriao",
    status: "em_revisao",
    atualizadoEm: "v1",
    revisao: { donoId: "host", jaPublicado: false, decisoes: [] },
  }) as unknown as SalaEditorial;
const artigo = (id: string) =>
  ({
    id,
    slug: id,
    titulo: id,
    sala: "s",
    tipo: "artigo",
    status: "em_revisao",
    atualizadoEm: "v1",
    fontes: ["f"],
    revisao: { donoId: "host", jaPublicado: false, decisoes: [] },
  }) as unknown as ConteudoEditorial;
const auditoria = (id: string): RegistroAuditoria => ({
  id,
  quando: "2026",
  quem: "Curador",
  acao: "editou",
  tipoItem: "artigo",
  itemId: "a",
  itemTitulo: "Artigo",
});
async function preparar() {
  const dados = await prepararAcervoEmMemoria();
  acervo().salas.set("s", sala());
  for (const id of ["a", "b"]) acervo().conteudos.set(id, artigo(id));
  acervo().fontes.set("f", { id: "f", proposta: { donoId: "host", pendente: true } } as FonteEditorial);
  await aguardarGravacoes();
  return dados;
}
async function revisao() {
  const hooks = registerHooks({
    resolve(s, c, n) {
      return n(s === "next/navigation" ? "next/dist/api/navigation.react-server.js" : s, c);
    },
  });
  const r = await import("../src/server/anfitriao/revisao");
  hooks.deregister();
  return r;
}

test("R2 aprovação inteira reverte Sala, primeiro artigo, fontes e auditoria se segundo artigo conflita", async () => {
  const dados = await preparar();
  const { aprovarSala } = await revisao();
  await assert.rejects(
    comGravacoesDoPedido(async () => {
      const r = await aprovarSala("s", "Curador A");
      assert.ok(r.ok);
      dados.colecoes.conteudos.set("b", { ...artigo("b"), status: "reprovado", atualizadoEm: "v2" });
      return r;
    }),
    ConflitoEditorial,
  );
  assert.equal(dados.colecoes.salas.get("s")?.status, "em_revisao");
  assert.equal(dados.colecoes.conteudos.get("a")?.status, "em_revisao");
  assert.equal(dados.colecoes.conteudos.get("b")?.status, "reprovado");
  assert.equal(dados.colecoes.fontes.get("f")?.proposta?.pendente, true);
  assert.equal(dados.auditoria.length, 0);
  esquecerAcervo();
  await sincronizarAcervo();
  assert.equal(acervo().conteudos.get("a")?.status, "em_revisao");
});

test("R3 pedidos concorrentes não compartilham erro ou alterações locais: falha A, sucesso B", async () => {
  const dados = await preparar();
  dados.auditoria.push(auditoria("duplicada"));
  esquecerAcervo();
  await sincronizarAcervo();
  const resultados = await Promise.allSettled([
    comGravacoesDoPedido(async () => {
      const a = acervo().conteudos.get("a");
      assert.ok(a);
      acervo().conteudos.set("a", { ...a, titulo: "Falha A" });
      incluirAuditoria(auditoria("duplicada"));
      await Promise.resolve();
      return { ok: true };
    }),
    comGravacoesDoPedido(() => {
      const b = acervo().conteudos.get("b");
      assert.ok(b);
      assert.equal(acervo().conteudos.get("a")?.titulo, "a");
      acervo().conteudos.set("b", { ...b, titulo: "Sucesso B" });
      incluirAuditoria(auditoria("aud-b"));
      return { ok: true };
    }),
  ]);
  assert.equal(resultados[0]?.status, "rejected");
  assert.equal(resultados[1]?.status, "fulfilled");
  assert.equal(dados.colecoes.conteudos.get("a")?.titulo, "a");
  assert.equal(dados.colecoes.conteudos.get("b")?.titulo, "Sucesso B");
  assert.equal(dados.auditoria.filter((a) => a.id === "aud-b").length, 1);
});

test("R5 falha de auditoria reverte comando editorial junto com artigo/vídeos", async () => {
  const dados = await preparar();
  dados.auditoria.push(auditoria("duplicada"));
  esquecerAcervo();
  await sincronizarAcervo();
  const { gravarEditorialNoAcervo } = await import("../src/server/store");
  await assert.rejects(
    comGravacoesDoPedido(async () => {
      const a = acervo().conteudos.get("a");
      assert.ok(a);
      await gravarEditorialNoAcervo({
        colecao: "conteudos",
        valor: { ...a, titulo: "Não gravar" },
        esperado: a.atualizadoEm,
        ator: { id: "admin", papel: "administrador" },
      });
      incluirAuditoria(auditoria("duplicada"));
      return { ok: true };
    }),
    /auditoria duplicada/,
  );
  assert.equal(dados.colecoes.conteudos.get("a")?.titulo, "a");
  assert.equal(dados.auditoria.length, 1);
});

test("avisos externos só são agendados após confirmação, nunca após rollback", async () => {
  const dados = await preparar();
  dados.auditoria.push(auditoria("duplicada"));
  esquecerAcervo();
  await sincronizarAcervo();
  const { aposConfirmarPedido } = await import("../src/server/store");
  let agendados = 0;
  await assert.rejects(
    comGravacoesDoPedido(() => {
      aposConfirmarPedido(() => {
        agendados += 1;
      });
      incluirAuditoria(auditoria("duplicada"));
      return { ok: true };
    }),
  );
  assert.equal(agendados, 0);
  await comGravacoesDoPedido(() => {
    incluirAuditoria(auditoria("confirmada"));
    aposConfirmarPedido(() => {
      agendados += 1;
    });
    return { ok: true };
  });
  assert.equal(agendados, 1);
});
