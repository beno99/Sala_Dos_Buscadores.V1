import { beforeEach, describe, expect, it } from "vitest";
import {
  apagarConviccao,
  autenticar,
  CONTA_DEMONSTRACAO,
  registrar,
  reiniciarContas,
  salvarPreferencias,
} from "./contas";
import { destinoSeguro, validarEmail, validarPseudonimo, validarSenha } from "./validacao";

describe("validação de conta", () => {
  it("explica como corrigir o e-mail", () => {
    expect(validarEmail("buscador@exemplo")).toMatch(/domínio/);
    expect(validarEmail("buscador@exemplo.com")).toBeNull();
  });

  it("exige senha de 10 caracteres", () => {
    expect(validarSenha("curta")).toMatch(/10/);
    expect(validarSenha("escada-de-quem-sobe")).toBeNull();
  });

  it("não aceita e-mail como pseudônimo, que é público (RF-04)", () => {
    expect(validarPseudonimo("eu@exemplo.com")).toMatch(/visível/);
    expect(validarPseudonimo("Leitora de Hermes")).toBeNull();
  });

  it("só volta para caminhos internos", () => {
    expect(destinoSeguro("/salas/caibalion")).toBe("/salas/caibalion");
    expect(destinoSeguro("//evil.example")).toBe("/");
    expect(destinoSeguro("https://evil.example")).toBe("/");
  });
});

describe("contas simuladas", () => {
  beforeEach(reiniciarContas);

  it("autentica a conta de demonstração e recusa senha errada (RF-02)", () => {
    expect(autenticar(CONTA_DEMONSTRACAO.email, CONTA_DEMONSTRACAO.senha).ok).toBe(true);
    expect(autenticar(CONTA_DEMONSTRACAO.email, "outra-senha-qualquer").ok).toBe(false);
  });

  it("cadastro público sempre cria membro, nunca administrador (RF-08)", () => {
    const r = registrar({
      pseudonimo: "Outro",
      email: "outro@exemplo.com",
      senha: "1234567890",
    });
    expect(r.ok && r.valor.papel).toBe("membro");
  });

  it("conta nova começa sem preferências (vai para o onboarding) e nunca devolve a senha (RF-01, RF-07)", () => {
    const r = registrar({ pseudonimo: "Nova", email: "Nova@Exemplo.com", senha: "1234567890" });
    expect(r.ok && r.valor).toEqual({
      id: expect.stringMatching(/^u-/),
      pseudonimo: "Nova",
      email: "nova@exemplo.com",
      papel: "membro",
      membroDesde: expect.any(String),
      preferencias: null,
    });
    expect(registrar({ pseudonimo: "X2", email: "nova@exemplo.com", senha: "1234567890" }).ok).toBe(false);
  });

  it("a conta de demonstração já fez o onboarding", () => {
    const r = autenticar(CONTA_DEMONSTRACAO.email, CONTA_DEMONSTRACAO.senha);
    const p = r.ok ? r.valor.preferencias : null;
    expect(p?.conviccao).toEqual({ tipo: "nao-informar" });
    expect([...(p?.temas ?? []), ...(p?.salas ?? [])]).toHaveLength(2);
  });

  it("salva preferências e apaga só a convicção", () => {
    registrar({ pseudonimo: "Lia", email: "lia@exemplo.com", senha: "1234567890" });
    const salvo = salvarPreferencias("lia@exemplo.com", {
      temas: ["morte"],
      salas: [],
      conviccao: { tipo: "informada", opcoes: ["budismo"], consentidoEm: "2026-10-07T12:00:00.000Z" },
      concluidoEm: "2026-10-07T12:00:00.000Z",
    });
    expect(salvo.ok && salvo.valor.preferencias?.temas).toEqual(["morte"]);
    const apagado = apagarConviccao("lia@exemplo.com");
    expect(apagado.ok && apagado.valor.preferencias).toMatchObject({
      temas: ["morte"],
      conviccao: { tipo: "pulada" },
    });
  });
});
