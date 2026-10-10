import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  abrirSessao,
  CONTA_ADMIN_DEMONSTRACAO,
  CONTA_DEMONSTRACAO,
  type Membro,
  reiniciarContas,
} from "@/features/auth/contas";
import { renderComProviders } from "../../../tests/support/render";

/* Proteção por papel (RF-08): sem sessão, membro e administrador. */

let token: string | undefined;
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => (token ? { value: token } : undefined), set: vi.fn(), delete: vi.fn() }),
  headers: async () => new Headers({ "x-sdb-caminho": "/admin/artigos" }),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const membro: Membro = {
  pseudonimo: "Buscador",
  email: CONTA_DEMONSTRACAO.email,
  papel: "membro",
  membroDesde: "2026-09-14T13:00:00.000Z",
  preferencias: null,
};

beforeEach(() => {
  reiniciarContas();
  token = undefined;
});

describe("layout da curadoria", () => {
  async function renderLayout() {
    const { default: LayoutCuradoria } = await import("./layout");
    return renderComProviders(await LayoutCuradoria({ children: <p>Área de trabalho</p> }), { membro });
  }

  it("sem sessão vai para /entrar com a volta preservada", async () => {
    await expect(renderLayout()).rejects.toThrow("NEXT_REDIRECT /entrar?voltar=%2Fadmin%2Fartigos");
  });

  it("membro vê uma mensagem de acesso restrito, sem a área de trabalho nem rotas internas", async () => {
    token = abrirSessao(CONTA_DEMONSTRACAO.email);
    await renderLayout();
    expect(screen.getByRole("heading", { name: "Acesso restrito" })).toBeInTheDocument();
    expect(screen.queryByText("Área de trabalho")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Artigos|Histórico/ })).not.toBeInTheDocument();
  });

  it("administrador entra na área de trabalho", async () => {
    token = abrirSessao(CONTA_ADMIN_DEMONSTRACAO.email);
    await renderLayout();
    expect(screen.getByText("Área de trabalho")).toBeInTheDocument();
    expect(screen.getAllByRole("navigation", { name: "Curadoria" }).length).toBeGreaterThan(0);
  });
});

describe("Server Actions da curadoria", () => {
  it("recusam quem não é administrador, mesmo chamadas direto por POST", async () => {
    const { restaurarAcervoAcao } = await import("@/server/admin/acoes");
    token = undefined;
    expect(await restaurarAcervoAcao()).toMatchObject({
      ok: false,
      mensagem: expect.stringMatching(/acesso restrito/i),
    });
    token = abrirSessao(CONTA_DEMONSTRACAO.email);
    expect(await restaurarAcervoAcao()).toMatchObject({ ok: false });
    token = abrirSessao(CONTA_ADMIN_DEMONSTRACAO.email);
    expect(await restaurarAcervoAcao()).toMatchObject({ ok: true });
  });
});
