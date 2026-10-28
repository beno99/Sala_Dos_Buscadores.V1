import { screen, within } from "@testing-library/react";
import { prepararDemonstracao } from "@tests/support/demonstracao";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { acervo } from "@/server/store";
import { renderComProviders } from "../../../../../tests/support/render";

/* Página da Sala: cabeçalho em duas colunas, banner, conteúdos e a coluna lateral. */

vi.mock("next/navigation", async (original) => ({
  ...(await original<typeof import("next/navigation")>()),
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: vi.fn() }),
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));
vi.mock("@/features/estudo/RegistrarEstudo", () => ({ RegistrarEstudo: () => null }));

const TOME = "leituras-do-evangelho-de-tome";

beforeEach(async () => {
  await prepararDemonstracao();
});

async function abrir(slug: string) {
  const { default: SalaPage } = await import("./page");
  const ui = await SalaPage({ params: Promise.resolve({ slug }) } as PageProps<"/salas/[slug]">);
  return renderComProviders(ui);
}

const salaEditorial = (slug: string) => {
  const sala = [...acervo().salas.values()].find((s) => s.slug === slug);
  if (!sala) throw new Error(`Sala ${slug} não encontrada`);
  return sala;
};

describe("página da Sala", () => {
  it("Sala oficial: sem assinatura, com o assistente, os dados e as três peças da lateral", async () => {
    await abrir("corpus-hermeticum");
    expect(screen.getByRole("heading", { level: 1, name: "Corpus Hermeticum" })).toBeInTheDocument();
    expect(screen.getByText(/^Sala · Hermetismo/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Perguntar ao assistente sobre esta Sala" })).toHaveAttribute(
      "href",
      "/assistente?escopo=corpus-hermeticum",
    );
    expect(screen.queryByText("Anfitrião")).not.toBeInTheDocument();
    expect(screen.getByText("Publicada em")).toBeInTheDocument();
    expect(screen.queryByText("Acervo")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Vídeos do assunto" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Trecho de fonte primária" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Morte" })).toHaveAttribute("href", "/comparar?tema=morte");
    // O trecho começa em "Tradução" na coluna estreita.
    expect(screen.getByRole("button", { name: "Tradução" })).toHaveAttribute("aria-pressed", "true");
    // A cápsula de Breadcrumbs saiu: a trilha fica na barra superior.
    expect(screen.queryByRole("navigation", { name: /trilha|caminho/i })).not.toBeInTheDocument();
  });

  it("Sala de anfitrião: assinatura com link, selo, data da primeira aprovação e Site da Sala", async () => {
    salaEditorial(TOME).link = "https://exemplo.org/tome";
    await abrir(TOME);
    expect(screen.getByText("Sala de anfitrião")).toBeInTheDocument();
    const cabecalho = screen.getByRole("banner");
    expect(within(cabecalho).getByRole("link", { name: /Helena Varga/ })).toHaveAttribute(
      "href",
      expect.stringMatching(/^\/anfitrioes\//),
    );
    expect(within(cabecalho).getByText("Anfitrião")).toBeInTheDocument();
    expect(within(cabecalho).getByText("21 set 2026")).toBeInTheDocument();
    expect(within(cabecalho).getByRole("link", { name: /Site da Sala/ })).toHaveAttribute(
      "href",
      "https://exemplo.org/tome",
    );
    expect(
      within(cabecalho).queryByRole("link", { name: "Perguntar ao assistente sobre esta Sala" }),
    ).not.toBeInTheDocument();
  });

  it("sem vídeo, sem trecho e sem temas, os blocos da lateral somem", async () => {
    for (const c of acervo().conteudos.values()) if (c.sala === TOME) c.temas = [];
    await abrir(TOME);
    expect(screen.queryByRole("heading", { name: "Vídeos do assunto" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Trecho de fonte primária" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Comparar um tema/ })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Conteúdos" })).toBeInTheDocument();
  });

  it("Sala inexistente vai para o não encontrado", async () => {
    await expect(abrir("nao-existe")).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
