// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import { bancoDeTeste } from "../../../tests/support/banco";
import { contas } from "./index";

beforeEach(async () => {
  await bancoDeTeste();
});

describe("módulo de conta no Postgres", () => {
  it("cadastra, autentica com bcrypt e não guarda a senha em texto", async () => {
    const r = await contas.registrar({ pseudonimo: " Lia ", email: "Lia@Exemplo.com", senha: "1234567890" });
    expect(r.ok && r.valor).toMatchObject({ pseudonimo: "Lia", email: "lia@exemplo.com", papel: "membro" });
    expect((await contas.autenticar("lia@exemplo.com", "1234567890")).ok).toBe(true);
    expect((await contas.autenticar("lia@exemplo.com", "errada-errada")).ok).toBe(false);
    const repetido = await contas.registrar({
      pseudonimo: "X",
      email: "LIA@exemplo.com",
      senha: "1234567890",
    });
    expect(repetido.ok).toBe(false);
  });

  it("abre, lê e encerra a sessão; sessão vencida não vale", async () => {
    const r = await contas.registrar({ pseudonimo: "Rui", email: "rui@exemplo.com", senha: "1234567890" });
    if (!r.ok) throw new Error(r.erro);
    const token = await contas.abrirSessao(r.valor.id);
    expect((await contas.membroDaSessao(token))?.id).toBe(r.valor.id);
    expect(await contas.membroDaSessao(token, new Date(Date.now() + 31 * 86_400_000))).toBeNull();
    await contas.encerrarSessao(token);
    expect(await contas.membroDaSessao(token)).toBeNull();
  });

  it("grava preferências e apaga só a convicção; papel de admin não muda", async () => {
    const r = await contas.registrar({ pseudonimo: "Ana", email: "ana@exemplo.com", senha: "1234567890" });
    if (!r.ok) throw new Error(r.erro);
    await contas.salvarPreferencias(r.valor.id, {
      temas: ["alma"],
      salas: [],
      conviccao: { tipo: "informada", opcoes: ["budismo"], consentidoEm: "2026-10-27T10:00:00.000Z" },
      concluidoEm: "2026-10-27T10:00:00.000Z",
    });
    const apagado = await contas.apagarConviccao(r.valor.id);
    expect(apagado.ok && apagado.valor.preferencias).toMatchObject({
      temas: ["alma"],
      conviccao: { tipo: "pulada" },
    });
    expect((await contas.definirPapel(r.valor.id, "anfitriao")).ok).toBe(true);
  });

  it("redefine a senha por link de uso único, encerra as sessões e recusa link vencido", async () => {
    const r = await contas.registrar({ pseudonimo: "Eva", email: "eva@exemplo.com", senha: "1234567890" });
    if (!r.ok) throw new Error(r.erro);
    const sessao = await contas.abrirSessao(r.valor.id);
    expect(await contas.pedirRedefinicao("ninguem@exemplo.com")).toBeNull();
    const vencido = await contas.pedirRedefinicao("eva@exemplo.com");
    if (!vencido) throw new Error("sem pedido");
    expect(
      (await contas.redefinirSenha(vencido.token, "nova-senha-123", new Date(Date.now() + 31 * 60_000))).ok,
    ).toBe(false);
    const pedido = await contas.pedirRedefinicao("eva@exemplo.com");
    if (!pedido) throw new Error("sem pedido");
    expect(await contas.linkDeRedefinicaoValido(pedido.token)).toBe(true);
    expect((await contas.redefinirSenha(pedido.token, "nova-senha-123")).ok).toBe(true);
    expect(await contas.linkDeRedefinicaoValido(pedido.token)).toBe(false);
    expect((await contas.redefinirSenha(pedido.token, "outra-senha-456")).ok).toBe(false);
    expect((await contas.autenticar("eva@exemplo.com", "nova-senha-123")).ok).toBe(true);
    expect((await contas.autenticar("eva@exemplo.com", "1234567890")).ok).toBe(false);
    expect(await contas.membroDaSessao(sessao)).toBeNull();
  });
});
