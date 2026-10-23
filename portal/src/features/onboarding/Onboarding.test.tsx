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
  id: "u-lia",
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

  const comecar = () => screen.getByRole("button", { name: "Começar" });

  it("anuncia a etapa e nada vem pré-selecionado", async () => {
    const { user, dialogo } = abrir();
    expect(within(dialogo).getByText("Etapa 1 de 4")).toBeInTheDocument();
    expect(
      within(dialogo).getByRole("heading", { name: "Boas-vindas à Sala dos Buscadores" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Voltar" })).not.toBeInTheDocument();
    await user.click(comecar());
    expect(screen.getByText("Etapa 2 de 4")).toBeInTheDocument();
    expect(screen.queryAllByRole("button", { pressed: true })).toHaveLength(0);
    await user.click(screen.getByRole("button", { name: "Voltar" }));
    expect(screen.getByText("Etapa 1 de 4")).toBeInTheDocument();
  });

  it("“Pular e ir ao Portal” fecha em qualquer etapa e guarda o que já foi escolhido", async () => {
    const { user, onConcluir } = abrir();
    await user.click(comecar());
    await user.click(screen.getByRole("button", { name: "Alma" }));
    await user.click(screen.getByRole("button", { name: "Pular e ir ao Portal" }));
    expect(onConcluir).toHaveBeenCalledOnce();
    expect(salvas).toEqual([{ temas: ["alma"], salas: [], conviccao: [], consentimento: false }]);
  });

  it("a convicção é escolha única e “Prefiro não informar” não pede consentimento", async () => {
    const { user, onConcluir } = abrir();
    await user.click(comecar());
    await user.click(comecar());
    expect(screen.getByText(/Usamos só para sugerir conteúdos/)).toBeVisible();
    for (const r of screen.getAllByRole("radio")) expect(r).not.toBeChecked();
    await user.click(screen.getByRole("radio", { name: "Catolicismo" }));
    await user.click(screen.getByRole("radio", { name: "Prefiro não informar" }));
    expect(screen.getByRole("radio", { name: "Catolicismo" })).not.toBeChecked();
    expect(screen.queryByRole("checkbox", { name: /Autorizo guardar/ })).not.toBeInTheDocument();
    await user.click(comecar());
    expect(await screen.findByText("Etapa 4 de 4")).toBeInTheDocument();
    expect(salvas.at(-1)).toMatchObject({ conviccao: ["nao-informar"], consentimento: false });
    await user.click(comecar());
    expect(onConcluir).toHaveBeenCalled();
  });

  it("informar a religião pede consentimento antes de salvar", async () => {
    const { user } = abrir();
    await user.click(comecar());
    await user.click(comecar());
    await user.click(screen.getByRole("radio", { name: "Budismo" }));
    expect(comecar()).toHaveAttribute("aria-disabled", "true");
    await user.click(comecar());
    expect(salvas).toHaveLength(0);
    await user.click(screen.getByRole("checkbox", { name: /Autorizo guardar/ }));
    expect(comecar()).toHaveAttribute("aria-disabled", "false");
    await user.click(comecar());
    expect(await screen.findByText("Etapa 4 de 4")).toBeInTheDocument();
    expect(salvas.at(-1)).toMatchObject({ conviccao: ["budismo"], consentimento: true });
  });
});
