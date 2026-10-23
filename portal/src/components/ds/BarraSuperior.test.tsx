import { render, screen, within } from "@testing-library/react";
import type { Route } from "next";
import { describe, expect, it } from "vitest";
import { BarraSuperior } from "./BarraSuperior";

describe("BarraSuperior", () => {
  it("com trilha, mostra Salas / {nome} na segunda linha, com o link e o item atual", () => {
    render(
      <BarraSuperior
        titulo="Salas"
        trilha={{ itens: [{ href: "/salas" as Route, rotulo: "Salas" }], atual: "Corpus Hermeticum" }}
        acoes={null}
      />,
    );
    const trilha = screen.getByRole("navigation", { name: "Trilha" });
    expect(within(trilha).getByRole("link", { name: "Salas" })).toHaveAttribute("href", "/salas");
    expect(within(trilha).getByText("Corpus Hermeticum")).toHaveAttribute("aria-current", "page");
    // O título da barra é um parágrafo: o h1 é o título da página.
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("com saudação, não mostra trilha", () => {
    render(<BarraSuperior titulo="Portal" saudacao="Boas-vindas de volta, Lúcia." acoes={null} />);
    expect(screen.getByText("Boas-vindas de volta, Lúcia.")).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Trilha" })).not.toBeInTheDocument();
  });
});
