import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { createRequire, registerHooks } from "node:module";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import { eq } from "drizzle-orm";
import type { ConteudoEditorial, SalaEditorial } from "../src/data/types";
import { acervoRepositorio } from "../src/modules/acervo/acervo.repositorio";
import { conteudos, salas } from "../src/modules/acervo/acervo.schema";
import { ConflitoEditorial } from "../src/modules/acervo/editorial-atomico";
import { perfisAnfitriao } from "../src/modules/anfitriao/anfitriao.schema";
import { type Banco, usarBanco } from "../src/modules/compartilhado/banco/cliente";
import { sessoes, usuarios } from "../src/modules/conta/conta.schema";
import { auditoria } from "../src/modules/operacao/operacao.schema";
import { auditarComo } from "../src/server/auditoria";
import {
  comGravacoesDoPedido,
  esquecerAcervo,
  incluirAuditoria,
  sincronizarAcervo,
  usarRepositorioDoAcervo,
} from "../src/server/store";

const modulo = process.env.PGLITE_MODULE;
test("conta+acervo SQL: promoção/rebaixamento/exclusão e auditoria fazem rollback juntos", {
  skip: !modulo,
}, async () => {
  assert.ok(modulo);
  const { PGlite } = await import(pathToFileURL(modulo).href);
  const { drizzle } = createRequire(import.meta.url)(
    "drizzle-orm/pglite",
  ) as typeof import("drizzle-orm/pglite");
  const pg = new PGlite();
  try {
    for (const arq of (await readdir("drizzle")).filter((n) => n.endsWith(".sql")).sort())
      await pg.exec(await readFile(`drizzle/${arq}`, "utf8"));
    const db = drizzle(pg);
    usarBanco(db as unknown as Banco);
    usarRepositorioDoAcervo(acervoRepositorio);
    for (const [id, papel] of [
      ["admin", "administrador"],
      ["host", "anfitriao"],
      ["member", "membro"],
    ] as const)
      await db.insert(usuarios).values({
        id,
        email: `${id}@example.invalid`,
        senhaHash: "fixture-nao-autenticavel",
        pseudonimo: id,
        papel,
      });
    await db
      .insert(sessoes)
      .values({ tokenHash: "hash-sessao-fixture", usuarioId: "host", expiraEm: "2099-01-01T00:00:00Z" });
    await db.insert(perfisAnfitriao).values({
      contaId: "host",
      nome: "host",
      slug: "host",
      credencial: "Autor",
      apresentacao: "Estudo",
      atualizadoEm: "v1",
    });
    const sala: SalaEditorial = {
      id: "s",
      slug: "s",
      nome: "Sala",
      tradicao: "Estudo",
      tradicaoCurta: "Estudo",
      descricao: "Descrição",
      periodo: "",
      placa: "bordo",
      atualizadaEm: "2026-11-02",
      inicial: "S",
      origem: "anfitriao",
      naComparacao: true,
      status: "publicado",
      criadoEm: "v1",
      atualizadoEm: "v1",
      criadoPor: "host",
      atualizadoPor: "host",
      revisao: { donoId: "host", jaPublicado: true, decisoes: [] },
    };
    const artigo: ConteudoEditorial = {
      id: "a",
      sala: "s",
      slug: "a",
      tipo: "artigo",
      titulo: "Artigo",
      resumo: "Resumo",
      temas: [],
      periodo: "",
      nivel: 1,
      formato: "texto",
      proveniencia: "anfitriao",
      duracaoMin: 1,
      autoria: { nome: "host", credencial: "Autor" },
      publicadoEm: "2026",
      corpo: ["Texto"],
      fontes: [],
      status: "publicado",
      criadoEm: "v1",
      atualizadoEm: "v1",
      criadoPor: "host",
      atualizadoPor: "host",
      situacaoJuridica: null,
      temaDivergente: false,
      notaDivergencia: "",
      producaoIA: false,
      revisao: { donoId: "host", jaPublicado: true, decisoes: [] },
    };
    await acervoRepositorio.aplicar({ tipo: "gravar", colecao: "salas", id: "s", valor: sala });
    await acervoRepositorio.aplicar({ tipo: "gravar", colecao: "conteudos", id: "a", valor: artigo });
    const dup = {
      id: "duplicada",
      quando: "2026",
      quem: "Curador",
      atorId: "admin",
      acao: "editou" as const,
      tipoItem: "usuario" as const,
      itemId: "host",
      itemTitulo: "host",
    };
    await db.insert(auditoria).values(dup);
    // A mudança de papel chega a executar antes do conflito no conteúdo; ambos revertem.
    await assert.rejects(
      acervoRepositorio.aplicarLote([
        { tipo: "papel-conta", id: "host", esperado: "anfitriao", papel: "membro", atorId: "admin" },
        {
          tipo: "gravar",
          colecao: "conteudos",
          id: "a",
          valor: { ...artigo, titulo: "Não gravar" },
          esperado: "antiga",
        },
      ]),
      ConflitoEditorial,
    );
    assert.equal((await db.select().from(usuarios).where(eq(usuarios.id, "host")))[0]?.papel, "anfitriao");
    const hooks = registerHooks({
      resolve(s, c, n) {
        return n(s === "next/navigation" ? "next/dist/api/navigation.react-server.js" : s, c);
      },
    });
    const operacoes = await import("../src/server/anfitriao/usuarios");
    hooks.deregister();
    const falharDepois = async (fazer: () => Promise<{ ok: boolean }>) => {
      esquecerAcervo();
      await sincronizarAcervo();
      return comGravacoesDoPedido(async () => {
        const r = await auditarComo("admin", fazer);
        assert.ok(r.ok);
        incluirAuditoria(dup);
        return r;
      });
    };
    await assert.rejects(falharDepois(() => operacoes.promover("member", "Curador")));
    assert.equal((await db.select().from(usuarios).where(eq(usuarios.id, "member")))[0]?.papel, "membro");
    assert.equal(
      (await db.select().from(perfisAnfitriao).where(eq(perfisAnfitriao.contaId, "member"))).length,
      0,
    );
    await assert.rejects(falharDepois(() => operacoes.rebaixar("host", { tipo: "manter" }, "Curador")));
    assert.equal((await db.select().from(usuarios).where(eq(usuarios.id, "host")))[0]?.papel, "anfitriao");
    assert.equal((await db.select().from(salas))[0]?.revisao?.congelado, undefined);
    await assert.rejects(falharDepois(() => operacoes.excluirConta("host", { tipo: "manter" }, "Curador")));
    assert.equal((await db.select().from(usuarios).where(eq(usuarios.id, "host"))).length, 1);
    assert.equal((await db.select().from(sessoes)).length, 1);
    assert.equal((await db.select().from(perfisAnfitriao)).length, 1);
    assert.equal((await db.select().from(auditoria)).length, 1);
    // Guardas são refeitas no banco: administrador e autoedição não viram alvos, nem outro papel vira ator.
    await assert.rejects(
      acervoRepositorio.aplicarLote([
        { tipo: "papel-conta", id: "admin", esperado: "membro", papel: "anfitriao", atorId: "admin" },
      ]),
      /curadoria/,
    );
    await assert.rejects(
      acervoRepositorio.aplicarLote([
        { tipo: "papel-conta", id: "member", esperado: "membro", papel: "anfitriao", atorId: "host" },
      ]),
      /curadoria/,
    );
    esquecerAcervo();
    await sincronizarAcervo();
    assert.ok(
      (await auditarComo("admin", () => operacoes.rebaixar("host", { tipo: "manter" }, "Curador"))).ok,
    );
    assert.equal((await db.select().from(usuarios).where(eq(usuarios.id, "host")))[0]?.papel, "membro");
    assert.equal((await db.select().from(salas))[0]?.revisao?.congelado, true);
    assert.equal((await db.select().from(conteudos))[0]?.revisao?.congelado, true);
    assert.equal((await db.select().from(auditoria)).filter((a) => a.acao === "rebaixou").length, 1);
    assert.ok((await auditarComo("admin", () => operacoes.promover("member", "Curador"))).ok);
    assert.equal((await db.select().from(usuarios).where(eq(usuarios.id, "member")))[0]?.papel, "anfitriao");
    assert.equal(
      (await db.select().from(perfisAnfitriao).where(eq(perfisAnfitriao.contaId, "member"))).length,
      1,
    );
    // Fixture volta a ser anfitrião para testar a exclusão bem-sucedida e suas cascatas.
    await db.update(usuarios).set({ papel: "anfitriao" }).where(eq(usuarios.id, "host"));
    esquecerAcervo();
    await sincronizarAcervo();
    assert.ok(
      (await auditarComo("admin", () => operacoes.excluirConta("host", { tipo: "manter" }, "Curador"))).ok,
    );
    assert.equal((await db.select().from(usuarios).where(eq(usuarios.id, "host"))).length, 0);
    assert.equal((await db.select().from(sessoes)).length, 0);
    assert.equal(
      (await db.select().from(perfisAnfitriao).where(eq(perfisAnfitriao.contaId, "host"))).length,
      0,
    );
    assert.equal(
      (await db.select().from(auditoria)).filter(
        (a) => a.acao === "excluiu-definitivamente" && a.itemId === "host" && a.atorId === "admin",
      ).length,
      1,
    );
  } finally {
    await pg.close();
  }
});
