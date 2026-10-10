import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderComProviders } from "../../../tests/support/render";
import { responder } from "./motor";
import { PainelAssistente } from "./PainelAssistente";

describe("PainelAssistente", () => {
  it("envia a pergunta, mostra a resposta e mantém o aviso de neutralidade fixo", async () => {
    const { user } = renderComProviders(<PainelAssistente />, {
      consultar: async (p, o) => responder(p, o.escopo),
    });
    expect(screen.getByRole("button", { name: "Enviar pergunta" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Qual dessas tradições está certa?" }));
    await user.click(screen.getByRole("button", { name: "Enviar pergunta" }));
    expect(
      await screen.findByText(/Não cabe ao assistente dizer qual tradição é verdadeira/),
    ).toBeInTheDocument();
    expect(screen.getAllByLabelText("Aviso de neutralidade").length).toBeGreaterThanOrEqual(1);
  });

  it("em caso de erro, mantém a pergunta no campo e explica o que fazer", async () => {
    const { user } = renderComProviders(<PainelAssistente />, {
      consultar: async () => {
        throw new Error("rede");
      },
    });
    const campo = screen.getByLabelText("Pergunta ao assistente");
    await user.type(campo, "O que é o Pleroma?");
    await user.keyboard("{Enter}");
    expect(await screen.findByText(/Erro: não foi possível consultar o acervo/)).toBeInTheDocument();
    expect(campo).toHaveValue("O que é o Pleroma?");
    expect(screen.getByText("Erro: a consulta não terminou")).toBeInTheDocument();
  });
});
