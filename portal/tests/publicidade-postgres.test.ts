import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import { eq } from "drizzle-orm";
import { formularioVazio } from "../src/features/publicidade/tipos";
import { type Banco, usarBanco } from "../src/modules/compartilhado/banco/cliente";
import { usuarios } from "../src/modules/conta/conta.schema";
import {
  imagemVisivel,
  listarDoDono,
  listarPublicados,
  obterDoDono,
  salvarAnuncio,
} from "../src/modules/publicidade/publicidade.repositorio";
import { publicidadeImagens } from "../src/modules/publicidade/publicidade.schema";

const modulo = process.env.PGLITE_MODULE;
test("publicidade SQL: rascunho privado, publicação, edição, posse, concorrência e autorização", {
  skip: !modulo,
}, async () => {
  assert.ok(modulo);
  const { PGlite } = await import(pathToFileURL(modulo).href);
  const { drizzle } = createRequire(import.meta.url)(
    "drizzle-orm/pglite",
  ) as typeof import("drizzle-orm/pglite");
  const pg = new PGlite();
  try {
    for (const file of (await readdir("drizzle")).filter((f) => f.endsWith(".sql")).sort())
      await pg.exec(await readFile(`drizzle/${file}`, "utf8"));
    const db = drizzle(pg);
    usarBanco(db as unknown as Banco);
    for (const id of ["host-a", "host-b", "membro"])
      await db.insert(usuarios).values({
        id,
        email: `${id}@example.invalid`,
        senhaHash: "fixture",
        pseudonimo: id,
        papel: id === "membro" ? "membro" : "anfitriao",
        emailVerificadoEm: new Date().toISOString(),
      });
    const id = "10000000-0000-4000-8000-000000000001";
    const vazio = formularioVazio("Autora");
    const r = await salvarAnuncio("host-a", { id, versao: 0, acao: "rascunho", form: vazio });
    assert.equal(r.ok, true);
    assert.equal((await listarPublicados()).length, 0);
    assert.equal((await listarDoDono("host-a")).length, 1);
    assert.equal((await listarDoDono("host-b")).length, 0);
    assert.equal(await obterDoDono(id, "host-b"), undefined);
    assert.equal((await salvarAnuncio("host-b", { id, versao: 1, acao: "salvar", form: vazio })).ok, false);
    assert.equal(
      (
        await salvarAnuncio("membro", {
          id: "10000000-0000-4000-8000-000000000002",
          versao: 0,
          acao: "rascunho",
          form: vazio,
        })
      ).ok,
      false,
    );
    assert.equal((await salvarAnuncio("host-a", { id, versao: 1, acao: "publicar", form: vazio })).ok, false);
    for (const donoId of ["host-a", "host-b"])
      await db.insert(publicidadeImagens).values({
        id: `img-${donoId}`,
        donoId,
        chave: `publicidade/${donoId}`,
        tipo: "image/png",
        tamanho: 100,
        criadoEm: new Date().toISOString(),
      });
    assert.equal(await imagemVisivel("img-host-a", "host-b"), undefined);
    const completo = {
      ...vazio,
      imagemId: "img-host-a",
      alt: "Frasco de sal com folhas de guiné",
      categoria: "Sais",
      titulo: "Sal grosso e guiné",
      descricao: "Sal e ervas em embalagem de vidro.",
      href: "https://example.com/produto",
    };
    assert.equal(
      (
        await salvarAnuncio("host-a", {
          id,
          versao: 1,
          acao: "publicar",
          form: { ...completo, imagemId: "img-host-b" },
        })
      ).ok,
      false,
    );
    const publicado = await salvarAnuncio("host-a", { id, versao: 1, acao: "publicar", form: completo });
    assert.equal(publicado.ok, true);
    const publicos = await listarPublicados();
    assert.equal(publicos.length, 1);
    assert.ok(publicos[0]);
    assert.equal(publicos[0].titulo, "Sal grosso e guiné");
    assert.equal("donoId" in publicos[0], false);
    assert.ok(await imagemVisivel("img-host-a", "host-b"));
    assert.equal(
      (await salvarAnuncio("host-a", { id, versao: 2, acao: "salvar", form: { ...completo, alt: "" } })).ok,
      false,
    );
    const editado = await salvarAnuncio("host-a", {
      id,
      versao: 2,
      acao: "salvar",
      form: { ...completo, titulo: "Kit de sal e guiné" },
    });
    assert.equal(editado.ok, true);
    assert.equal((await listarPublicados())[0]?.titulo, "Kit de sal e guiné");
    assert.equal(
      (await salvarAnuncio("host-a", { id, versao: 2, acao: "salvar", form: completo })).ok,
      false,
    );
    assert.equal((await salvarAnuncio("host-a", { id, versao: 0, acao: "rascunho", form: vazio })).ok, false);
    assert.equal((await listarDoDono("host-a")).length, 1);
    const privado = await salvarAnuncio("host-a", { id, versao: 3, acao: "rascunho", form: vazio });
    assert.equal(privado.ok, true);
    assert.equal((await listarPublicados()).length, 0);
    assert.equal(await imagemVisivel("img-host-a", "host-b"), undefined);
    // Mudança de papel revoga escrita e exposição de peças antigas.
    await db.update(usuarios).set({ papel: "membro" }).where(eq(usuarios.id, "host-a"));
    assert.equal(
      (await salvarAnuncio("host-a", { id, versao: 4, acao: "publicar", form: completo })).ok,
      false,
    );
  } finally {
    await pg.close();
  }
});
