import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { test } from "node:test";
import { publicacoesVisiveisComunidade } from "../src/data/repositorio-comunidade";
import type { ConteudoEditorial, SalaEditorial, VideoEditorial } from "../src/data/types";
import type { Membro } from "../src/modules/conta/conta.contratos";
import { acervo, aguardarGravacoes, sincronizarAcervo } from "../src/server/store";
import { prepararAcervoEmMemoria } from "./acervo-memoria";

test("Comunidade: somente Curadoria/Anfitrião publicam; videoId persiste e só referencia vídeo público", async () => {
  const hooks = registerHooks({
    resolve(s, c, next) {
      return next(s === "next/navigation" ? "next/dist/api/navigation.react-server.js" : s, c);
    },
  });
  const { publicar } = await import("../src/server/comunidade/operacoes");
  hooks.deregister();
  const dados = await prepararAcervoEmMemoria();
  const conta = (id: string, papel: Membro["papel"]) => ({
    id,
    papel,
    pseudonimo: "Conta fictícia",
    email: `${id}@example.com`,
    membroDesde: "2026-11-02",
    emailVerificadoEm: "2026-11-02",
    preferencias: null,
  });
  const admin = conta("curador-demo", "administrador");
  const host = conta("host-demo", "anfitriao");
  const membro = conta("membro-demo", "membro");
  for (const c of [admin, host, membro]) dados.contas.set(c.id, c);
  acervo().salas.set("s-demo", {
    id: "s-demo",
    slug: "sala-demo",
    nome: "Sala fictícia",
    origem: "oficial",
    status: "publicado",
    atualizadoEm: "2026-11-02",
    atualizadoPor: "Fixture",
  } as SalaEditorial);
  acervo().conteudos.set("a-demo", {
    id: "a-demo",
    sala: "sala-demo",
    status: "publicado",
    slug: "artigo-demo",
    titulo: "Artigo fictício",
    corpo: [],
    temas: [],
    fontes: [],
  } as unknown as ConteudoEditorial);
  acervo().videos.set("v-demo", {
    id: "v-demo",
    sala: "sala-demo",
    status: "publicado",
    titulo: "Vídeo fictício",
    url: "https://www.youtube.com/watch?v=abcdefghijk",
    temas: [],
    artigos: [],
    duracao: "12:00",
    nivel: 1,
    placa: "bordo",
  } as unknown as VideoEditorial);
  await aguardarGravacoes();
  dados.versao++;
  await sincronizarAcervo();
  const form = {
    tipo: "reflexao" as const,
    texto: "Exemplo fictício para teste de vídeo",
    temas: [],
    videoId: "v-demo",
  };
  assert.equal(publicar(form, membro).ok, false);
  for (const autor of [admin, host]) {
    const r = publicar(form, autor);
    assert.ok(r.ok, JSON.stringify(r));
    await aguardarGravacoes();
    assert.equal(dados.colecoes.publicacoes.get(r.valor.id)?.videoId, "v-demo");
    assert.equal(publicacoesVisiveisComunidade().find((p) => p.id === r.valor.id)?.video?.id, "v-demo");
  }
  for (const status of ["rascunho", "arquivado"] as const) {
    const video = acervo().videos.get("v-demo");
    assert.ok(video);
    acervo().videos.set(video.id, { ...video, status });
    assert.equal(publicar(form, admin).ok, false);
    assert.equal(
      publicacoesVisiveisComunidade().some((p) => p.video),
      false,
    );
  }
  assert.equal(publicar({ ...form, videoId: "inexistente" }, admin).ok, false);
  const video = acervo().videos.get("v-demo");
  assert.ok(video);
  acervo().videos.set(video.id, { ...video, status: "publicado" });
  const sala = acervo().salas.get("s-demo");
  assert.ok(sala);
  acervo().salas.set(sala.id, { ...sala, lixeira: { em: "2026-11-02", por: admin.id } });
  assert.equal(publicar(form, host).ok, false);
  await aguardarGravacoes();
});
