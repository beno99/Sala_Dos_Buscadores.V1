import { screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderComProviders } from "../../../tests/support/render";
import { BotaoCompartilhar } from "./BotaoCompartilhar";

const original = navigator.share;
function definirShare(valor: unknown) {
  Object.defineProperty(navigator, "share", { value: valor, configurable: true, writable: true });
}

afterEach(() => {
  definirShare(original);
  vi.restoreAllMocks();
});

const renderBotao = () =>
  renderComProviders(<BotaoCompartilhar titulo="Os sete princípios" url="https://exemplo.org/a" />);

// O userEvent.setup() (dentro do render) instala a própria área de transferência: lemos e espiamos essa.
describe("BotaoCompartilhar", () => {
  it("sem menu do sistema, copia o link e confirma com o toast", async () => {
    definirShare(undefined);
    const { user } = renderBotao();
    await user.click(screen.getByRole("button", { name: "Copiar link" }));
    expect(await navigator.clipboard.readText()).toBe("https://exemplo.org/a");
    expect(await screen.findByText("Link copiado.")).toBeInTheDocument();
  });

  it("área de transferência recusada: o toast mostra o link para selecionar", async () => {
    definirShare(undefined);
    const { user } = renderBotao();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("negado"));
    await user.click(screen.getByRole("button", { name: "Copiar link" }));
    expect(await screen.findByText("Não foi possível copiar")).toBeInTheDocument();
    expect(screen.getByText("https://exemplo.org/a")).toHaveClass("sdb-toast__select");
  });

  it("com navigator.share, vira Compartilhar e abre o menu; cancelar não mostra erro", async () => {
    const share = vi.fn(async () =>
      Promise.reject(Object.assign(new Error("cancelado"), { name: "AbortError" })),
    );
    definirShare(share);
    const { user } = renderBotao();
    const writeText = vi.spyOn(navigator.clipboard, "writeText");
    await user.click(await screen.findByRole("button", { name: "Compartilhar" }));
    expect(share).toHaveBeenCalledWith({ title: "Os sete princípios", url: "https://exemplo.org/a" });
    await waitFor(() => expect(writeText).not.toHaveBeenCalled());
    expect(screen.queryByText("Não foi possível copiar")).toBeNull();
    expect(screen.queryByText("Link copiado.")).toBeNull();
  });
});
