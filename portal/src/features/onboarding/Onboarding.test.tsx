import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Membro } from "@/features/auth/contas";
import { renderComProviders } from "../../../tests/support/render";
import { type EntradaPreferencias, validarPreferencias } from "./preferencias";

const salvas: EntradaPreferencias[] = [];
vi.mock("./acoes", () => ({
  salvarPreferenciasAcao: async (e: EntradaPreferencias) => {
    salvas.push(e);
    const r = validarPreferencias(e);
    return r.ok ? { ok: true, valor: { ...membro, preferencias: r.valor } } : r;
  },
}));

import { Onboarding } from "./Onboarding";

const membro: Membro = {
  pseudonimo: "Lia",
  email: "lia@exemplo.com",
  papel: "membro",
  membroDesde: "2026-10-07T12:00:00.000Z",
  preferencias: null,
};

function abrir() {
  const onConcluir = vi.fn();
  const r = renderComProviders(<Onboarding aberto onConcluir={onConcluir} />, { membro });
  return { ...r, onConcluir, dialogo: screen.getByRole("dialog") };
}

describe("Onboarding", () => {
  beforeEach(() => {
    salvas.length = 0;
  });

  it("anuncia a etapa e nada vem pré-selecionado", async () => {
    const { user, dialogo } = abrir();
    expect(within(dialogo).getByText("Etapa 1 de 4")).toBeInTheDocument();
    expect(
      within(dialogo).getByRole("heading", { name: "Boas-vindas à Sala dos Buscadores" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByText("Etapa 2 de 4")).toBeInTheDocument();
    for (const chip of screen.getAllByRole("button", { pressed: false }))
      expect(chip).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryAllByRole("button", { pressed: true })).toHaveLength(0);
  });

  it("pular a religião salva só os interesses e mostra o resumo", async () => {
    const { user, onConcluir } = abrir();
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await user.click(screen.getByRole("button", { name: "Alma" }));
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByText(/Usamos só para sugerir conteúdos/)).toBeVisible();
    for (const caixa of screen.getAllByRole("checkbox")) expect(caixa).not.toBeChecked();
    await user.click(screen.getByRole("button", { name: "Pular" }));
    expect(await screen.findByText("Etapa 4 de 4")).toBeInTheDocument();
    expect(salvas.at(-1)).toMatchObject({ temas: ["alma"], conviccao: [] });
    expect(screen.getByText("Não respondida")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Ir para o Portal" }));
    expect(onConcluir).toHaveBeenCalled();
  });

  it("informar a religião pede consentimento antes de salvar", async () => {
    const { user } = abrir();
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await user.click(screen.getByRole("button", { name: "Pular por agora" }));
    await user.click(screen.getByRole("checkbox", { name: "Budismo" }));
    const continuar = screen.getByRole("button", { name: "Continuar" });
    expect(continuar).toHaveAttribute("aria-disabled", "true");
    await user.click(continuar);
    expect(salvas).toHaveLength(0);
    await user.click(screen.getByRole("checkbox", { name: /Autorizo guardar/ }));
    expect(continuar).toHaveAttribute("aria-disabled", "false");
    await user.click(continuar);
    expect(await screen.findByText("Etapa 4 de 4")).toBeInTheDocument();
    expect(salvas.at(-1)).toMatchObject({ conviccao: ["budismo"], consentimento: true });
  });

  it("“Prefiro não informar” desmarca as outras opções e não pede consentimento", async () => {
    const { user } = abrir();
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await user.click(screen.getByRole("button", { name: "Pular por agora" }));
    await user.click(screen.getByRole("checkbox", { name: "Catolicismo" }));
    await user.click(screen.getByRole("checkbox", { name: "Prefiro não informar" }));
    expect(screen.getByRole("checkbox", { name: "Catolicismo" })).not.toBeChecked();
    expect(screen.queryByRole("checkbox", { name: /Autorizo guardar/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuar" })).toHaveAttribute("aria-disabled", "false");
  });
});
