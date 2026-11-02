import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";
import type { ConteudoEditorial, SalaEditorial } from "../src/data/types";
import type { Membro } from "../src/modules/conta/conta.contratos";
import { auditarComo, registrar } from "../src/server/auditoria";
import { aguardarGravacoes, sincronizarAcervo } from "../src/server/store";
import { prepararAcervoEmMemoria } from "./acervo-memoria";

registerHooks({
  resolve(specifier, context, nextResolve) {
    return nextResolve(
      specifier === "next/navigation" ? "next/dist/api/navigation.react-server.js" : specifier,
      context,
    );
  },
});

test("P22 contador e lista de revisão excluem lixeira e somam Salas e artigos, sem duplicar", async () => {
  const { listarAnfitrioes, totalPendenteRevisao } = await import("../src/server/anfitriao/consultas");
  const dados = await prepararAcervoEmMemoria();
  for (const dono of ["host-a", "host-b"]) {
    dados.contas.set(dono, { id: dono, papel: "anfitriao", pseudonimo: dono } as Membro);
    dados.colecoes.salas.set(dono, {
      id: dono,
      slug: dono,
      nome: dono,
      origem: "anfitriao",
      status: "em_revisao",
      atualizadoEm: "2026-11-02",
      revisao: { donoId: dono, decisoes: [] },
    } as unknown as SalaEditorial);
    dados.colecoes.conteudos.set(dono, {
      id: dono,
      sala: dono,
      status: "em_revisao",
      atualizadoEm: "2026-11-02",
      revisao: { donoId: dono, decisoes: [] },
    } as unknown as ConteudoEditorial);
  }
  dados.versao++;
  await sincronizarAcervo();
  assert.equal(totalPendenteRevisao(), 4);
  assert.equal(
    listarAnfitrioes({ soComPendencias: true }).reduce((n, l) => n + l.pendentes, 0),
    4,
  );
  const sala = dados.colecoes.salas.get("host-b");
  assert.ok(sala);
  sala.lixeira = { em: "2026-11-02", por: "curador" };
  dados.versao++;
  await sincronizarAcervo();
  assert.equal(totalPendenteRevisao(), 2);
  const linhas = listarAnfitrioes({ soComPendencias: true });
  assert.equal(linhas.length, 1);
  assert.ok(linhas[0]);
  assert.equal(linhas[0].conta.id, "host-a");
  assert.equal(linhas[0].pendentes, 2);
});

test("P02 nomes iguais não misturam identidade da auditoria em chamadas assíncronas", async () => {
  const dados = await prepararAcervoEmMemoria();
  const registro = (id: string) =>
    registrar({
      quem: "Curadoria",
      acao: "editou",
      tipoItem: "artigo",
      itemId: id,
      itemTitulo: "Estudo de teste",
    });
  await Promise.all(
    ["curador-a", "curador-b"].map((id) =>
      auditarComo(id, async () => {
        await new Promise((resolve) => setTimeout(resolve, id.endsWith("a") ? 10 : 0));
        registro(id);
      }),
    ),
  );
  await aguardarGravacoes();
  assert.equal(dados.auditoria.length, 2);
  for (const r of dados.auditoria) assert.equal(r.atorId, r.itemId);
});
