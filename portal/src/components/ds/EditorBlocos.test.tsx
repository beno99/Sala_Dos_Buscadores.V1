import { screen, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import type { BlocoCorpo } from "@/data/types";
import { renderComProviders } from "../../../tests/support/render";
import { EditorBlocos } from "./EditorBlocos";

function Editor({ inicial, aoMudar }: { inicial: BlocoCorpo[]; aoMudar?: (b: BlocoCorpo[]) => void }) {
  const [blocos, setBlocos] = useState(inicial);
  return (
    <EditorBlocos
      idBase="campo-corpo"
      blocos={blocos}
      onChange={(b) => {
        setBlocos(b);
        aoMudar?.(b);
      }}
    />
  );
}

describe("EditorBlocos", () => {
  it("adiciona um destaque depois do bloco 1, com frase e atribuição, e mostra a pré-visualização", async () => {
    const aoMudar = vi.fn();
    const { user } = renderComProviders(
      <Editor inicial={["O Caibalion organiza seu ensinamento."]} aoMudar={aoMudar} />,
    );
    await user.click(screen.getByRole("button", { name: "Adicionar bloco depois do bloco 1" }));
    await user.click(screen.getByRole("menuitem", { name: /Destaque/ }));
    await user.type(screen.getByRole("textbox", { name: "Frase do destaque" }), "O que está em cima.");
    await user.type(screen.getByRole("textbox", { name: "Atribuição" }), "O Caibalion, cap. II");
    expect(aoMudar).toHaveBeenLastCalledWith([
      "O Caibalion organiza seu ensinamento.",
      { tipo: "destaque", texto: "O que está em cima.", atribuicao: "O Caibalion, cap. II" },
    ]);
    const previa = document.getElementById("campo-corpo-1-previa");
    expect(previa?.querySelector("blockquote")).toHaveTextContent("O que está em cima.");
    expect(previa?.querySelector("figcaption")).toHaveTextContent("O Caibalion, cap. II");
  });

  it("o primeiro parágrafo aparece como lead na pré-visualização", () => {
    renderComProviders(<Editor inicial={["Lead.", "Segundo."]} />);
    expect(screen.getByText("Parágrafo · lead")).toBeInTheDocument();
    expect(document.querySelector("#campo-corpo-0-previa .sdb-articlebody__lead")).toHaveTextContent("Lead.");
    expect(document.querySelector("#campo-corpo-1-previa .sdb-body")).toHaveTextContent("Segundo.");
  });

  it("move e remove blocos", async () => {
    const aoMudar = vi.fn();
    const { user } = renderComProviders(
      <Editor
        inicial={["Lead.", { tipo: "intertitulo", texto: "O que a pesquisa diz" }, "Fim."]}
        aoMudar={aoMudar}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Subir bloco 3" }));
    expect(aoMudar).toHaveBeenLastCalledWith([
      "Lead.",
      "Fim.",
      { tipo: "intertitulo", texto: "O que a pesquisa diz" },
    ]);
    await user.click(screen.getByRole("button", { name: "Remover bloco 3" }));
    expect(aoMudar).toHaveBeenLastCalledWith(["Lead.", "Fim."]);
    expect(screen.getByRole("button", { name: "Subir bloco 1" })).toBeDisabled();
  });

  it("imagem pede texto alternativo, crédito e legenda opcional", async () => {
    const { user } = renderComProviders(<Editor inicial={["Lead."]} />);
    await user.click(screen.getByRole("button", { name: "Adicionar bloco depois do bloco 1" }));
    await user.click(screen.getByRole("menuitem", { name: /Imagem/ }));
    const bloco = document.querySelector('[data-tipo="imagem"]') as HTMLElement;
    expect(within(bloco).getByRole("textbox", { name: "Texto alternativo" })).toBeInTheDocument();
    expect(within(bloco).getByRole("textbox", { name: "Crédito" })).toBeInTheDocument();
    expect(within(bloco).getByRole("textbox", { name: /Legenda/ })).toBeInTheDocument();
    expect(within(bloco).getByText("Escolher imagem")).toBeInTheDocument();
  });

  it("mostra o erro no campo do bloco", () => {
    renderComProviders(
      <EditorBlocos
        idBase="campo-corpo"
        blocos={["Lead.", { tipo: "destaque", texto: "Frase.", atribuicao: "" }]}
        erros={{ "campo-corpo-1-atribuicao": "diga de onde vem a frase." }}
        onChange={() => {}}
      />,
    );
    const atribuicao = screen.getByRole("textbox", { name: "Atribuição" });
    expect(atribuicao).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("diga de onde vem a frase.")).toBeInTheDocument();
  });
});

describe("formatação do bloco inteiro", () => {
  it("centraliza, converte em lista e volta sem perder linhas; a prévia acompanha", async () => {
    const { user } = renderComProviders(
      <Editor inicial={[{ tipo: "paragrafo", texto: "Uma linha\nOutra linha" }]} />,
    );
    await user.click(screen.getByRole("button", { name: "Centralizar no bloco 1" }));
    expect(document.querySelector("#campo-corpo-0-previa .sdb-texto--centro")).toHaveTextContent("Uma linha");
    await user.click(screen.getByRole("button", { name: "Lista numerada no bloco 1" }));
    expect(document.querySelectorAll("#campo-corpo-0-previa ol li")).toHaveLength(2);
    expect(screen.getByRole("status")).toHaveTextContent("alinhamento");
    await user.click(screen.getByRole("button", { name: "Lista numerada no bloco 1" }));
    expect(screen.getByRole("textbox", { name: /Bloco 1/ })).toHaveValue("Uma linha\nOutra linha");
    expect(document.querySelector("#campo-corpo-0-previa p")).toHaveTextContent("Outra linha");
  });
  it("estilo de título desabilita listas; citação desabilita alinhamento", async () => {
    const { user } = renderComProviders(<Editor inicial={["Um texto."]} />);
    await user.selectOptions(screen.getByRole("combobox", { name: "Estilo do bloco 1" }), "titulo-3");
    expect(document.querySelector("#campo-corpo-0-previa h3")).toHaveTextContent("Um texto.");
    expect(screen.getByRole("button", { name: "Lista numerada no bloco 1" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await user.selectOptions(screen.getByRole("combobox", { name: "Estilo do bloco 1" }), "destaque");
    expect(screen.getByRole("button", { name: "Centralizar no bloco 1" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("textbox", { name: "Atribuição" })).toBeInTheDocument();
  });
});
