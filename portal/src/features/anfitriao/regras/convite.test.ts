import { describe, expect, it } from "vitest";
import { DIAS_VALIDADE_CONVITE, erroDoConvite, expiraEm, statusDoConvite } from "./convite";

/* Convite de anfitrião (§2.3): vale 7 dias e só pode ser usado uma vez. */
describe("convite", () => {
  const criado = new Date("2026-10-01T12:00:00.000Z");
  const convite = (status: "pendente" | "usado" | "revogado" = "pendente") => ({
    status,
    expiraEm: expiraEm(criado).toISOString(),
  });

  it(`vale ${DIAS_VALIDADE_CONVITE} dias`, () => {
    expect(expiraEm(criado).toISOString()).toBe("2026-10-08T12:00:00.000Z");
    expect(statusDoConvite(convite(), new Date("2026-10-08T11:59:59.000Z"))).toBe("pendente");
    expect(erroDoConvite(convite(), new Date("2026-10-05T00:00:00.000Z"))).toBeNull();
  });

  it("convite expirado é recusado", () => {
    const depois = new Date("2026-10-08T12:00:00.000Z");
    expect(statusDoConvite(convite(), depois)).toBe("expirado");
    expect(erroDoConvite(convite(), depois)).toMatch(/venceu/);
  });

  it("convite já usado é recusado, mesmo dentro do prazo", () => {
    const dentro = new Date("2026-10-02T00:00:00.000Z");
    expect(statusDoConvite(convite("usado"), dentro)).toBe("usado");
    expect(erroDoConvite(convite("usado"), dentro)).toMatch(/já foi usado/);
  });

  it("convite revogado e convite inexistente são recusados", () => {
    expect(erroDoConvite(convite("revogado"))).toMatch(/revogado/);
    expect(erroDoConvite(undefined)).toMatch(/não existe/);
  });
});
