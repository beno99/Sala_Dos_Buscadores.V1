import { screen } from "@testing-library/react";
import {
  abrirSessao,
  CONTA_ADMIN_DEMONSTRACAO,
  CONTA_ANFITRIAO_DEMONSTRACAO,
  CONTA_DEMONSTRACAO,
  prepararDemonstracao,
} from "@tests/support/demonstracao";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderComProviders } from "../../../../tests/support/render";

/* Área do anfitrião: só o papel anfitrião entra; o resto vê "Acesso restrito". */

let token: string | undefined;
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => (token ? { value: token } : undefined), set: vi.fn(), delete: vi.fn() }),
  headers: async () => new Headers({ "x-sdb-caminho": "/anfitriao" }),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", async (original) => ({
  ...(await original<typeof import("next/navigation")>()),
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: vi.fn() }),
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

beforeEach(async () => {
  await prepararDemonstracao();
  token = undefined;
});

async function renderLayout() {
  const { default: Layout } = await import("./layout");
  return renderComProviders(await Layout({ children: <p>Painel do anfitrião</p> }));
}

describe("layout /anfitriao", () => {
  it("membro não acessa /anfitriao: vê o acesso restrito e o caminho para se candidatar", async () => {
    token = await abrirSessao(CONTA_DEMONSTRACAO.email);
    await renderLayout();
    expect(screen.getByRole("heading", { name: "Acesso restrito" })).toBeInTheDocument();
    expect(screen.queryByText("Painel do anfitrião")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Quero ser anfitrião" })).toHaveAttribute("href", "/ajustes");
  });

  it("o administrador não tem painel de anfitrião", async () => {
    token = await abrirSessao(CONTA_ADMIN_DEMONSTRACAO.email);
    await renderLayout();
    expect(screen.getByRole("heading", { name: "Acesso restrito" })).toBeInTheDocument();
    expect(screen.queryByText("Painel do anfitrião")).not.toBeInTheDocument();
  });

  it("o anfitrião entra", async () => {
    token = await abrirSessao(CONTA_ANFITRIAO_DEMONSTRACAO.email);
    await renderLayout();
    expect(screen.getByText("Painel do anfitrião")).toBeInTheDocument();
  });
});

describe("páginas de item", () => {
  it("Sala de outra pessoa é 404, mesmo digitando o endereço", async () => {
    token = await abrirSessao(CONTA_ANFITRIAO_DEMONSTRACAO.email);
    const { default: Pagina } = await import("./salas/[id]/page");
    await expect(
      Pagina({ params: Promise.resolve({ id: "nag-hammadi" }), searchParams: Promise.resolve({}) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("membro que chama a página direto também recebe 404", async () => {
    token = await abrirSessao(CONTA_DEMONSTRACAO.email);
    const { default: Pagina } = await import("./page");
    await expect(Pagina()).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("o painel mostra as Salas da anfitriã de demonstração", async () => {
    token = await abrirSessao(CONTA_ANFITRIAO_DEMONSTRACAO.email);
    const { default: Pagina } = await import("./page");
    renderComProviders(await Pagina());
    expect(screen.getByRole("heading", { name: "Minhas Salas" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Leituras do Evangelho de Tomé" })).toHaveAttribute(
      "href",
      "/anfitriao/salas/s-leituras-tome",
    );
    expect(screen.getByRole("link", { name: "O Hino da Pérola nos Atos de Tomé" })).toBeInTheDocument();
  });
});
