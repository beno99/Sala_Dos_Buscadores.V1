import { prepararDemonstracao } from "@tests/support/demonstracao";
import { beforeEach, describe, expect, it } from "vitest";
import { obterDestaques, vagasDestaques } from "@/data/repositorio";
import { listarAuditoria } from "../auditoria";
import { definirVaga, moverVaga } from "./destaques";
import { mudarStatusArtigo } from "./editorial";

const QUEM = "Editoria do acervo";

describe("vagas de Destaques na curadoria", () => {
  beforeEach(() => prepararDemonstracao());

  it("o acervo de demonstração já vem com as vagas do mockup, nenhuma automática", async () => {
    const vagas = vagasDestaques();
    expect(vagas.video[0]).toEqual({ id: "v-poimandres", automatica: false });
    expect(vagas.cards.every((v) => !v.automatica)).toBe(true);
    const d = await obterDestaques();
    expect(d.artigos[0]?.conteudo.slug).toBe("o-que-e-um-apocrifo");
    expect(d.cards).toHaveLength(4);
    expect(d.artigos).toHaveLength(5);
  });

  it("escolher um item registra no histórico com antes e depois", () => {
    const r = definirVaga("video", 0, "v-urantia-mansoes", QUEM);
    expect(r.ok).toBe(true);
    expect(vagasDestaques().video[0]?.id).toBe("v-urantia-mansoes");
    const [registro] = listarAuditoria({ itemId: "destaques" });
    expect(registro).toMatchObject({ acao: "editou", tipoItem: "destaques", quem: QUEM });
    expect(registro?.mudancas?.[0]).toMatchObject({
      campo: "Vídeo principal",
      antes: "Poimandres, a mente que fala",
      depois: "Os mundos das mansões no Livro de Urântia",
    });
  });

  it("não deixa o mesmo item em duas vagas da página", () => {
    const r = definirVaga("artigos", 1, "c-sete-principios-hermeticos", QUEM);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.mensagem).toMatch(/^Erro: .*Cards em destaque, vaga 1/);
  });

  it("recusa item que não cabe no grupo ou não está publicado", () => {
    expect(definirVaga("video", 0, "c-o-que-e-um-apocrifo", QUEM).ok).toBe(false);
    expect(definirVaga("cards", 9, "c-o-que-e-um-apocrifo", QUEM).ok).toBe(false);
  });

  it("esvaziar deixa a vaga automática, e reordenar troca as vagas vizinhas", () => {
    expect(definirVaga("cards", 1, null, QUEM).ok).toBe(true);
    expect(vagasDestaques().cards[1]?.automatica).toBe(true);
    expect(moverVaga("artigos", 0, 1, QUEM).ok).toBe(true);
    expect(
      vagasDestaques()
        .artigos.slice(0, 2)
        .map((v) => v.id),
    ).toEqual(["c-quem-foram-os-tres-iniciados", "c-o-que-e-um-apocrifo"]);
    expect(moverVaga("artigos", 0, -1, QUEM).ok).toBe(false);
  });

  it("item despublicado sai da vaga, que volta a ser automática", () => {
    expect(mudarStatusArtigo("c-o-que-e-um-apocrifo", "despublicar", QUEM).ok).toBe(true);
    const vaga = vagasDestaques().artigos[0];
    expect(vaga?.automatica).toBe(true);
    expect(vaga?.id).not.toBe("c-o-que-e-um-apocrifo");
    // Republicado, não volta sozinho para a vaga: a escolha foi desfeita.
    expect(mudarStatusArtigo("c-o-que-e-um-apocrifo", "publicar", QUEM).ok).toBe(true);
    expect(vagasDestaques().artigos[0]?.automatica).toBe(true);
  });
});
