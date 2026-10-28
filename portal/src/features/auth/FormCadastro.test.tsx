import { screen, waitFor } from "@testing-library/react";
import { prepararDemonstracao } from "@tests/support/demonstracao";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { contas } from "@/modules/conta";
import { navigationMock } from "../../../tests/support/next-navigation";
import { renderComProviders } from "../../../tests/support/render";

// A Server Action grava cookie; no teste de componente vale só a regra de cadastro (no PGlite).
vi.mock("./acoes", () => ({
  cadastrarAcao: async (d: Parameters<typeof contas.registrar>[0]) => contas.registrar(d),
  entrarAcao: vi.fn(),
  sairAcao: vi.fn(),
  solicitarRedefinicaoAcao: vi.fn(),
}));

import { FormCadastro } from "./FormCadastro";

describe("FormCadastro", () => {
  beforeEach(() => prepararDemonstracao({ demonstracao: false }));

  it("cadastro obrigatório: sem tradição de interesse nem saída sem conta (RF-01, RF-07 no onboarding)", () => {
    renderComProviders(<FormCadastro voltar="/" />);
    expect(screen.queryByRole("group", { name: /Tradições de interesse/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Continuar sem cadastro" })).not.toBeInTheDocument();
    expect(screen.getByText(/duas perguntas opcionais/)).toBeInTheDocument();
  });

  it("mostra erros que dizem como corrigir", async () => {
    const { user } = renderComProviders(<FormCadastro voltar="/" />);
    await user.click(screen.getByRole("button", { name: "Criar conta" }));
    expect(screen.getByText(/escolha um pseudônimo/)).toBeInTheDocument();
    expect(screen.getByText(/escreva seu e-mail/)).toBeInTheDocument();
    expect(screen.getByText(/marque a concordância/)).toBeInTheDocument();
    expect(navigationMock.router.push).not.toHaveBeenCalled();
  });

  it("cria a conta sem interesse informado e volta para onde estava", async () => {
    const { user } = renderComProviders(<FormCadastro voltar="/comparar" />);
    await user.type(screen.getByLabelText("Pseudônimo"), "Leitora");
    await user.type(screen.getByLabelText("E-mail"), "leitora@exemplo.com");
    await user.type(screen.getByLabelText("Senha"), "uma-senha-longa");
    await user.click(screen.getByRole("checkbox", { name: /Concordo com o uso/ }));
    await user.click(screen.getByRole("button", { name: "Criar conta" }));
    await waitFor(() => expect(navigationMock.router.push).toHaveBeenCalledWith("/comparar"));
  });
});
