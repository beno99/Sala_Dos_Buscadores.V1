import assert from "node:assert/strict";

function existe<T>(valor: T | undefined): T {
  assert.ok(valor);
  return valor;
}

import { beforeEach, test } from "node:test";
import { videosDoConteudo } from "../src/data/repositorio";
import type { ConteudoEditorial, SalaEditorial, VideoEditorial } from "../src/data/types";
import { acervo, gravarEditorialNoAcervo } from "../src/server/store";

async function vincular(id: string, videos: string[]) {
  const artigo = existe(acervo().conteudos.get(id));
  await gravarEditorialNoAcervo({
    colecao: "conteudos",
    valor: { ...artigo },
    esperado: artigo.atualizadoEm ?? null,
    ator: { id: "admin", papel: "administrador" },
    videos,
  });
  await aguardarGravacoes();
}

import {
  erroVideosDoArtigo,
  idsVideosDoArtigo,
  videosSelecionaveis,
} from "../src/server/vinculos-editoriais";
import { prepararAcervoEmMemoria } from "./acervo-memoria";

beforeEach(async () => {
  await prepararAcervoEmMemoria();
  for (const slug of ["a", "b"])
    acervo().salas.set(slug, {
      id: slug,
      slug,
      nome: slug,
      status: "publicado",
      origem: "oficial",
    } as SalaEditorial);
  for (const sala of ["a", "b"])
    acervo().conteudos.set(sala, {
      id: sala,
      titulo: sala,
      criadoEm: "2026-01-01",
      atualizadoEm: "2026-01-01",
      slug: "igual",
      sala,
      status: "publicado",
      tipo: "artigo",
      temas: [],
      corpo: [],
      fontes: [],
      autoria: { nome: "Autor" },
    } as unknown as ConteudoEditorial);
  acervo().videos.set("v", {
    id: "v",
    sala: "a",
    status: "publicado",
    artigos: ["a"],
    episodio: "",
    publicadoEm: "2026-01-01",
    temas: ["alma", "cosmos"],
  } as VideoEditorial);
});
test("vínculo pelo artigo cruza Salas, reflete leitura pública e conserva os demais", async () => {
  await vincular("b", ["v"]);
  assert.deepEqual(idsVideosDoArtigo("b"), ["v"]);
  assert.equal(videosDoConteudo("b", "igual")[0]?.id, "v");
  await vincular("b", []);
  assert.deepEqual(acervo().videos.get("v")?.artigos, ["a"]);
  assert.equal(videosDoConteudo("b", "igual").length, 0);
});
test("anfitrião não seleciona rascunhos; vínculo inelegível anterior é preservado", async () => {
  const v = existe(acervo().videos.get("v"));
  acervo().videos.set("v", { ...v, status: "rascunho", artigos: ["a", "b"] });
  assert.deepEqual(videosSelecionaveis("anfitriao"), []);
  assert.ok(erroVideosDoArtigo("novo", ["v"], "anfitriao"));
  acervo().videos.set("v", { ...v, status: "arquivado", artigos: ["a", "b"] });
  await vincular("b", []);
  assert.deepEqual(acervo().videos.get("v")?.artigos, ["a", "b"]);
  assert.equal(videosDoConteudo("b", "igual").length, 0);
});

import { registerHooks } from "node:module";
import { artigoParaForm, artigoVazio, videoParaForm } from "../src/features/admin/formularios";
import {
  filtrarArtigos,
  filtrarVideos,
  lerFiltrosArtigos,
  lerFiltrosVideos,
} from "../src/features/admin/listas";
import { artigoVazio as hostVazio } from "../src/features/anfitriao/regras/artigo";
import type { Membro } from "../src/modules/conta/conta.contratos";
import { salvarArtigo as salvarArtigoAdmin, salvarVideo } from "../src/server/admin/editorial";
import { aguardarGravacoes, esquecerAcervo, sincronizarAcervo } from "../src/server/store";

test("servidor aplica posse host A/B e persiste multitemas sem editar vídeo alheio", async () => {
  const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
      return nextResolve(
        specifier === "next/navigation" ? "next/dist/api/navigation.react-server.js" : specifier,
        context,
      );
    },
  });
  const { salvarArtigo: salvarArtigoHost } = await import("../src/server/anfitriao/editorial");
  hooks.deregister();
  for (const slug of ["alma", "cosmos"])
    acervo().temas.set(slug, { id: slug, slug, nome: slug, sinonimos: [], criadoEm: "2026" } as never);
  const dono = { id: "host-a", papel: "anfitriao", pseudonimo: "Host A" } as Membro;
  acervo().perfis.set(dono.id, {
    contaId: dono.id,
    nome: "Host A",
    slug: "host-a",
    credencial: "",
    apresentacao: "",
    atualizadoEm: "2026",
  });
  const sala = existe(acervo().salas.get("b"));
  acervo().salas.set("b", {
    ...sala,
    origem: "anfitriao",
    revisao: { donoId: dono.id, jaPublicado: false, decisoes: [] },
  });
  const b = existe(acervo().conteudos.get("b"));
  acervo().conteudos.set("b", {
    ...b,
    status: "rascunho",
    revisao: { donoId: dono.id, jaPublicado: false, decisoes: [] },
  });
  const input = { ...hostVazio("b"), id: "b", titulo: "Estudo", temas: ["alma", "cosmos"], videos: ["v"] };
  const negado = await salvarArtigoHost(input, { ...dono, id: "host-b" }, "manual");
  assert.equal(negado.ok, false);
  assert.deepEqual(acervo().videos.get("v")?.artigos, ["a"]);
  const antes = existe(acervo().videos.get("v"));
  const salvo = await salvarArtigoHost(input, dono, "manual");
  assert.ok(salvo.ok);
  await aguardarGravacoes();
  const associado = existe(acervo().videos.get("v"));
  assert.deepEqual(
    { ...associado, atualizadoEm: antes.atualizadoEm },
    { ...antes, artigos: ["a", "b"], atualizadoEm: antes.atualizadoEm },
  );
  await aguardarGravacoes();
  esquecerAcervo();
  await sincronizarAcervo();
  assert.deepEqual(acervo().conteudos.get("b")?.temas, ["alma", "cosmos"]);
  assert.deepEqual(idsVideosDoArtigo("b"), ["v"]);
  assert.equal(videosDoConteudo("b", "igual").length, 0); // host rascunho permanece privado
  assert.ok((await salvarArtigoHost({ ...input, temas: ["cosmos"], videos: [] }, dono, "manual")).ok);
  await aguardarGravacoes();
  assert.deepEqual(acervo().videos.get("v")?.artigos, ["a"]);
  assert.deepEqual(acervo().conteudos.get("b")?.temas, ["cosmos"]);
});

test("admin salva/reabre artigo e vídeo com múltiplos temas e filtros não duplicam", async () => {
  const a = await salvarArtigoAdmin(
    { ...artigoVazio("a"), titulo: "Novo", temas: ["alma", "cosmos"], videos: ["v"] },
    "Curadoria",
    "manual",
  );
  assert.ok(a.ok);
  const video = existe(acervo().videos.get("v"));
  acervo().videos.set("v", { ...video, status: "rascunho" });
  assert.ok(
    (
      await salvarVideo(
        {
          ...videoParaForm({ ...video, status: "rascunho" }),
          titulo: "Vídeo",
          url: "https://youtu.be/dQw4w9WgXcQ",
          duracao: "10:00",
          temas: ["alma", "cosmos"],
        },
        "Curadoria",
        "manual",
      )
    ).ok,
  );
  await aguardarGravacoes();
  esquecerAcervo();
  await sincronizarAcervo();
  const artigo = existe(acervo().conteudos.get(a.valor.id));
  assert.deepEqual(artigoParaForm(artigo).temas, ["alma", "cosmos"]);
  for (const tema of ["alma", "cosmos"]) {
    assert.equal(filtrarArtigos([artigo], lerFiltrosArtigos({ tema })).length, 1);
    assert.equal(filtrarVideos([existe(acervo().videos.get("v"))], lerFiltrosVideos({ tema })).length, 1);
  }
  assert.ok(
    (
      await salvarArtigoAdmin(
        { ...artigoParaForm(artigo), temas: ["cosmos"], videos: [] },
        "Curadoria",
        "manual",
      )
    ).ok,
  );
  assert.deepEqual(acervo().conteudos.get(artigo.id)?.temas, ["cosmos"]);
  assert.deepEqual(idsVideosDoArtigo(artigo.id), []);
});

test("referências públicas entre Salas omitem rascunho e lixeira sem colidir slugs", async () => {
  await vincular("b", ["v"]);
  const publicado = videosDoConteudo("b", "igual")[0];
  assert.deepEqual(
    publicado?.artigosRelacionados?.map((a) => a.sala),
    ["a", "b"],
  );
  const b = existe(acervo().conteudos.get("b"));
  acervo().conteudos.set("b", { ...b, status: "rascunho" });
  assert.deepEqual(
    videosDoConteudo("a", "igual")[0]?.artigosRelacionados?.map((a) => a.id),
    ["a"],
  );
  acervo().conteudos.set("b", b);
  const sala = existe(acervo().salas.get("b"));
  acervo().salas.set("b", { ...sala, lixeira: { em: "2026", por: "Curadoria" } });
  assert.deepEqual(
    videosDoConteudo("a", "igual")[0]?.artigosRelacionados?.map((a) => a.id),
    ["a"],
  );
  assert.equal(videosDoConteudo("b", "igual").length, 0);
});

test("duas edições simultâneas recebem resultado próprio: uma confirma, a outra conflita sem sobrescrever", async () => {
  const criado = await salvarArtigoAdmin({ ...artigoVazio("a"), titulo: "Original" }, "Curadoria", "manual");
  assert.ok(criado.ok);
  const registro = existe(acervo().conteudos.get(criado.valor.id));
  const base = { ...artigoParaForm(registro), versaoEsperada: registro.atualizadoEm };
  const resultados = await Promise.allSettled([
    salvarArtigoAdmin({ ...base, titulo: "Curador A" }, "Curador A", "manual"),
    salvarArtigoAdmin({ ...base, titulo: "Curador B" }, "Curador B", "manual"),
  ]);
  assert.equal(resultados.filter((r) => r.status === "fulfilled").length, 1);
  const rejeitado = resultados.find((r) => r.status === "rejected");
  assert.ok(rejeitado?.status === "rejected");
  assert.match(String(rejeitado.reason), /Outra pessoa alterou/);
  assert.equal(acervo().conteudos.get(registro.id)?.titulo, "Curador A");
  await aguardarGravacoes();
  esquecerAcervo();
  await sincronizarAcervo();
  assert.equal(acervo().conteudos.get(registro.id)?.titulo, "Curador A");
});

test("artigo e cópia preservam citações na operação atômica", async () => {
  const { duplicarArtigo } = await import("../src/server/admin/editorial");
  const vazio = artigoVazio("a");
  const salvo = await salvarArtigoAdmin(
    {
      ...vazio,
      titulo: "Fonte comentada",
      temCitacao: true,
      citacao: {
        ...vazio.citacao,
        obra: "Obra",
        localizacao: "1",
        traducao: "Trecho documental",
        referencia: "Referência",
      },
    },
    "Curadoria",
    "manual",
  );
  assert.ok(salvo.ok);
  const original = existe(acervo().conteudos.get(salvo.valor.id));
  assert.ok(original.citacao);
  assert.equal(acervo().citacoes.get(original.citacao)?.traducao, "Trecho documental");
  const duplicado = await duplicarArtigo(original.id, "Curadoria");
  assert.ok(duplicado.ok);
  const copia = existe(acervo().conteudos.get(duplicado.valor.id));
  assert.ok(copia.citacao);
  assert.notEqual(copia.citacao, original.citacao);
  assert.equal(acervo().citacoes.get(copia.citacao)?.traducao, "Trecho documental");
});
