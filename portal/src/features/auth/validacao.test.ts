import { describe, expect, it } from "vitest";
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

// Cadastro, autenticação e preferências no banco: src/modules/conta/conta.test.ts.
