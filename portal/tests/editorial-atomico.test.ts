import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ConflitoEditorial,
  type EstadoEditorial,
  type PedidoEditorial,
  planejarEditorial,
} from "../src/modules/acervo/editorial-atomico";

const estado = () =>
  ({
    salas: [{ id: "s", slug: "s", status: "publicado" }],
    conteudos: [
      { id: "a", sala: "s", status: "publicado", atualizadoEm: "v1" },
      { id: "b", sala: "s", status: "publicado", atualizadoEm: "v1" },
    ],
    videos: [{ id: "v", sala: "s", status: "publicado", artigos: ["outro"], atualizadoEm: "v1" }],
  }) as EstadoEditorial;
const pedido = (id = "a"): PedidoEditorial => ({
  colecao: "conteudos",
  valor: { ...estado().conteudos[0], id, atualizadoEm: "v2" } as PedidoEditorial["valor"],
  esperado: "v1",
  ator: { id: "admin", papel: "administrador" },
  videos: ["v"],
});
test("releitura sob lock conserva vínculo paralelo e rejeita CAS antigo", () => {
  const e = estado();
  const r = planejarEditorial(pedido(), e);
  assert.deepEqual(r.videos[0]?.artigos, ["outro", "a"]);
  e.videos = r.videos;
  const b = planejarEditorial(pedido("b"), e);
  assert.deepEqual(b.videos[0]?.artigos, ["outro", "a", "b"]);
  e.conteudos[0] = r.valor as EstadoEditorial["conteudos"][number];
  assert.throws(() => planejarEditorial(pedido(), e), ConflitoEditorial);
});

test("anfitrião vincula vídeo só da Sala quando a Sala tem outro artigo publicado", () => {
  const e = estado();
  e.salas.push({
    ...e.salas[0],
    id: "host-sala",
    slug: "host",
    status: "rascunho",
    origem: "anfitriao",
    revisao: { donoId: "host-a", jaPublicado: false, decisoes: [] },
  } as EstadoEditorial["salas"][number]);
  e.videos[0] = { ...e.videos[0], artigos: [] } as EstadoEditorial["videos"][number];
  const artigo = {
    ...e.conteudos[1],
    sala: "host",
    status: "rascunho",
    revisao: { donoId: "host-a", jaPublicado: false, decisoes: [] },
  } as EstadoEditorial["conteudos"][number];
  e.conteudos[1] = artigo;
  const r = planejarEditorial(
    {
      colecao: "conteudos",
      valor: { ...artigo, atualizadoEm: "v2" },
      esperado: "v1",
      ator: { id: "host-a", papel: "anfitriao" },
      videos: ["v"],
    },
    e,
  );
  assert.deepEqual(r.videos[0]?.artigos, ["b"]);
});
