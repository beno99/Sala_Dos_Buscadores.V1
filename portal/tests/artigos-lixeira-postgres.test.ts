import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import { eq } from "drizzle-orm";
import type { ConteudoEditorial, Publicacao, SalaEditorial } from "../src/data/types";
import { progressoVazio } from "../src/features/estudo/tipos";
import { acervoRepositorio } from "../src/modules/acervo/acervo.repositorio";
import { conteudos, salas } from "../src/modules/acervo/acervo.schema";
import { type Banco, usarBanco } from "../src/modules/compartilhado/banco/cliente";
import { publicacoes, seguindo } from "../src/modules/comunidade/comunidade.schema";
import { usuarios } from "../src/modules/conta/conta.schema";
import { progressoEstudo } from "../src/modules/estudo/estudo.schema";
import { auditoria } from "../src/modules/operacao/operacao.schema";

const modulo = process.env.PGLITE_MODULE;
test("P25 PostgreSQL isolado: lixeira, bloqueios, rollback e definitiva sem cascata", {
  skip: !modulo,
}, async () => {
  const { drizzle } = createRequire(import.meta.url)(
    "drizzle-orm/pglite",
  ) as typeof import("drizzle-orm/pglite");
  assert.ok(modulo);
  const { PGlite } = await import(pathToFileURL(modulo).href);
  const pg = new PGlite();
  try {
    for (const arquivo of (await readdir("drizzle")).filter((n) => n.endsWith(".sql")).sort())
      await pg.exec(await readFile(`drizzle/${arquivo}`, "utf8"));
    // Schema aditivo em desenvolvimento; a migração integrada é validada pelo lote raiz.
    const db = drizzle(pg);
    usarBanco(db as unknown as Banco);
    const meta = {
      criadoEm: "2026-11-02",
      atualizadoEm: "2026-11-02",
      criadoPor: "Curadoria",
      atualizadoPor: "Curadoria",
      status: "rascunho" as const,
    };
    const sala = {
      ...meta,
      id: "s",
      nome: "Hermetismo",
      slug: "ignorado",
      tradicao: "Hermetismo",
      tradicaoCurta: "Hermetismo",
      descricao: "Leituras",
      periodo: "",
      placa: "bordo",
      atualizadaEm: "2026-11-02",
      inicial: "H",
      origem: "oficial",
      naComparacao: true,
    } as SalaEditorial;
    const criada = await acervoRepositorio.criarSala(sala);
    const artigo: ConteudoEditorial = {
      ...meta,
      id: "a",
      slug: "poimandres",
      sala: criada.sala.slug,
      tipo: "artigo",
      titulo: "Poimandres",
      resumo: "Leitura",
      temas: [],
      periodo: "",
      nivel: 1,
      formato: "texto",
      proveniencia: "primaria",
      duracaoMin: 1,
      autoria: { nome: "Curadoria", credencial: "" },
      publicadoEm: "",
      corpo: ["Trecho"],
      fontes: [],
      situacaoJuridica: null,
      temaDivergente: false,
      notaDivergencia: "",
      producaoIA: false,
    };
    await acervoRepositorio.aplicar({ tipo: "gravar", colecao: "conteudos", id: "a", valor: artigo });
    const ator = { id: "curador", papel: "administrador" as const, pseudonimo: "Curadoria" };
    const pedido = {
      id: "a",
      ator,
      acao: "excluir" as const,
      quando: "2026-11-02",
      auditoriaId: "aud-artigo",
    };
    await assert.rejects(
      acervoRepositorio.mudarLixeiraSala({ ...pedido, id: "s", auditoriaId: "aud-sala" }),
      /todos os artigos/,
    );
    await db.update(salas).set({ status: "publicado" }).where(eq(salas.id, "s"));
    await db.update(conteudos).set({ status: "publicado" }).where(eq(conteudos.id, "a"));
    await db.insert(usuarios).values({
      id: "leitor-publico",
      email: "publico@example.com",
      pseudonimo: "Leitor público",
      senhaHash: "teste",
    });
    await acervoRepositorio.aplicar({
      tipo: "gravar",
      colecao: "progresso",
      id: "leitor-publico",
      valor: {
        ...progressoVazio(),
        leituras: [{ sala: artigo.sala, slug: artigo.slug, pct: 5, atualizadaEm: "2026-11-02" }],
      },
    });
    await acervoRepositorio.aplicar({
      tipo: "seguir",
      acao: "incluir",
      valor: { seguidor: "leitor-publico", alvo: { tipo: "sala", id: artigo.sala } },
    });
    assert.equal((await db.select().from(progressoEstudo)).length, 1);
    assert.equal((await db.select().from(seguindo)).length, 1);
    await db.delete(progressoEstudo);
    await db.delete(seguindo);
    await acervoRepositorio.mudarLixeiraArtigo(pedido);
    assert.ok((await db.select().from(conteudos))[0]?.lixeira);
    await assert.rejects(
      acervoRepositorio.aplicar({ tipo: "gravar", colecao: "conteudos", id: "a", valor: artigo }),
      /lixeira/,
    );
    await assert.rejects(
      acervoRepositorio.aplicar({ tipo: "apagar", colecao: "conteudos", id: "a" }),
      /lixeira/,
    );
    await assert.rejects(acervoRepositorio.mudarLixeiraArtigo({ ...pedido, acao: "restaurar" }));
    assert.ok((await db.select().from(conteudos))[0]?.lixeira, "auditoria duplicada reverte UPDATE");
    await acervoRepositorio.mudarLixeiraSala({ ...pedido, id: "s", auditoriaId: "aud-sala" });
    await assert.rejects(
      acervoRepositorio.excluirSalaPermanentemente({ ...pedido, id: "s", auditoriaId: "aud-def-sala" }),
      /dependentes/,
    );
    assert.equal((await db.select().from(conteudos)).length, 1);
    await db
      .insert(usuarios)
      .values({ id: "leitor", email: "leitor@example.com", pseudonimo: "Leitor", senhaHash: "teste" });
    const ref = `${artigo.sala}/${artigo.slug}`;
    for (const dados of [
      {
        ...progressoVazio(),
        leituras: [{ sala: artigo.sala, slug: artigo.slug, pct: 100, atualizadaEm: "2026-11-02" }],
      },
      { ...progressoVazio(), estante: [{ tipo: "conteudo" as const, ref, em: "2026-11-02" }] },
      { ...progressoVazio(), continuarDispensado: ref },
    ]) {
      await db
        .insert(progressoEstudo)
        .values({ usuarioId: "leitor", dados })
        .onConflictDoUpdate({ target: progressoEstudo.usuarioId, set: { dados } });
      await assert.rejects(
        acervoRepositorio.excluirArtigoPermanentemente({ ...pedido, auditoriaId: "bloqueio-progresso" }),
        /dependentes/,
      );
    }
    await db.delete(progressoEstudo);
    await assert.rejects(
      acervoRepositorio.aplicar({
        tipo: "gravar",
        colecao: "progresso",
        id: "leitor",
        valor: {
          ...progressoVazio(),
          leituras: [{ sala: artigo.sala, slug: artigo.slug, pct: 5, atualizadaEm: "2026-11-02" }],
        },
      }),
      /referência/,
    );
    await assert.rejects(
      acervoRepositorio.aplicar({
        tipo: "seguir",
        acao: "incluir",
        valor: { seguidor: "leitor", alvo: { tipo: "sala", id: artigo.sala } },
      }),
      /referência/,
    );
    const conversa = {
      id: "conversa",
      autorId: "leitor",
      tipo: "reflexao",
      texto: "Uma leitura",
      salaSlug: artigo.sala,
      temas: [],
      conteudoId: artigo.id,
      fixada: false,
      estado: "visivel",
      criadaEm: "2026-11-02",
    } as Publicacao;
    await assert.rejects(
      acervoRepositorio.aplicar({ tipo: "gravar", colecao: "publicacoes", id: conversa.id, valor: conversa }),
      /referência/,
    );
    await assert.rejects(
      acervoRepositorio.aplicar({
        tipo: "gravar",
        colecao: "publicacoes",
        id: "video-ausente",
        valor: {
          ...conversa,
          id: "video-ausente",
          salaSlug: undefined,
          conteudoId: undefined,
          videoId: "video-removido",
        },
      }),
      /referência/,
    );
    // Moderar uma referência legada indisponível segue permitido; não cria outro vínculo.
    await db.insert(publicacoes).values({ ...conversa, imagem: null, citacao: null });
    await acervoRepositorio.aplicar({
      tipo: "gravar",
      colecao: "publicacoes",
      id: conversa.id,
      valor: { ...conversa, estado: "oculta" },
    });
    assert.equal((await db.select().from(publicacoes))[0]?.estado, "oculta");
    await db.delete(publicacoes);
    await acervoRepositorio.excluirArtigoPermanentemente({ ...pedido, auditoriaId: "aud-def-artigo" });
    await acervoRepositorio.excluirSalaPermanentemente({ ...pedido, id: "s", auditoriaId: "aud-def-sala" });
    assert.equal((await db.select().from(salas).where(eq(salas.id, "s"))).length, 0);
    await assert.rejects(
      acervoRepositorio.aplicar({
        tipo: "gravar",
        colecao: "progresso",
        id: "leitor",
        valor: { ...progressoVazio(), estante: [{ tipo: "conteudo", ref, em: "2026-11-02" }] },
      }),
      /referência/,
    );
    await assert.rejects(
      acervoRepositorio.aplicar({
        tipo: "seguir",
        acao: "incluir",
        valor: { seguidor: "leitor", alvo: { tipo: "sala", id: artigo.sala } },
      }),
      /referência/,
    );
    assert.equal((await db.select().from(auditoria)).length, 4);
  } finally {
    await pg.close();
  }
});
