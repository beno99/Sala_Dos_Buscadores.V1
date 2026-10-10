import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { navigationMock } from "../../../tests/support/next-navigation";
import { renderComProviders } from "../../../tests/support/render";
import { BarraBusca } from "./BarraBusca";

describe("BarraBusca", () => {
  it("mostra erro ao enviar vazia, sem navegar", async () => {
    const { user } = renderComProviders(<BarraBusca />);
    await user.click(screen.getByRole("button", { name: "Comparar" }));
    expect(screen.getByText("Erro: escreva uma pergunta ou escolha um tema abaixo.")).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toHaveAttribute("aria-invalid", "true");
    expect(navigationMock.router.push).not.toHaveBeenCalled();
  });

  it("chip de tema preenche o campo; enviar leva à comparação (RF-21)", async () => {
    const { user } = renderComProviders(<BarraBusca />);
    await user.click(screen.getByRole("button", { name: "Meditação" }));
    expect(screen.getByRole("searchbox")).toHaveValue("Meditação");
    await user.click(screen.getByRole("button", { name: "Comparar" }));
    expect(navigationMock.router.push).toHaveBeenCalledWith("/comparar?q=Medita%C3%A7%C3%A3o");
  });

  it("no modo por Sala, os chips escolhem as Salas", async () => {
    const { user } = renderComProviders(<BarraBusca />);
    await user.click(screen.getByRole("button", { name: "Por Sala" }));
    await user.click(screen.getByRole("button", { name: "O Caibalion" }));
    await user.click(screen.getByRole("button", { name: "Buscar" }));
    expect(navigationMock.router.push).toHaveBeenCalledWith("/comparar?modo=sala&sala=caibalion");
  });
});
