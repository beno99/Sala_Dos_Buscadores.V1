// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import { mudarStatusArtigo, salvarFonte } from "@/server/admin/editorial";
import { listarAuditoria } from "@/server/auditoria";
import { acervo, aguardarGravacoes, esquecerAcervo, salasVisiveis, sincronizarAcervo } from "@/server/store";
import { bancoDeTeste } from "../../../tests/support/banco";
import { contas } from "../conta";
import { semear } from "./semente";

const ADMIN = { email: "curadoria@exemplo.org", senha: "senha-local-de-teste" };

beforeEach(async () => {
  await bancoDeTeste();
  esquecerAcervo();
  await semear(ADMIN);
  await sincronizarAcervo();
}, 60_000);

/** Joga fora o snapshot e lê tudo de novo do banco. */
async function recarregar() {
  await aguardarGravacoes();
  esquecerAcervo();
  await sincronizarAcervo();
}

describe("acervo no Postgres", () => {
  it("a semente cria o administrador e o acervo oficial, sem duplicar", async () => {
    const admin = await contas.autenticar(ADMIN.email, ADMIN.senha);
    expect(admin.ok && admin.valor.papel).toBe("administrador");
    const salas = salasVisiveis().length;
    expect(salas).toBeGreaterThan(3);
    await semear(ADMIN);
    await recarregar();
    expect(salasVisiveis()).toHaveLength(salas);
  });

  it("o que a curadoria grava sobrevive a recarregar do banco, com auditoria", async () => {
    const r = salvarFonte(
      {
        id: null,
        titulo: "Os Evangelhos Gnósticos",
        autor: "Elaine Pagels",
        tradicao: "Gnosticismo cristão",
        tipo: "Estudo acadêmico",
        referencia: "Nova York: Random House, 1979.",
        url: "",
        capa: "grafite",
        inicial: "E",
      },
      "Editoria do acervo",
    );
    expect(r.ok).toBe(true);
    const artigo = [...acervo().conteudos.values()].find((c) => c.status === "publicado");
    if (!artigo || !r.ok) throw new Error("sem artigo publicado na semente");
    expect(mudarStatusArtigo(artigo.id, "despublicar", "Editoria do acervo").ok).toBe(true);

    await recarregar();
    expect(acervo().fontes.get(r.valor.id)?.autor).toBe("Elaine Pagels");
    expect(acervo().conteudos.get(artigo.id)?.status).toBe("rascunho");
    expect(listarAuditoria().map((a) => a.acao)).toEqual(expect.arrayContaining(["criou", "despublicou"]));
  });
});
