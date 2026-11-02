import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import type { ConteudoEditorial, SalaEditorial, VideoEditorial } from "../src/data/types";
import { planejarLixeiraArtigo } from "../src/features/artigos/lixeira";
import type { AtorLixeira } from "../src/features/salas/lixeira";
import { listarArtigos, listarArtigosArquivados } from "../src/server/admin/consultas";
import { moverArtigo, mudarStatusArtigo } from "../src/server/admin/editorial";
import { excluirArtigoPermanentemente, mudarLixeiraArtigo } from "../src/server/artigos/lixeira";
import { excluirSalaPermanentemente, mudarLixeiraSala } from "../src/server/salas/lixeira";
import { acervo, aguardarGravacoes, auditoriaBruta } from "../src/server/store";
import { prepararAcervoEmMemoria } from "./acervo-memoria";

const admin: AtorLixeira = { id: "curador", papel: "administrador", pseudonimo: "Curadoria" };
const dono: AtorLixeira = { id: "dono", papel: "anfitriao", pseudonimo: "Dono" };
const artigo = (status: ConteudoEditorial["status"] = "rascunho") =>
  ({
    id: "a",
    slug: "poimandres",
    sala: "hermetismo",
    titulo: "Poimandres",
    tipo: "artigo",
    status,
    revisao: { donoId: dono.id, decisoes: [] },
    corpo: [],
    fontes: ["fonte-preservada"],
  }) as unknown as ConteudoEditorial;
beforeEach(async () => {
  await prepararAcervoEmMemoria();
  acervo().salas.set("s", {
    id: "s",
    slug: "hermetismo",
    nome: "Hermetismo",
    origem: "anfitriao",
    status: "rascunho",
    revisao: { donoId: dono.id, decisoes: [] },
  } as unknown as SalaEditorial);
  await aguardarGravacoes();
});
test("lixeira preserva todos os estados e só curadoria restaura", () => {
  for (const status of ["rascunho", "em_revisao", "publicado", "reprovado", "arquivado"] as const) {
    const pedido = {
      id: "a",
      ator: dono,
      acao: "excluir" as const,
      quando: "2026-11-02",
      auditoriaId: status,
    };
    const excluido = planejarLixeiraArtigo(artigo(status), pedido).artigo;
    assert.equal(excluido.status, status);
    assert.deepEqual(excluido.fontes, ["fonte-preservada"]);
    assert.throws(() => planejarLixeiraArtigo(excluido, { ...pedido, acao: "restaurar" }), /permissão/);
    assert.equal(
      planejarLixeiraArtigo(excluido, { ...pedido, ator: admin, acao: "restaurar" }).artigo.status,
      status,
    );
  }
});
test("Sala bloqueia rascunho e arquivado; anfitrião envia à lixeira e curador restaura", async () => {
  for (const status of ["rascunho", "arquivado"] as const) {
    acervo().conteudos.set("a", artigo(status));
    await aguardarGravacoes();
    assert.equal((await mudarLixeiraSala("s", "excluir", dono)).ok, false);
  }
  assert.equal((await mudarLixeiraArtigo("a", "excluir", { ...dono, id: "outro" })).ok, false);
  assert.ok((await mudarLixeiraArtigo("a", "excluir", dono)).ok);
  assert.equal(listarArtigos().length, 0);
  assert.equal(listarArtigosArquivados().length, 1);
  assert.equal(mudarStatusArtigo("a", "publicar", admin.pseudonimo).ok, false);
  assert.equal(moverArtigo("a", "outra", admin.pseudonimo).ok, false);
  assert.equal((await excluirArtigoPermanentemente("a", dono)).ok, false);
  assert.ok((await mudarLixeiraSala("s", "excluir", dono)).ok);
  assert.equal((await excluirSalaPermanentemente("s", admin)).ok, false);
  assert.ok(acervo().conteudos.has("a"));
  assert.ok((await mudarLixeiraSala("s", "restaurar", admin)).ok);
  assert.ok((await mudarLixeiraArtigo("a", "restaurar", admin)).ok);
  assert.equal(acervo().conteudos.get("a")?.status, "arquivado");
});
test("harddelete bloqueia vídeos dependentes sem apagar o artigo ou auditar sucesso", async () => {
  acervo().conteudos.set("a", artigo());
  await aguardarGravacoes();
  assert.ok((await mudarLixeiraArtigo("a", "excluir", dono)).ok);
  acervo().videos.set("v", { id: "v", sala: "hermetismo", artigos: ["a"] } as VideoEditorial);
  await aguardarGravacoes();
  const n = auditoriaBruta().length;
  assert.equal((await excluirArtigoPermanentemente("a", admin)).ok, false);
  assert.ok(acervo().conteudos.has("a"));
  assert.equal(auditoriaBruta().length, n);
});
