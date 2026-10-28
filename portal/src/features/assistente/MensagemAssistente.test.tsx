import { screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { renderComProviders } from "../../../tests/support/render";
import { MensagemAssistente, textoParaCopiar } from "./MensagemAssistente";
import { responder } from "./motor";

describe("MensagemAssistente", () => {
  // O motor lê as Salas do banco do teste, que sobe no beforeAll.
  let resposta: ReturnType<typeof responder>;
  beforeAll(() => {
    resposta = responder("O que acontece com a alma após a morte?");
  });

  it("se identifica como IA, separa os três tipos de trecho e numera as fontes (RF-27 a RF-29)", () => {
    const { container } = renderComProviders(
      <MensagemAssistente resposta={resposta} duracaoMs={3200} gerando={false} onGerarNovamente={vi.fn()} />,
    );
    expect(screen.getByText("Assistente de IA")).toBeInTheDocument();
    expect(screen.getByText("Síntese por IA")).toBeInTheDocument();
    expect(container.querySelectorAll(".sdb-seg--doc")).toHaveLength(2);
    expect(container.querySelectorAll(".sdb-seg--editorial")).toHaveLength(2);
    expect(container.querySelectorAll(".sdb-seg--ai")).toHaveLength(1);
    expect(screen.getByText("Fontes citadas")).toBeInTheDocument();
    expect(container.querySelectorAll(".sdb-source--row")).toHaveLength(resposta.fontes.length);
    expect(screen.getByLabelText("Aviso de neutralidade")).toHaveTextContent(
      /não determina qual crença é verdadeira/,
    );
  });

  it("marca a avaliação como exclusiva e confirma com toast", async () => {
    const { user } = renderComProviders(
      <MensagemAssistente resposta={resposta} duracaoMs={1000} gerando={false} onGerarNovamente={vi.fn()} />,
    );
    await user.click(screen.getByRole("button", { name: "Útil" }));
    expect(screen.getByRole("button", { name: "Útil" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Não útil" }));
    expect(screen.getByRole("button", { name: "Útil" })).toHaveAttribute("aria-pressed", "false");
    expect(
      await screen.findByText("Obrigado. A equipe da Sala vai revisar esta resposta."),
    ).toBeInTheDocument();
  });

  it("copia a resposta com as fontes", () => {
    expect(textoParaCopiar(resposta)).toMatch(/Fontes citadas\n\[1\] Corpus Hermeticum, Tratado I/);
  });
});
