import assert from "node:assert/strict";
import test from "node:test";
import { destinoAposLogin, destinoSeguro } from "../src/features/auth/validacao";
import { contaAtiva } from "../src/modules/conta/acesso";

test("destino padrão respeita papel e conta pendente", () => {
  for (const [papel, destino] of [
    ["membro", "/"],
    ["anfitriao", "/anfitriao"],
    ["administrador", "/admin"],
  ] as const) {
    assert.equal(destinoAposLogin({ papel, emailVerificadoEm: "2026-01-01" }), destino);
    assert.equal(destinoAposLogin({ papel, emailVerificadoEm: null }, "/biblioteca"), "/confirmar-email");
  }
});
test("retorno explícito é interno e não contorna papel", () => {
  const conta = { papel: "administrador" as const, emailVerificadoEm: "2026-01-01" };
  assert.equal(destinoAposLogin(conta, "/"), "/");
  assert.equal(destinoAposLogin(conta, "/entrar?voltar=%2Fadmin"), "/admin");
  assert.equal(destinoAposLogin(conta, "/biblioteca?q=teste"), "/biblioteca?q=teste");
  for (const inseguro of ["//evil.example", "/\\evil.example", "/\nevil", "https://evil.example"]) {
    assert.equal(destinoSeguro(inseguro), "/");
    assert.equal(destinoAposLogin(conta, inseguro), "/admin");
  }
});
test("conta ativa exige confirmação independentemente de papel", () => {
  assert.equal(contaAtiva(null), false);
  assert.equal(contaAtiva({ emailVerificadoEm: null }), false);
  assert.equal(contaAtiva({ emailVerificadoEm: "2026-01-01" }), true);
});

import { podeEmitirVerificacao } from "../src/modules/conta/acesso";

test("intervalo de reenvio deriva da validade persistida e admite fronteira de um minuto", () => {
  const agora = new Date("2026-11-02T12:00:00Z");
  assert.equal(podeEmitirVerificacao(null, agora), true);
  assert.equal(podeEmitirVerificacao("2026-11-03T12:00:00Z", agora), false);
  assert.equal(podeEmitirVerificacao("2026-11-03T11:59:01Z", agora), false);
  assert.equal(podeEmitirVerificacao("2026-11-03T11:59:00Z", agora), true);
  assert.equal(podeEmitirVerificacao("2026-10-01T12:00:00Z", agora), true);
});

import { hash } from "../src/modules/conta/casos-de-uso/sessao";
import { confirmarEmail, pedirVerificacao } from "../src/modules/conta/casos-de-uso/verificar";
import type { ContaRepositorio, Membro, VerificacaoRepositorio } from "../src/modules/conta/conta.contratos";

test("verificação não entrega token quando persistência recusa emissão", async () => {
  const membro = { id: "u-teste", email: "teste@example.com", emailVerificadoEm: null } as Membro;
  let tentativa: Parameters<VerificacaoRepositorio["criar"]>[0] | undefined;
  const contas = { porId: async () => membro } as unknown as ContaRepositorio;
  const verificacoes: VerificacaoRepositorio = {
    criar: async (pedido) => {
      tentativa = pedido;
      return false;
    },
    consumir: async () => null,
  };
  assert.equal(
    await pedirVerificacao({ contas, verificacoes }, membro.id, new Date("2026-11-02T12:00:00Z")),
    null,
  );
  assert.equal(tentativa?.email, membro.email);
  assert.equal(tentativa?.expiraEm.toISOString(), "2026-11-03T12:00:00.000Z");
});

test("token enviado é aleatório, persistido apenas como hash e consumido uma única vez", async () => {
  const membro = { id: "u-teste", email: "teste@example.com", emailVerificadoEm: null } as Membro;
  let gravado: Parameters<VerificacaoRepositorio["criar"]>[0] | null = null;
  const contas = {
    porId: async () => membro,
    marcarEmailVerificado: async () => ({ ...membro, emailVerificadoEm: "2026-11-02T12:01:00Z" }),
  } as unknown as ContaRepositorio;
  const verificacoes: VerificacaoRepositorio = {
    criar: async (pedido) => {
      gravado = pedido;
      return true;
    },
    consumir: async (tokenHash, agora) => {
      if (!gravado || gravado.tokenHash !== tokenHash || gravado.expiraEm <= agora) return null;
      gravado = null;
      membro.emailVerificadoEm = agora.toISOString();
      return membro.id;
    },
  };
  const deps = { contas, verificacoes };
  const pedido = await pedirVerificacao(deps, membro.id, new Date("2026-11-02T12:00:00Z"));
  assert.ok(pedido);
  assert.ok(pedido.token.length >= 32);
  assert.equal((gravado as unknown as { tokenHash: string }).tokenHash, hash(pedido.token));
  assert.equal((await confirmarEmail(deps, "invalido")).ok, false);
  assert.equal((await confirmarEmail(deps, pedido.token, new Date("2026-11-02T12:01:00Z"))).ok, true);
  assert.equal((await confirmarEmail(deps, pedido.token, new Date("2026-11-02T12:01:01Z"))).ok, false);
  membro.emailVerificadoEm = null;
  const expirado = await pedirVerificacao(deps, membro.id, new Date("2026-11-02T12:00:00Z"));
  assert.ok(expirado);
  assert.equal((await confirmarEmail(deps, expirado.token, new Date("2026-11-03T12:00:00Z"))).ok, false);
});

import { corrigirEEmitir } from "../src/modules/conta/casos-de-uso/corrigir-email";

test("correção emite token junto à troca e informa falha de envio sem perder endereço atualizado", async () => {
  const membro = { id: "u", email: "novo@example.com", emailVerificadoEm: null } as Membro;
  let pedido: { tokenHash: string; expiraEm: Date } | undefined;
  const repositorio = {
    corrigirEmailPendente: async (
      _id: string,
      _email: string,
      token?: { tokenHash: string; expiraEm: Date },
    ) => {
      pedido = token;
      return membro;
    },
    porId: async () => membro,
  };
  const resultado = await corrigirEEmitir(
    repositorio,
    "u",
    membro.email,
    async () => {
      throw new Error("envio indisponível");
    },
    new Date("2026-11-02T12:00:00Z"),
  );
  assert.ok(pedido);
  assert.equal(pedido.expiraEm.toISOString(), "2026-11-03T12:00:00.000Z");
  assert.equal(resultado.ok, true);
  if (resultado.ok) {
    assert.equal(resultado.valor.membro.email, membro.email);
    assert.equal(resultado.valor.enviado, false);
    assert.match(resultado.valor.erroEnvio ?? "", /Reenviar/);
  }
});
test("correção recusada não tenta envio e sucesso informa o endereço usado", async () => {
  const membro = { id: "u", email: "novo@example.com", emailVerificadoEm: null } as Membro;
  let envios = 0;
  const recusada = await corrigirEEmitir(
    { corrigirEmailPendente: async () => null, porId: async () => membro },
    "u",
    membro.email,
    async () => {
      envios++;
    },
  );
  assert.equal(recusada.ok, false);
  assert.equal(envios, 0);
  const ok = await corrigirEEmitir(
    { corrigirEmailPendente: async () => membro, porId: async () => membro },
    "u",
    membro.email,
    async (conta, token) => {
      assert.equal(conta.email, membro.email);
      assert.ok(token.length >= 32);
      envios++;
    },
  );
  assert.equal(envios, 1);
  assert.equal(ok.ok, true);
  if (ok.ok) assert.equal(ok.valor.enviado, true);
});

test("correção relê o endereço atual antes de informar sucesso de envio", async () => {
  const antigo = { id: "u", email: "primeiro@example.com", emailVerificadoEm: null } as Membro;
  const atual = { ...antigo, email: "segundo@example.com" };
  const r = await corrigirEEmitir(
    { corrigirEmailPendente: async () => antigo, porId: async () => atual },
    "u",
    antigo.email,
    async () => {},
  );
  assert.ok(r.ok);
  assert.equal(r.valor.membro.email, atual.email);
  assert.equal(r.valor.enviado, false);
  assert.match(r.valor.erroEnvio ?? "", /outra sessão/);
});
