import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CONTEUDOS } from "@/data/mock/conteudos";
import { renderComProviders } from "../../../tests/support/render";
import { ConteudosDaSala } from "./ConteudosDaSala";

const doCorpus = CONTEUDOS.filter((c) => c.sala === "corpus-hermeticum");

describe("ConteudosDaSala", () => {
  it("começa em Todos, com as contagens por nível, e filtra a lista", async () => {
    const { user } = renderComProviders(
      <ConteudosDaSala conteudos={doCorpus} nomeSala="Corpus Hermeticum" />,
    );
    const todos = screen.getByRole("button", { name: /Todos/ });
    expect(todos).toHaveAttribute("aria-pressed", "true");
    expect(todos).toHaveTextContent(String(doCorpus.length));
    for (const [rotulo, n] of [
      ["Iniciante", 1],
      ["Intermediário", 2],
      ["Avançado", 3],
    ] as const) {
      const total = doCorpus.filter((c) => c.nivel === n).length;
      expect(screen.getByRole("button", { name: new RegExp(rotulo) })).toHaveTextContent(String(total));
    }
    expect(screen.getAllByRole("article")).toHaveLength(doCorpus.length);

    await user.click(screen.getByRole("button", { name: /Avançado/ }));
    const avancados = doCorpus.filter((c) => c.nivel === 3);
    expect(screen.getAllByRole("article")).toHaveLength(avancados.length);
    for (const c of avancados) expect(screen.getByRole("link", { name: c.titulo })).toBeInTheDocument();
    expect(
      screen.getByText(avancados.length === 1 ? "1 conteúdo" : `${avancados.length} conteúdos`),
    ).toBeInTheDocument();
  });

  it("nível sem conteúdo mostra o estado vazio, e Ver todos os níveis volta", async () => {
    const soIniciante = doCorpus.filter((c) => c.nivel === 1);
    const { user } = renderComProviders(
      <ConteudosDaSala conteudos={soIniciante} nomeSala="Corpus Hermeticum" />,
    );
    await user.click(screen.getByRole("button", { name: /Avançado/ }));
    expect(screen.getByText("Ainda não há conteúdo avançado publicado nesta Sala")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Ver todos os níveis" }));
    expect(screen.getByRole("button", { name: /Todos/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByRole("article")).toHaveLength(soIniciante.length);
  });
});
