import { describe, expect, it } from "vitest";
import { abasDoCelular, gruposDaLateral, iniciaisDe, membroDesde, tituloDaPagina } from "./navegacao";

describe("navegação do app", () => {
  it("a página inicial chama-se Portal e cada seção tem o próprio título", () => {
    expect(tituloDaPagina("/")).toBe("Portal");
    expect(tituloDaPagina("/salas/corpus-hermeticum")).toBe("Salas");
    expect(tituloDaPagina("/comparar")).toBe("Comparar");
    expect(tituloDaPagina("/ajustes")).toBe("Ajustes");
  });

  it("lateral em grupos; Curadoria só para administrador", () => {
    const membro = gruposDaLateral("/biblioteca", { admin: false, sair: () => {} });
    expect(membro.map((g) => g.titulo)).toEqual(["Acervo", "Estudo", "Ferramentas", "Conta"]);
    expect(membro[0]?.itens.map((i) => i.rotulo)).toEqual(["Portal", "Destaques", "Biblioteca", "Salas"]);
    expect(membro[0]?.itens.find((i) => i.ativo)?.rotulo).toBe("Biblioteca");
    expect(membro.at(-1)?.itens.map((i) => i.rotulo)).toEqual(["Ajustes", "Sair"]);
    const admin = gruposDaLateral("/", { admin: true, sair: () => {} });
    expect(admin.at(-1)?.itens.map((i) => i.rotulo)).toEqual(["Ajustes", "Curadoria", "Sair"]);
  });

  it("celular: Portal, Biblioteca, Trilhas e Estante (o resto vai para Mais)", () => {
    expect(abasDoCelular("/trilhas").map((a) => [a.rotulo, a.ativa])).toEqual([
      ["Portal", false],
      ["Biblioteca", false],
      ["Trilhas", true],
      ["Estante", false],
    ]);
  });

  it("perfil: iniciais e mês do cadastro", () => {
    expect(iniciaisDe("Leitora de Hermes")).toBe("LH");
    expect(iniciaisDe("Buscador")).toBe("BU");
    expect(membroDesde("2026-09-14T13:00:00.000Z")).toBe("Membro desde set 2026");
  });
});
