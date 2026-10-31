import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { salaOficialVazia } from "../src/features/admin/regras/sala";
import { salaVisivel } from "../src/features/anfitriao/regras/visibilidade";
import { listarSalasAdmin, salvarSalaOficial } from "../src/server/admin/salas";
import { acervo, aguardarGravacoes } from "../src/server/store";
import { prepararAcervoEmMemoria } from "./acervo-memoria";

beforeEach(async () => {
  await prepararAcervoEmMemoria();
});
test("Sala na lixeira não aparece no catálogo nem na lista editorial ativa", async () => {
  const r = await salvarSalaOficial(
    { ...salaOficialVazia(), nome: "Corpus Hermeticum" },
    { id: "admin", pseudonimo: "Curadoria" },
    "manual",
  );
  assert.ok(r.ok);
  const sala = acervo().salas.get(r.valor.id);
  assert.ok(sala);
  const excluida = {
    ...sala,
    status: "publicado" as const,
    lixeira: { em: "2026-10-31T12:00:00Z", por: "admin" },
  };
  acervo().salas.set(sala.id, excluida);
  assert.equal(salaVisivel(excluida, [{ sala: sala.slug, status: "publicado" }]), false);
  assert.equal(listarSalasAdmin().length, 0);
  await aguardarGravacoes();
});

import { registerHooks } from "node:module";
import type { ComentarioComunidade, ConteudoEditorial, Publicacao, SalaEditorial } from "../src/data/types";
import { type AtorLixeira, planejarLixeiraSala } from "../src/features/salas/lixeira";
import { moverArtigo, mudarStatusArtigo } from "../src/server/admin/editorial";
import { mudarStatusSala, salaParaForm } from "../src/server/admin/salas";
import { listarLixeiraSalas, mudarLixeiraSala } from "../src/server/salas/lixeira";
import { auditoriaBruta, esquecerAcervo, salasVisiveis, sincronizarAcervo } from "../src/server/store";

const admin: AtorLixeira = { id: "admin", papel: "administrador", pseudonimo: "Curadoria" };
const dono: AtorLixeira = { id: "dono", papel: "anfitriao", pseudonimo: "Anfitrião" };
async function criarSala(origem: "oficial" | "anfitriao" = "anfitriao") {
  const r = await salvarSalaOficial(
    { ...salaOficialVazia(), nome: "Leituras do Poimandres" },
    admin,
    "manual",
  );
  assert.ok(r.ok);
  const s = acervo().salas.get(r.valor.id);
  assert.ok(s);
  const sala: SalaEditorial = {
    ...s,
    origem,
    status: "publicado",
    ...(origem === "anfitriao" ? { revisao: { donoId: dono.id, jaPublicado: true, decisoes: [] } } : {}),
  };
  acervo().salas.set(s.id, sala);
  await aguardarGravacoes();
  return sala;
}
test("anfitrião exclui sua Sala publicada; curador restaura endereço, estados e vínculos após reabertura", async () => {
  const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
      return nextResolve(
        specifier === "next/navigation" ? "next/dist/api/navigation.react-server.js" : specifier,
        context,
      );
    },
  });
  const { painelDoAnfitriao } = await import("../src/server/anfitriao/consultas");
  const { artigoDoDono, salaDoDono } = await import("../src/server/sessao");
  hooks.deregister();
  const sala = await criarSala();
  const artigo: ConteudoEditorial = {
    id: "artigo",
    slug: "poimandres",
    sala: sala.slug,
    titulo: "Leitura do Poimandres",
    tipo: "artigo",
    status: "publicado",
    fontes: ["fonte"],
    resumo: "Uma leitura de teste",
    temas: [],
    periodo: "",
    nivel: 1,
    formato: "texto",
    proveniencia: "anfitriao",
    duracaoMin: 1,
    autoria: { nome: "Anfitrião", credencial: "Teste isolado" },
    publicadoEm: "2026-10-31",
    corpo: ["Texto de teste"],
    situacaoJuridica: null,
    temaDivergente: false,
    notaDivergencia: "",
    producaoIA: false,
    criadoEm: "2026-10-31",
    atualizadoEm: "2026-10-31",
    criadoPor: "dono",
    atualizadoPor: "dono",
    revisao: { donoId: dono.id, jaPublicado: true, decisoes: [] },
  };
  const pub = {
    id: "conversa",
    salaSlug: sala.slug,
    estado: "visivel",
    texto: "Uma questão sobre o tratado",
  } as Publicacao;
  const comentario = {
    id: "resposta",
    publicacaoId: pub.id,
    estado: "visivel",
    texto: "Uma resposta preservada",
  } as ComentarioComunidade;
  acervo().conteudos.set(artigo.id, artigo);
  acervo().comunidade.publicacoes.set(pub.id, pub);
  acervo().comunidade.comentarios.set(comentario.id, comentario);
  await aguardarGravacoes();
  assert.equal(salasVisiveis().length, 1);
  assert.ok((await mudarLixeiraSala(sala.id, "excluir", dono)).ok);
  esquecerAcervo();
  await sincronizarAcervo();
  assert.equal(salasVisiveis().length, 0);
  assert.equal(painelDoAnfitriao(dono.id).salas.length, 0);
  assert.equal(listarLixeiraSalas()[0]?.conversas, 1);
  assert.deepEqual(acervo().conteudos.get(artigo.id), artigo);
  assert.deepEqual(acervo().comunidade.publicacoes.get(pub.id), pub);
  assert.deepEqual(acervo().comunidade.comentarios.get(comentario.id), comentario);
  assert.throws(() => salaDoDono(sala.id, dono.id), /lixeira/);
  assert.throws(() => artigoDoDono(artigo.id, dono.id), /lixeira/);
  assert.equal((await mudarLixeiraSala(sala.id, "restaurar", dono)).ok, false);
  assert.ok((await mudarLixeiraSala(sala.id, "restaurar", admin)).ok);
  esquecerAcervo();
  await sincronizarAcervo();
  assert.equal(salasVisiveis()[0]?.slug, sala.slug);
  assert.equal(acervo().salas.get(sala.id)?.status, "publicado");
  assert.deepEqual(acervo().conteudos.get(artigo.id), artigo);
  assert.equal(listarLixeiraSalas().length, 0);
  assert.deepEqual(
    auditoriaBruta()
      .slice(-2)
      .map((a) => a.acao),
    ["excluiu", "restaurou"],
  );
});
test("membro e outro anfitrião não excluem; curador exclui Salas oficiais e de anfitriões", async () => {
  const sala = await criarSala();
  const antes = structuredClone(sala);
  const n = auditoriaBruta().length;
  for (const ator of [
    { ...dono, id: "outro" },
    { ...dono, papel: "membro" as const },
  ])
    assert.equal((await mudarLixeiraSala(sala.id, "excluir", ator)).ok, false);
  assert.deepEqual(acervo().salas.get(sala.id), antes);
  assert.equal(auditoriaBruta().length, n);
  assert.ok((await mudarLixeiraSala(sala.id, "excluir", admin)).ok);
  const oficial = await criarSala("oficial");
  assert.equal((await mudarLixeiraSala(oficial.id, "excluir", dono)).ok, false);
  assert.ok((await mudarLixeiraSala(oficial.id, "excluir", admin)).ok);
  assert.equal((await mudarLixeiraSala(oficial.id, "excluir", admin)).ok, false);
  assert.ok((await mudarLixeiraSala(oficial.id, "restaurar", admin)).ok);
  assert.equal((await mudarLixeiraSala(oficial.id, "restaurar", admin)).ok, false);
});
test("abas antigas não editam, publicam, arquivam ou movem conteúdos de Sala na lixeira", async () => {
  const sala = await criarSala("oficial");
  acervo().conteudos.set("a", {
    id: "a",
    sala: sala.slug,
    titulo: "Rascunho",
    status: "rascunho",
  } as ConteudoEditorial);
  await aguardarGravacoes();
  assert.ok((await mudarLixeiraSala(sala.id, "excluir", admin)).ok);
  assert.equal(
    (await salvarSalaOficial({ ...salaParaForm(sala), nome: "Alteração tardia" }, admin, "manual")).ok,
    false,
  );
  assert.equal(mudarStatusSala(sala.id, "restaurar", admin.pseudonimo).ok, false);
  assert.equal(mudarStatusArtigo("a", "publicar", admin.pseudonimo).ok, false);
  assert.equal(moverArtigo("a", "outra-sala", admin.pseudonimo).ok, false);
  assert.equal(acervo().salas.get(sala.id)?.nome, sala.nome);
});
test("lixeira não altera nenhum estado editorial, inclusive arquivada ou em revisão", async () => {
  const sala = await criarSala();
  for (const status of ["rascunho", "em_revisao", "publicado", "reprovado", "arquivado"] as const) {
    const original = { ...sala, status };
    const pedido = {
      id: sala.id,
      ator: dono,
      acao: "excluir" as const,
      quando: "2026-10-31",
      auditoriaId: "teste",
    };
    const excluida = planejarLixeiraSala(original, pedido).sala;
    assert.equal(excluida.status, status);
    assert.equal(
      planejarLixeiraSala(excluida, { ...pedido, ator: admin, acao: "restaurar" }).sala.status,
      status,
    );
  }
});

test("editar perfil do anfitrião continua funcionando e não regrava Sala da lixeira", async () => {
  const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
      return nextResolve(
        specifier === "next/navigation" ? "next/dist/api/navigation.react-server.js" : specifier,
        context,
      );
    },
  });
  const { salvarPerfil } = await import("../src/server/anfitriao/usuarios").finally(() => hooks.deregister());
  const sala = await criarSala();
  assert.ok((await mudarLixeiraSala(sala.id, "excluir", dono)).ok);
  const antes = structuredClone(acervo().salas.get(sala.id));
  const r = salvarPerfil(
    {
      nome: "Nome atualizado",
      slug: "nome-atualizado",
      credencial: "Pesquisador",
      apresentacao: "Estudos sobre textos antigos.",
      link: "",
      avatar: null,
    },
    {
      ...dono,
      email: "teste@example.org",
      membroDesde: "2026-10-31",
      preferencias: null,
      emailVerificadoEm: "2026-10-31",
    },
  );
  assert.ok(r.ok);
  assert.equal(acervo().perfis.get(dono.id)?.nome, "Nome atualizado");
  assert.deepEqual(acervo().salas.get(sala.id), antes);
  await aguardarGravacoes();
});
