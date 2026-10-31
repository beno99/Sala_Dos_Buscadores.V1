import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { beforeEach, test } from "node:test";
import { salaOficialVazia, slugDaSala, validarSalaOficial } from "../src/features/admin/regras/sala";
import type { DadosCarregados } from "../src/modules/acervo/acervo.contratos";
import { salvarSalaOficial } from "../src/server/admin/salas";
import { acervo, aguardarGravacoes } from "../src/server/store";
import { prepararAcervoEmMemoria } from "./acervo-memoria";

let dados: DadosCarregados;
const admin = { id: "admin-teste", pseudonimo: "Curadoria" };
const form = (nome: string) => ({ ...salaOficialVazia(), nome });
beforeEach(async () => {
  dados = await prepararAcervoEmMemoria();
});

test("normaliza acentos, espaços, pontuação e corte sem hífen final", () => {
  assert.equal(slugDaSala("  Tradição — São João! "), "tradicao-sao-joao");
  assert.equal(slugDaSala(`${"a".repeat(59)} b`), "a".repeat(59));
  assert.equal(slugDaSala("✨"), "sala");
});

test("primeiro salvamento ignora slug manipulado e trava já no rascunho", async () => {
  const r = await salvarSalaOficial(
    { ...form("Tradição Hermética"), slug: "MANIPULADO/?" },
    admin,
    "automatico",
  );
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.equal(r.valor.slug, "tradicao-hermetica");
  const editado = await salvarSalaOficial(
    { ...form("Novo Nome"), id: r.valor.id, slug: "outro" },
    admin,
    "manual",
  );
  assert.equal(editado.ok, true);
  if (editado.ok) assert.equal(editado.valor.slug, "tradicao-hermetica");
  await aguardarGravacoes();
  assert.equal(dados.colecoes.salas.get(r.valor.id)?.slug, "tradicao-hermetica");
});

test("reservado e duplicados são resolvidos sem pedir edição manual", async () => {
  const reservado = await salvarSalaOficial(form("Nova"), admin, "automatico");
  assert.equal(reservado.ok, true);
  if (reservado.ok) assert.equal(reservado.valor.slug, "nova-2");
  const resultados = await Promise.all(
    Array.from({ length: 3 }, () => salvarSalaOficial(form("São João"), admin, "automatico")),
  );
  assert.ok(resultados.every((r) => r.ok));
  assert.deepEqual(
    new Set(resultados.flatMap((r) => (r.ok ? [r.valor.slug] : []))),
    new Set(["sao-joao", "sao-joao-2", "sao-joao-3"]),
  );
  await aguardarGravacoes();
});

test("colisão que só existe no banco retorna endereço confirmado e sincroniza snapshot", async () => {
  const primeiro = await salvarSalaOficial(form("Nag Hammadi"), admin, "automatico");
  assert.ok(primeiro.ok);
  await aguardarGravacoes();
  const outra = structuredClone(dados.colecoes.salas.get(primeiro.valor.id));
  assert.ok(outra);
  dados.colecoes.salas.set("outra-instancia", { ...outra, id: "outra-instancia", slug: "nag-hammadi-2" });
  const segundo = await salvarSalaOficial(form("Nag Hammadi"), admin, "manual");
  assert.ok(segundo.ok);
  assert.equal(segundo.valor.slug, "nag-hammadi-3");
  assert.equal(acervo().salas.get(segundo.valor.id)?.slug, "nag-hammadi-3");
  await aguardarGravacoes();
});

test("formulário inválido não cria Sala; slug cliente não participa da validação", async () => {
  const r = await salvarSalaOficial({ ...form(""), slug: "inventado" }, admin, "automatico");
  assert.equal(r.ok, false);
  assert.equal(acervo().salas.size, 0);
  assert.equal(dados.colecoes.salas.size, 0);
  assert.equal(validarSalaOficial({ ...form("Nova"), slug: "?" })["campo-sala-slug"], undefined);
});

test("nome novo conserva endereço legado e relações, inclusive após publicação", async () => {
  const r = await salvarSalaOficial(form("Nome de Origem"), admin, "automatico");
  assert.ok(r.ok);
  const s = acervo().salas.get(r.valor.id);
  assert.ok(s);
  acervo().salas.set(s.id, {
    ...s,
    slug: "endereco-legado",
    status: "publicado",
    publicadaEm: "2026-10-01",
    tradicao: "Tradição",
    tradicaoCurta: "Tradição",
    descricao: "Descrição",
    inicial: "N",
  });
  acervo().citacoes.set("citacao", {
    id: "citacao",
    sala: "endereco-legado",
    obra: "Obra",
    localizacao: "1",
    proveniencia: "primaria",
    traducao: "Trecho",
    referencia: "Referência",
    capa: "bordo",
    inicial: "N",
  });
  const f = {
    ...form("Novo Nome"),
    id: s.id,
    slug: "manipulado",
    tradicao: "Tradição",
    tradicaoCurta: "Tradição",
    descricao: "Descrição",
    inicial: "N",
  };
  assert.equal((await salvarSalaOficial(f, admin, "automatico")).ok, false);
  const editada = await salvarSalaOficial(f, admin, "manual");
  assert.ok(editada.ok);
  assert.equal(editada.valor.slug, "endereco-legado");
  assert.equal(acervo().citacoes.get("citacao")?.sala, "endereco-legado");
  await aguardarGravacoes();
});

test("anfitrião compartilha reserva global, conserva rascunho e checa posse", async () => {
  // Reproduz o alias RSC do compilador Next no runner Node (sem simular sessão/posse).
  const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
      return nextResolve(
        specifier === "next/navigation" ? "next/dist/api/navigation.react-server.js" : specifier,
        context,
      );
    },
  });
  const { salvarSala } = await import("../src/server/anfitriao/editorial").finally(() => hooks.deregister());
  const dono = {
    id: "anfitriao",
    pseudonimo: "Anfitrião",
    email: "teste@example.org",
    papel: "anfitriao" as const,
    membroDesde: "2026-10-31",
    preferencias: null,
    emailVerificadoEm: "2026-10-31",
  };
  acervo().perfis.set(dono.id, {
    contaId: dono.id,
    nome: "Anfitrião",
    slug: "anfitriao",
    credencial: "Pesquisador",
    apresentacao: "Textos antigos",
    atualizadoEm: "2026-10-31",
  });
  const oficial = await salvarSalaOficial(form("Nova"), admin, "automatico");
  assert.ok(oficial.ok);
  const f = {
    id: null as string | null,
    nome: "Nova",
    descricao: "Textos antigos",
    periodo: "",
    link: "",
    imagem: null,
    imagemCard: null,
  };
  const criada = await salvarSala(f, dono, "automatico");
  assert.ok(criada.ok);
  assert.equal(criada.valor.slug, "nova-3");
  const editada = await salvarSala({ ...f, id: criada.valor.id, nome: "Nome Alterado" }, dono, "automatico");
  assert.ok(editada.ok);
  assert.equal(editada.valor.slug, "nova-3");
  const alheia = await salvarSala({ ...f, id: oficial.valor.id }, dono, "manual");
  assert.equal(alheia.ok, false);
  await aguardarGravacoes();
});
