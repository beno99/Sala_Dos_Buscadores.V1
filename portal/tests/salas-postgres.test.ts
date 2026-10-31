import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import { eq } from "drizzle-orm";
import type { SalaEditorial } from "../src/data/types";
import { acervoRepositorio } from "../src/modules/acervo/acervo.repositorio";
import { citacoes, salas } from "../src/modules/acervo/acervo.schema";
import { type Banco, usarBanco } from "../src/modules/compartilhado/banco/cliente";

// Opcional: PGlite fica fora do projeto; nunca usa DATABASE_URL ou .env.local.
const modulo = process.env.PGLITE_MODULE;
test("SQL PostgreSQL: colisões, preservação de slug e FK em banco isolado", { skip: !modulo }, async () => {
  const { drizzle } = createRequire(import.meta.url)(
    "drizzle-orm/pglite",
  ) as typeof import("drizzle-orm/pglite");
  assert.ok(modulo);
  const { PGlite } = await import(pathToFileURL(modulo).href);
  const pg = new PGlite();
  try {
    for (const arquivo of (await readdir("drizzle")).filter((n) => n.endsWith(".sql")).sort()) {
      await pg.exec(await readFile(`drizzle/${arquivo}`, "utf8"));
    }
    const db = drizzle(pg);
    usarBanco(db as unknown as Banco);
    const sala = (id: string, nome: string): SalaEditorial => ({
      id,
      nome,
      slug: "payload-ignorado",
      tradicao: "Hermetismo",
      tradicaoCurta: "Hermetismo",
      descricao: "Sala de teste isolado.",
      periodo: "",
      placa: "bordo",
      atualizadaEm: "2026-10-31",
      inicial: "H",
      origem: "oficial",
      naComparacao: true,
      status: "rascunho",
      criadoEm: "2026-10-31",
      atualizadoEm: "2026-10-31",
      criadoPor: "teste",
      atualizadoPor: "teste",
    });
    const criadas = await Promise.all(
      Array.from({ length: 12 }, (_, i) => acervoRepositorio.criarSala(sala(`s-${i}`, "Tradição Hermética"))),
    );
    assert.equal(new Set(criadas.map((c) => c.sala.slug)).size, 12);
    assert.equal((await db.select().from(salas)).length, 12);
    assert.equal(await acervoRepositorio.versao(), 12);
    assert.ok(criadas.some((c) => c.sala.slug === "tradicao-hermetica-12"));
    const reservada = await acervoRepositorio.criarSala(sala("reservada", "Nova"));
    assert.equal(reservada.sala.slug, "nova-2");
    const original = criadas[0]?.sala;
    assert.ok(original);
    await db.insert(citacoes).values({
      id: "citacao",
      sala: original.slug,
      obra: "Obra",
      localizacao: "1",
      proveniencia: "primaria",
      traducao: "Trecho",
      referencia: "Referência",
      capa: "bordo",
      inicial: "H",
    });
    await acervoRepositorio.aplicar({
      tipo: "gravar",
      colecao: "salas",
      id: original.id,
      valor: { ...original, nome: "Novo Nome", slug: "tentativa-de-troca" },
    });
    const [editada] = await db.select().from(salas).where(eq(salas.id, original.id));
    assert.equal(editada?.nome, "Novo Nome");
    assert.equal(editada?.slug, original.slug);
    assert.equal((await db.select().from(citacoes))[0]?.sala, original.slug);
    const outra = await acervoRepositorio.criarSala(sala("outra", "Tradição Hermética"));
    assert.equal(outra.sala.slug, "tradicao-hermetica-13");
    assert.equal(await acervoRepositorio.versao(), 15);
  } finally {
    await pg.close();
  }
});
