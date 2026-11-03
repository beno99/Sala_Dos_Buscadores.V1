import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import { type Banco, usarBanco } from "../src/modules/compartilhado/banco/cliente";
import { usuarios } from "../src/modules/conta/conta.schema";
import {
  incluirMensagem,
  mensagensDoAnfitriao,
  ultimasMensagens,
} from "../src/modules/conversa/conversa.repositorio";

const modulo = process.env.PGLITE_MODULE;
test("conversa anfitrião–curadoria: ordem, isolamento e última mensagem", { skip: !modulo }, async () => {
  assert.ok(modulo);
  const { PGlite } = await import(pathToFileURL(modulo).href);
  const { drizzle } = createRequire(import.meta.url)(
    "drizzle-orm/pglite",
  ) as typeof import("drizzle-orm/pglite");
  const pg = new PGlite();
  try {
    for (const arquivo of (await readdir("drizzle")).filter((n) => n.endsWith(".sql")).sort())
      await pg.exec(await readFile(`drizzle/${arquivo}`, "utf8"));
    usarBanco(drizzle(pg) as unknown as Banco);
    await drizzle(pg)
      .insert(usuarios)
      .values([
        { id: "a1", email: "a1@example.com", pseudonimo: "Anfitriã", senhaHash: "x", papel: "anfitriao" },
        { id: "a2", email: "a2@example.com", pseudonimo: "Outro", senhaHash: "x", papel: "anfitriao" },
        { id: "cur", email: "c@example.com", pseudonimo: "Curador", senhaHash: "x", papel: "administrador" },
      ]);
    const m = (id: string, anfitriaoId: string, autorId: string, criadaEm: string) =>
      incluirMensagem({ id, anfitriaoId, autorId, texto: id, criadaEm });
    await m("1", "a1", "a1", "2026-11-03T10:00:00.000Z");
    await m("2", "a1", "cur", "2026-11-03T10:05:00.000Z");
    await m("3", "a2", "a2", "2026-11-03T09:00:00.000Z");
    assert.deepEqual(
      (await mensagensDoAnfitriao("a1")).map((x) => x.id),
      ["1", "2"],
    );
    assert.deepEqual(
      (await ultimasMensagens()).map((x) => x.id),
      ["2", "3"],
    );
    await assert.rejects(m("4", "inexistente", "cur", "2026-11-03T11:00:00.000Z"));
  } finally {
    await pg.close();
  }
});
