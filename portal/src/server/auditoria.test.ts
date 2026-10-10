import { describe, expect, it } from "vitest";
import * as auditoria from "./auditoria";
import { auditoriaBruta } from "./store";

describe("histórico de auditoria (RNF-04)", () => {
  it("só oferece inclusão e leitura: não há função para editar ou apagar", () => {
    expect(Object.keys(auditoria).sort()).toEqual(["listarAuditoria", "registrar"]);
  });

  it("registros guardados são congelados e a leitura devolve cópias", () => {
    const r = auditoria.registrar({
      quem: "Editoria do acervo",
      acao: "editou",
      tipoItem: "artigo",
      itemId: "c-x",
      itemTitulo: "X",
    });
    const guardado = auditoriaBruta().find((x) => x.id === r.id);
    expect(Object.isFrozen(guardado)).toBe(true);
    expect(() => {
      (guardado as { quem: string }).quem = "outra pessoa";
    }).toThrow();
    const lido = auditoria.listarAuditoria({ itemId: "c-x" })[0];
    if (lido) lido.quem = "alterado na cópia";
    expect(auditoria.listarAuditoria({ itemId: "c-x" })[0]?.quem).toBe("Editoria do acervo");
  });

  it("lista do mais recente para o mais antigo", () => {
    auditoria.registrar(
      { quem: "A", acao: "criou", tipoItem: "fonte", itemId: "f-ordem", itemTitulo: "1" },
      new Date(1000),
    );
    auditoria.registrar(
      { quem: "A", acao: "editou", tipoItem: "fonte", itemId: "f-ordem", itemTitulo: "2" },
      new Date(2000),
    );
    expect(auditoria.listarAuditoria({ itemId: "f-ordem" }).map((r) => r.acao)).toEqual(["editou", "criou"]);
  });
});
