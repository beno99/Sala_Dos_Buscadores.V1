import { beforeEach, expect, it, vi } from "vitest";
import { contaPorId } from "@/features/auth/contas";
import { restaurarAcervoInicial } from "@/server/store";
import { consultarComunidade } from "./consultas";

const sessao = vi.hoisted(() => ({ id: "u-buscador" }));
vi.mock("@/server/sessao", () => ({
  membroAtual: async () => contaPorId(sessao.id),
  redirecionarParaEntrar: () => {
    throw new Error("sem sessão");
  },
}));
beforeEach(() => {
  restaurarAcervoInicial();
  sessao.id = "u-buscador";
});
it("salvos e seguindo pertencem à sessão atual", async () => {
  const buscador = await consultarComunidade();
  expect(buscador.salvos.map((p) => p.id)).toEqual(["p-demo-4", "p-demo-7"]);
  expect(buscador.seguindo.length).toBeGreaterThan(0);
  sessao.id = "u-curadoria";
  const admin = await consultarComunidade();
  expect(admin.salvos).toEqual([]);
  expect(admin.seguindo).toEqual([]);
});
it("sem sessão não entrega dados da comunidade", async () => {
  sessao.id = "inexistente";
  await expect(consultarComunidade()).rejects.toThrow("sem sessão");
});
