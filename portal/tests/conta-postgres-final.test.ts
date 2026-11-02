import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import { eq } from "drizzle-orm";
import { type Banco, usarBanco } from "../src/modules/compartilhado/banco/cliente";
import { contaRepositorio, verificacaoRepositorio } from "../src/modules/conta/conta.repositorio";
import { usuarios, verificacoesEmail } from "../src/modules/conta/conta.schema";

const modulo = process.env.PGLITE_MODULE;
test("contas PostgreSQL isolado: expiração, reenvio, correção, unicidade e confirmação atômica", {
  skip: !modulo,
}, async () => {
  assert.ok(modulo);
  const { PGlite } = await import(pathToFileURL(modulo).href);
  const { drizzle } = createRequire(import.meta.url)(
    "drizzle-orm/pglite",
  ) as typeof import("drizzle-orm/pglite");
  const pg = new PGlite();
  try {
    for (const arquivo of (await readdir("drizzle")).filter((n) => n.endsWith(".sql")).sort())
      await pg.exec(await readFile(`drizzle/${arquivo}`, "utf8"));
    const db = drizzle(pg);
    usarBanco(db as unknown as Banco);
    await db.insert(usuarios).values([
      { id: "u", email: "old@example.com", pseudonimo: "Leitora", senhaHash: "teste", papel: "membro" },
      {
        id: "ocupada",
        email: "ocupado@example.com",
        pseudonimo: "Outra",
        senhaHash: "teste",
        papel: "membro",
      },
    ]);
    const agora = new Date();
    const expira = new Date(agora.getTime() + 24 * 60 * 60_000);
    const criar = (tokenHash: string, email = "old@example.com", expiraEm = expira) =>
      verificacaoRepositorio.criar({ usuarioId: "u", email, tokenHash, expiraEm });
    assert.equal(await criar("primeiro"), true);
    assert.equal(await criar("segundo"), false, "reenvio imediato recusado");
    assert.equal(
      await contaRepositorio.corrigirEmailPendente("u", "novo@example.com"),
      null,
      "correção respeita intervalo",
    );
    assert.equal(
      await verificacaoRepositorio.consumir("primeiro", expira),
      null,
      "fronteira de expiração recusada",
    );
    assert.equal((await contaRepositorio.porId("u"))?.emailVerificadoEm, null);
    await db
      .update(verificacoesEmail)
      .set({ expiraEm: new Date(expira.getTime() - 61_000).toISOString() })
      .where(eq(verificacoesEmail.usuarioId, "u"));
    assert.equal(await contaRepositorio.corrigirEmailPendente("u", "ocupado@example.com"), null);
    assert.equal((await contaRepositorio.porId("u"))?.email, "old@example.com");
    assert.equal(
      (await db.select().from(verificacoesEmail))[0]?.tokenHash,
      "primeiro",
      "unicidade faz rollback sem invalidar token",
    );
    assert.equal(
      (await contaRepositorio.corrigirEmailPendente("u", " NOVO@example.com "))?.email,
      "novo@example.com",
    );
    assert.equal(
      await verificacaoRepositorio.consumir("primeiro", agora),
      null,
      "correção invalida token antigo",
    );
    // Caminho de produção: a correção já grava o token e o marcador de intervalo na mesma transação.
    await db.delete(verificacoesEmail).where(eq(verificacoesEmail.usuarioId, "u"));
    assert.equal(
      (
        await contaRepositorio.corrigirEmailPendente("u", "atomico@example.com", {
          tokenHash: "atomico",
          expiraEm: expira,
        })
      )?.email,
      "atomico@example.com",
    );
    assert.equal((await db.select().from(verificacoesEmail))[0]?.tokenHash, "atomico");
    assert.equal(
      await contaRepositorio.corrigirEmailPendente("u", "outra@example.com", {
        tokenHash: "segunda",
        expiraEm: expira,
      }),
      null,
      "correção atômica mantém throttle sem lacuna",
    );
    assert.equal(await verificacaoRepositorio.consumir("atomico", agora), "u");
    await db
      .update(usuarios)
      .set({ email: "novo@example.com", emailVerificadoEm: null })
      .where(eq(usuarios.id, "u"));
    assert.equal(await criar("obsoleto"), false, "email esperado protege pedido iniciado antes da correção");
    assert.equal(await criar("novo", "novo@example.com"), true);
    assert.equal(await verificacaoRepositorio.consumir("novo", agora), "u");
    assert.equal(await verificacaoRepositorio.consumir("novo", agora), null, "uso único");
    assert.ok((await contaRepositorio.porId("u"))?.emailVerificadoEm);
    assert.equal(
      await contaRepositorio.corrigirEmailPendente("u", "terceiro@example.com"),
      null,
      "confirmado não corrige por fluxo pendente",
    );
    assert.equal(await criar("confirmado", "novo@example.com"), false);
  } finally {
    await pg.close();
  }
});
