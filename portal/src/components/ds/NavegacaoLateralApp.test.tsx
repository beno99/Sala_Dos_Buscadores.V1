import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { type GrupoNavegacaoApp, NavegacaoLateralApp, useLateralRecolhida } from "./NavegacaoLateralApp";

const grupos: GrupoNavegacaoApp[] = [
  {
    titulo: "Acervo",
    itens: [
      { rotulo: "Portal", icone: "inicio", href: "/", ativo: true },
      { rotulo: "Salas", icone: "salas", href: "/salas", contagem: 5 },
    ],
  },
];
const perfil = {
  iniciais: "BU",
  pseudonimo: "Lúcia",
  papel: "Buscador",
  descricao: "Membro desde set 2026",
  menu: [],
};

function Lateral() {
  const [recolhida, alternar] = useLateralRecolhida("teste-lateral");
  return (
    <NavegacaoLateralApp
      id="lat"
      grupos={grupos}
      perfil={perfil}
      recolhida={recolhida}
      onAlternar={alternar}
    />
  );
}

describe("NavegacaoLateralApp", () => {
  beforeEach(() => localStorage.clear());

  it("aberta: grupos, página atual e botão que recolhe", () => {
    render(<Lateral />);
    const nav = screen.getByRole("navigation", { name: "Navegação principal" });
    expect(nav).not.toHaveClass("is-collapsed");
    expect(screen.getByText("Acervo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Portal" })).toHaveAttribute("aria-current", "page");
    const botao = screen.getByRole("button", { name: "Recolher navegação" });
    expect(botao).toHaveAttribute("aria-expanded", "true");
    expect(botao).toHaveAttribute("aria-controls", "lat");
  });

  it("recolhida: só ícones, nome no tooltip e escolha guardada no navegador", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Lateral />);
    await user.click(screen.getByRole("button", { name: "Recolher navegação" }));
    expect(screen.getByRole("navigation", { name: "Navegação principal" })).toHaveClass("is-collapsed");
    expect(screen.getByRole("button", { name: "Expandir navegação" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.getByRole("link", { name: /Salas/ })).toHaveAttribute("data-tip", "Salas");
    expect(localStorage.getItem("teste-lateral")).toBe("recolhida");
    unmount();
    render(<Lateral />);
    expect(await screen.findByRole("button", { name: "Expandir navegação" })).toBeInTheDocument();
  });

  it("perfil abre o menu da conta", () => {
    render(<Lateral />);
    expect(screen.getByRole("button", { name: "Conta de Lúcia" })).toHaveAttribute("aria-haspopup", "menu");
  });
});
