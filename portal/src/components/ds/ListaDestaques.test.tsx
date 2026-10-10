import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Route } from "next";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type ItemListaDestaques, ListaDestaques } from "./ListaDestaques";

const itens: ItemListaDestaques[] = [
  "O Evangelho de Tomé e os 114 ditos",
  "Os sete princípios, em linguagem simples",
  "Poimandres: a Mente que fala a Hermes",
  "Evangelho de Maria: a subida da alma",
  "O que o livro chama de Ajustador do Pensamento",
  "Quem foram os Três Iniciados? O debate sobre a autoria",
  "O Apócrifo de João e o mito de Sofia",
  "O que é um apócrifo? Um termo com história",
].map((titulo, i) => ({
  href: `/salas/x/item-${i}` as Route,
  titulo,
  meta: `Sala · ${200 - i * 10} buscas`,
  placa: "bordo",
}));

function comHover(sim: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: sim && query.includes("hover: hover"),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })),
  );
}

const renderizar = () =>
  render(
    <ListaDestaques
      id="mp"
      titulo="Mais pesquisados"
      legenda="Mais pesquisados no acervo nos últimos 30 dias."
      itens={itens}
    />,
  );
const item = (titulo: string) => screen.getByRole("link", { name: new RegExp(titulo) }).closest("li");
const lista = () => screen.getByRole("list");

describe("ListaDestaques", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("o item apontado pelo mouse cresce; os outros esmaecem", () => {
    comHover(true);
    renderizar();
    fireEvent.pointerEnter(item("Poimandres") as HTMLElement);
    expect(item("Poimandres")).toHaveClass("is-active");
    expect(lista()).toHaveClass("has-active");
    expect(item("Evangelho de Maria")).not.toHaveClass("is-active");
    fireEvent.pointerLeave(lista());
    expect(lista()).not.toHaveClass("has-active");
  });

  it("o foco de teclado produz o mesmo efeito que o mouse", async () => {
    comHover(true);
    renderizar();
    const user = userEvent.setup();
    await user.tab();
    expect(item("Tomé")).toHaveClass("is-active");
    await user.tab();
    expect(item("sete princípios")).toHaveClass("is-active");
    expect(item("Tomé")).not.toHaveClass("is-active");
  });

  it("sem hover (celular e tablet), nada expande", async () => {
    comHover(false);
    renderizar();
    fireEvent.pointerEnter(item("Poimandres") as HTMLElement);
    await userEvent.setup().tab();
    expect(lista()).not.toHaveClass("has-active");
    expect(document.querySelector(".is-active")).toBeNull();
  });

  it("mostra sete por página e pagina com as setas", async () => {
    comHover(true);
    renderizar();
    expect(screen.getAllByRole("listitem")).toHaveLength(7);
    expect(screen.getByText("Página 1 de 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Página anterior" })).toBeDisabled();
    await act(async () => {
      await userEvent.setup().click(screen.getByRole("button", { name: "Próxima página" }));
    });
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("Página 2 de 2")).toBeInTheDocument();
  });
});
