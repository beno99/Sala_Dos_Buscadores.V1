import { screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FONTES } from "@/data/mock/fontes";
import { renderComProviders } from "../../../../tests/support/render";
import { artigoVazio } from "../formularios";
import { artigoCompleto } from "../regras/fixtures";
import { EditorArtigo } from "./EditorArtigo";

const salvarArtigoAcao = vi.fn(async () => ({
  ok: true as const,
  valor: {
    id: "c-novo",
    slug: "o-tratado-x",
    salvoEm: new Date().toISOString(),
    status: "rascunho" as const,
  },
  mensagem: "Rascunho salvo.",
}));

vi.mock("@/server/admin/acoes", () => ({
  salvarArtigoAcao: (...a: unknown[]) => salvarArtigoAcao(...(a as [])),
  salvarFonteAcao: vi.fn(),
  mudarStatusArtigoAcao: vi.fn(),
  mudarStatusVideoAcao: vi.fn(),
}));

function renderEditor(inicial = artigoVazio("corpus-hermeticum")) {
  return renderComProviders(
    <EditorArtigo
      inicial={inicial}
      status="rascunho"
      atualizadoEm={null}
      slugTravado={false}
      fontes={FONTES}
    />,
  );
}

describe("EditorArtigo", () => {
  it("bloqueia a publicação enquanto o checklist tem pendência (RNF-DOM-01)", () => {
    renderEditor();
    const publicar = screen.getByRole("button", { name: "Publicar" });
    expect(publicar).toHaveAttribute("aria-disabled", "true");
    const checklist = screen.getByRole("region", { name: "Para publicar" });
    expect(within(checklist).getAllByText(/^Pendente:/).length).toBeGreaterThan(3);
  });

  it("ao tentar publicar, mostra erros por campo ligados por aria-describedby e leva o foco ao primeiro", async () => {
    const { user } = renderEditor();
    await user.click(screen.getByRole("button", { name: "Publicar" }));
    const titulo = screen.getByRole("textbox", { name: "Título" });
    expect(screen.getByText("escreva o título.")).toBeInTheDocument();
    expect(titulo).toHaveAttribute("aria-invalid", "true");
    const descritor = titulo.getAttribute("aria-describedby") ?? "";
    expect(
      document.getElementById(descritor.split(" ").find((id) => id.endsWith("-erro")) ?? ""),
    ).toHaveTextContent("Erro: escreva o título.");
    expect(screen.getByText("escolha ao menos um tema.")).toBeInTheDocument();
    expect(screen.getByText("declare a situação jurídica do texto.")).toBeInTheDocument();
    await waitFor(() => expect(titulo).toHaveFocus());
    expect(salvarArtigoAcao).not.toHaveBeenCalled();
  });

  it("corrigir o campo tira o erro dele", async () => {
    const { user } = renderEditor();
    await user.click(screen.getByRole("button", { name: "Publicar" }));
    await user.type(screen.getByRole("textbox", { name: "Título" }), "O Tratado X");
    expect(screen.queryByText("escreva o título.")).not.toBeInTheDocument();
    expect(screen.getByText("escolha ao menos um tema.")).toBeInTheDocument();
  });

  it("RF-12: com “produzido com auxílio de IA”, só a proveniência Síntese por IA fica disponível", async () => {
    const { user } = renderEditor(artigoCompleto());
    await user.click(screen.getByRole("checkbox", { name: /Texto produzido com auxílio de IA/ }));
    expect(screen.getByRole("radio", { name: /Editorial curado/ })).toBeDisabled();
    expect(screen.getByRole("radio", { name: /Síntese por IA/ })).toBeChecked();
  });

  it("com o checklist completo, Publicar deixa de estar bloqueado", () => {
    renderEditor(artigoCompleto());
    expect(screen.getByRole("button", { name: "Publicar" })).toHaveAttribute("aria-disabled", "false");
  });
});
