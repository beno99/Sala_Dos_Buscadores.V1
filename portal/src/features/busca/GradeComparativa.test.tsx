import { screen, within } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { comparacaoDoTema } from "@/data/catalogo";
import type { Comparacao } from "@/data/types";
import { renderComProviders } from "../../../tests/support/render";
import { GradeComparativa } from "./GradeComparativa";

// As colunas seguem as Salas do banco do teste, que sobe no beforeAll.
let morte: Comparacao;

describe("GradeComparativa", () => {
  beforeAll(() => {
    const c = comparacaoDoTema("morte");
    if (!c) throw new Error("comparação de morte ausente");
    morte = c;
  });

  it("mostra uma coluna por Sala e a nota de que não há síntese única (RF-18, RF-19)", () => {
    renderComProviders(<GradeComparativa comparacao={morte} />);
    expect(screen.getByRole("heading", { level: 2, name: morte.pergunta })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(5);
    expect(screen.getByText(/Sem síntese única/)).toBeInTheDocument();
    expect(screen.getByText("4 Salas respondem diretamente, 1 não trata do tema.")).toBeInTheDocument();
  });

  it("deixa a coluna vazia com a Sala que não trata do tema", () => {
    renderComProviders(<GradeComparativa comparacao={morte} />);
    const vazia = screen.getByRole("article", { name: "O Caibalion: sem resposta direta" });
    expect(within(vazia).getByText("Sem resposta direta")).toBeInTheDocument();
  });

  it("remove uma Sala e permite desfazer pelo aviso da grade", async () => {
    const { user } = renderComProviders(<GradeComparativa comparacao={morte} />);
    await user.click(screen.getByRole("button", { name: "Remover Corpus Hermeticum da comparação" }));
    expect(screen.queryByRole("article", { name: "Corpus Hermeticum" })).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Corpus Hermeticum saiu da comparação.");
    await user.click(screen.getByRole("button", { name: "Desfazer" }));
    expect(screen.getByRole("article", { name: "Corpus Hermeticum" })).toBeInTheDocument();
  });

  it("restaura todas as Salas e mantém ao menos uma na grade", async () => {
    const { user } = renderComProviders(<GradeComparativa comparacao={morte} />);
    for (const nome of ["Corpus Hermeticum", "O Livro de Urântia"]) {
      await user.click(screen.getByRole("button", { name: `Remover ${nome} da comparação` }));
    }
    expect(screen.getAllByRole("article")).toHaveLength(3);
    await user.click(screen.getByRole("button", { name: "Restaurar salas" }));
    expect(screen.getAllByRole("article")).toHaveLength(5);
    expect(screen.queryByRole("button", { name: "Restaurar salas" })).not.toBeInTheDocument();
  });
});
