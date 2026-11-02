import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import { eq } from "drizzle-orm";
import type { ConteudoEditorial, SalaEditorial, VideoEditorial } from "../src/data/types";
import { acervoRepositorio } from "../src/modules/acervo/acervo.repositorio";
import { citacoes, conteudos, salas, videos } from "../src/modules/acervo/acervo.schema";
import { ConflitoEditorial, type PedidoEditorial } from "../src/modules/acervo/editorial-atomico";
import { type Banco, usarBanco } from "../src/modules/compartilhado/banco/cliente";
import { auditoria } from "../src/modules/operacao/operacao.schema";

const modulo = process.env.PGLITE_MODULE;
test("SQL: CAS, delta entre processos, rollback de artigo/relações/citação e elegibilidade sob lock", {
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
    // Coluna do lote lixeira ainda aguarda migração aprovada; fixture isolada.
    const db = drizzle(pg);
    usarBanco(db as unknown as Banco);
    const s: SalaEditorial = {
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
      origem: "oficial",
      naComparacao: true,
      status: "publicado",
      criadoEm: "v1",
      atualizadoEm: "v1",
      criadoPor: "Curadoria",
      atualizadoPor: "Curadoria",
    };
    await acervoRepositorio.aplicar({ tipo: "gravar", colecao: "salas", id: "s", valor: s });
    const a = (id: string): ConteudoEditorial => ({
      id,
      sala: "s",
      slug: id,
      tipo: "artigo",
      titulo: id,
      resumo: "Resumo",
      temas: ["alma"],
      periodo: "",
      nivel: 1,
      formato: "texto",
      proveniencia: "curado",
      duracaoMin: 1,
      autoria: { nome: "Autor", credencial: "" },
      publicadoEm: "2026-11-02",
      corpo: ["Texto"],
      fontes: [],
      status: "publicado",
      criadoEm: "v1",
      atualizadoEm: "v1",
      criadoPor: "Curadoria",
      atualizadoPor: "Curadoria",
      situacaoJuridica: null,
      temaDivergente: false,
      notaDivergencia: "",
      producaoIA: false,
    });
    for (const id of ["a", "b"])
      await acervoRepositorio.aplicar({ tipo: "gravar", colecao: "conteudos", id, valor: a(id) });
    const v: VideoEditorial = {
      id: "v",
      youtubeId: "dQw4w9WgXcQ",
      sala: "s",
      titulo: "Vídeo",
      duracao: "01:00",
      temas: ["alma"],
      nivel: 1,
      episodio: "",
      publicadoEm: "2026",
      url: "https://youtu.be/dQw4w9WgXcQ",
      placa: "bordo",
      artigos: [],
      status: "publicado",
      criadoEm: "v1",
      atualizadoEm: "v1",
      criadoPor: "Curadoria",
      atualizadoPor: "Curadoria",
    };
    await acervoRepositorio.aplicar({ tipo: "gravar", colecao: "videos", id: "v", valor: v });
    const pedido = (id: string): PedidoEditorial => ({
      colecao: "conteudos",
      valor: { ...a(id), atualizadoEm: "v2" },
      esperado: "v1",
      ator: { id: "curador-a", papel: "administrador" },
      videos: ["v"],
    });
    await Promise.all([
      acervoRepositorio.salvarEditorial(pedido("a")),
      acervoRepositorio.salvarEditorial({
        ...pedido("b"),
        ator: { id: "curador-b", papel: "administrador" },
      }),
    ]);
    assert.deepEqual(new Set((await db.select().from(videos))[0]?.artigos), new Set(["a", "b"]));
    await assert.rejects(
      acervoRepositorio.salvarEditorial({ ...pedido("a"), valor: { ...a("a"), titulo: "Sobrescrita" } }),
      ConflitoEditorial,
    );
    assert.equal((await db.select().from(conteudos).where(eq(conteudos.id, "a")))[0]?.titulo, "a");
    // Falha no vínculo precisa reverter também mudança do artigo e citação.
    await assert.rejects(
      acervoRepositorio.salvarEditorial({
        ...pedido("a"),
        esperado: "v2",
        valor: { ...a("a"), titulo: "Não gravar", atualizadoEm: "v3" },
        videos: ["inexistente"],
        citacao: {
          id: "q",
          sala: "s",
          obra: "Obra",
          localizacao: "1",
          proveniencia: "primaria",
          traducao: "Trecho",
          referencia: "Fonte",
          capa: "bordo",
          inicial: "O",
        },
      }),
    );
    assert.equal((await db.select().from(conteudos).where(eq(conteudos.id, "a")))[0]?.titulo, "a");
    assert.equal((await db.select().from(citacoes)).length, 0);
    assert.deepEqual(new Set((await db.select().from(videos))[0]?.artigos), new Set(["a", "b"]));
    // Falha de FK ocorre depois dos UPDATEs de artigo/vídeo: rollback real.
    await assert.rejects(
      acervoRepositorio.salvarEditorial({
        ...pedido("a"),
        esperado: "v2",
        valor: { ...a("a"), titulo: "Rollback SQL", atualizadoEm: "v3" },
        videos: [],
        citacao: {
          id: "q-fk",
          sala: "sala-inexistente",
          obra: "Obra",
          localizacao: "1",
          proveniencia: "primaria",
          traducao: "Trecho",
          referencia: "Fonte",
          capa: "bordo",
          inicial: "O",
        },
      }),
    );
    assert.equal((await db.select().from(conteudos).where(eq(conteudos.id, "a")))[0]?.titulo, "a");
    assert.deepEqual(new Set((await db.select().from(videos))[0]?.artigos), new Set(["a", "b"]));
    const [atual] = await db.select().from(videos);
    assert.ok(atual);
    // Editor do vídeo aberto antes de associações paralelas também recebe conflito.
    await assert.rejects(
      acervoRepositorio.salvarEditorial({
        colecao: "videos",
        valor: v,
        esperado: "v1",
        ator: { id: "curador-a", papel: "administrador" },
      }),
      ConflitoEditorial,
    );
    const aud = (id: string) => ({
      id,
      quando: "2026",
      quem: "Curadoria",
      atorId: "curador-a",
      acao: "editou" as const,
      tipoItem: "artigo" as const,
      itemId: "a",
      itemTitulo: "a",
    });
    // R2: a falha é no segundo artigo, depois de Sala, auditoria e primeiro artigo terem sido alterados.
    await assert.rejects(
      acervoRepositorio.aplicarLote([
        {
          tipo: "gravar",
          colecao: "salas",
          id: "s",
          valor: { ...s, nome: "Prefixo indevido", atualizadoEm: "v2" },
          esperado: "v1",
        },
        { tipo: "auditoria", valor: aud("r2-prefixo") },
        {
          tipo: "gravar",
          colecao: "conteudos",
          id: "a",
          valor: { ...a("a"), titulo: "Prefixo artigo", atualizadoEm: "v3" },
          esperado: "v2",
        },
        {
          tipo: "gravar",
          colecao: "conteudos",
          id: "b",
          valor: { ...a("b"), titulo: "Conflita", atualizadoEm: "v3" },
          esperado: "v1",
        },
      ]),
      ConflitoEditorial,
    );
    assert.equal((await db.select().from(salas))[0]?.nome, "Sala");
    assert.equal((await db.select().from(conteudos).where(eq(conteudos.id, "a")))[0]?.titulo, "a");
    assert.equal((await db.select().from(auditoria)).length, 0);
    await db.insert(auditoria).values(aud("r5-duplicada"));
    // R5: a própria falha no INSERT da auditoria desfaz editorial, relações e citação.
    await assert.rejects(
      acervoRepositorio.aplicarLote([
        {
          tipo: "editorial",
          pedido: {
            ...pedido("a"),
            esperado: "v2",
            valor: { ...a("a"), titulo: "Sem auditoria", atualizadoEm: "v3" },
            videos: [],
          },
        },
        { tipo: "auditoria", valor: aud("r5-duplicada") },
      ]),
    );
    assert.equal((await db.select().from(conteudos).where(eq(conteudos.id, "a")))[0]?.titulo, "a");
    assert.deepEqual(new Set((await db.select().from(videos))[0]?.artigos), new Set(["a", "b"]));
    assert.equal((await db.select().from(auditoria)).length, 1);
    const salaSalva = await acervoRepositorio.salvarEditorial({
      colecao: "salas",
      valor: { ...s, nome: "Sala revisada", atualizadoEm: "v2" },
      esperado: "v1",
      ator: { id: "curador-a", papel: "administrador" },
    });
    assert.equal((salaSalva.valor as SalaEditorial).nome, "Sala revisada");
    await assert.rejects(
      acervoRepositorio.salvarEditorial({
        colecao: "salas",
        valor: { ...s, nome: "Sobrescrita" },
        esperado: "v1",
        ator: { id: "curador-b", papel: "administrador" },
      }),
      ConflitoEditorial,
    );
    await db
      .update(salas)
      .set({ lixeira: { em: "agora", por: "curador" } })
      .where(eq(salas.id, "s"));
    await assert.rejects(acervoRepositorio.salvarEditorial({ ...pedido("a"), esperado: "v2" }), /Sala/);
  } finally {
    await pg.close();
  }
});
