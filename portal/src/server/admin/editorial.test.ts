import { prepararDemonstracao } from "@tests/support/demonstracao";
import { beforeEach, describe, expect, it } from "vitest";
import { acervoPublico, conteudosDaSala, listarSalas, obterConteudo, videosDaSala } from "@/data/repositorio";
import { artigoParaForm } from "@/features/admin/formularios";
import { artigoCompleto, videoCompleto } from "@/features/admin/regras/fixtures";
import { buscar, FILTROS_VAZIOS } from "@/features/busca/busca";
import { listarAuditoria } from "../auditoria";
import { guardarImagem } from "../midia";
import { acervo } from "../store";
import { excluirFonte, mudarStatusArtigo, mudarStatusVideo, salvarArtigo, salvarVideo } from "./editorial";

const QUEM = "Editoria do acervo";

function criarEPublicar(parcial = {}) {
  const r = salvarArtigo(artigoCompleto(parcial), QUEM, "manual");
  if (!r.ok) throw new Error(r.mensagem);
  const p = mudarStatusArtigo(r.valor.id, "publicar", QUEM);
  if (!p.ok) throw new Error(p.mensagem);
  return r.valor;
}

describe("curadoria no servidor", () => {
  beforeEach(() => prepararDemonstracao());

  it("RF-13: rascunho não aparece no portal; publicado aparece na Sala, na página e na busca", async () => {
    const antes = conteudosDaSala("corpus-hermeticum").length;
    const r = salvarArtigo(artigoCompleto(), QUEM, "automatico");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(conteudosDaSala("corpus-hermeticum")).toHaveLength(antes);
    expect(mudarStatusArtigo(r.valor.id, "publicar", QUEM).ok).toBe(true);
    expect(conteudosDaSala("corpus-hermeticum")).toHaveLength(antes + 1);
    await expect(obterConteudo("corpus-hermeticum", r.valor.slug)).resolves.toMatchObject({
      titulo: "O Tratado X e o silêncio divino",
    });
    const busca = buscar({ ...FILTROS_VAZIOS, temas: ["meditacao"] }, acervoPublico());
    expect(busca.itens.some((i) => i.tipo === "conteudo" && i.item.slug === r.valor.slug)).toBe(true);
  });

  it("RF-09: contadores e nível predominante do Card de Sala contam só o publicado", async () => {
    const sala = async () => (await listarSalas()).find((s) => s.slug === "corpus-hermeticum");
    const antes = await sala();
    salvarArtigo(artigoCompleto({ nivel: 3 }), QUEM, "manual");
    expect((await sala())?.totalConteudos).toBe(antes?.totalConteudos);
    criarEPublicar({ titulo: "Outro artigo", nivel: 3 });
    expect((await sala())?.totalConteudos).toBe((antes?.totalConteudos ?? 0) + 1);
  });

  it("arquivar tira do portal sem apagar; restaurar volta como rascunho", async () => {
    const { id, slug } = criarEPublicar();
    expect(mudarStatusArtigo(id, "arquivar", QUEM).ok).toBe(true);
    await expect(obterConteudo("corpus-hermeticum", slug)).resolves.toBeUndefined();
    expect(acervo().conteudos.get(id)?.status).toBe("arquivado");
    expect(mudarStatusArtigo(id, "restaurar", QUEM).ok).toBe(true);
    expect(acervo().conteudos.get(id)?.status).toBe("rascunho");
  });

  it("RNF-DOM-01: o servidor recusa publicar com pendência, mesmo sem a interface", () => {
    const r = salvarArtigo(artigoCompleto({ fontes: [], situacaoJuridica: null }), QUEM, "manual");
    if (!r.ok) throw new Error(r.mensagem);
    const p = mudarStatusArtigo(r.valor.id, "publicar", QUEM);
    expect(p.ok).toBe(false);
    if (!p.ok) expect(p.pendencias?.map((i) => i.id)).toEqual(["fontes", "situacao-juridica"]);
  });

  it("RF-12: conteúdo marcado como IA nunca é salvo como curado", () => {
    const r = salvarArtigo(artigoCompleto({ producaoIA: true, proveniencia: "curado" }), QUEM, "automatico");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erros?.["campo-proveniencia"]).toMatch(/Síntese por IA/);
    expect(
      salvarArtigo(artigoCompleto({ producaoIA: true, proveniencia: "ia" }), QUEM, "automatico").ok,
    ).toBe(true);
  });

  it("slug é gerado do título, único na Sala, e travado depois de publicado", () => {
    const a = salvarArtigo(artigoCompleto(), QUEM, "manual");
    const b = salvarArtigo(artigoCompleto(), QUEM, "manual");
    if (!a.ok || !b.ok) throw new Error("falhou");
    expect(a.valor.slug).toBe("o-tratado-x-e-o-silencio-divino");
    expect(b.valor.slug).toBe("o-tratado-x-e-o-silencio-divino-2");
    mudarStatusArtigo(a.valor.id, "publicar", QUEM);
    const editado = salvarArtigo(artigoCompleto({ id: a.valor.id, slug: "outro-endereco" }), QUEM, "manual");
    expect(editado.ok && editado.valor.slug).toBe("o-tratado-x-e-o-silencio-divino");
  });

  it("item publicado só aceita alteração que mantém o checklist completo", () => {
    const { id } = criarEPublicar();
    const r = salvarArtigo(artigoCompleto({ id, resumo: "" }), QUEM, "manual");
    expect(r.ok).toBe(false);
    expect(acervo().conteudos.get(id)?.resumo).not.toBe("");
  });

  it("RNF-DOM-01: fonte citada por conteúdo publicado não é excluída", () => {
    const r = excluirFonte("copenhaver-hermetica", QUEM);
    expect(r.ok).toBe(false);
    expect(acervo().fontes.has("copenhaver-hermetica")).toBe(true);
  });

  it("RF-16: vídeo publicado aparece na Sala e junto do artigo ligado", () => {
    const { id: artigo, slug } = criarEPublicar();
    const v = salvarVideo(videoCompleto({ artigos: [artigo] }), QUEM, "manual");
    if (!v.ok) throw new Error(v.mensagem);
    expect(videosDaSala("corpus-hermeticum").some((x) => x.id === v.valor.id)).toBe(false);
    expect(mudarStatusVideo(v.valor.id, "publicar", QUEM).ok).toBe(true);
    const publicado = videosDaSala("corpus-hermeticum").find((x) => x.id === v.valor.id);
    expect(publicado?.url).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(publicado?.conteudos).toEqual([slug]);
  });

  it("RF-16: vídeo com URL de outro domínio não é salvo", () => {
    const r = salvarVideo(videoCompleto({ url: "https://vimeo.com/123" }), QUEM, "manual");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erros?.["campo-url"]).toMatch(/YouTube/);
  });

  it("RNF-04: registra criação, publicação e mudança de proveniência com antes e depois", () => {
    const { id } = criarEPublicar();
    salvarArtigo(
      artigoCompleto({
        id,
        proveniencia: "especialista",
        autoria: { nome: "Clara Menezes", credencial: "Doutora" },
      }),
      QUEM,
      "manual",
    );
    const acoes = listarAuditoria({ itemId: id }).map((r) => r.acao);
    expect(acoes).toEqual(expect.arrayContaining(["criou", "publicou", "alterou-proveniencia"]));
    const prov = listarAuditoria({ itemId: id }).find((r) => r.acao === "alterou-proveniencia");
    expect(prov?.mudancas).toEqual([
      { campo: "Proveniência", antes: "Editorial curado", depois: "Especialista" },
    ]);
    expect(prov?.quem).toBe(QUEM);
  });

  it("corpo em blocos: destaque e imagem enviada pela curadoria chegam à página publicada", async () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
    const img = await guardarImagem(png, "admin-1");
    if (!img.ok) throw new Error(img.erro);
    const corpo = [
      "Segundo o _Tratado X_, o conhecimento de Deus é *silêncio divino*.",
      { tipo: "destaque" as const, texto: "O conhecimento é silêncio.", atribuicao: "_Tratado X_, 6" },
      {
        tipo: "imagem" as const,
        src: "",
        alt: "Gravura de Hermes",
        credito: "Domínio público",
        midia: img.id,
      },
    ];
    const r = salvarArtigo(artigoCompleto({ corpo }), QUEM, "manual", "admin-1");
    if (!r.ok) throw new Error(r.mensagem);
    expect(mudarStatusArtigo(r.valor.id, "publicar", QUEM).ok).toBe(true);
    const publico = await obterConteudo("corpus-hermeticum", r.valor.slug);
    expect(publico?.corpo).toEqual([
      corpo[0],
      corpo[1],
      { tipo: "imagem", src: img.url, alt: "Gravura de Hermes", credito: "Domínio público", midia: img.id },
    ]);
    const acoes = listarAuditoria()
      .filter((e) => e.itemId === r.valor.id)
      .map((e) => e.acao);
    expect(acoes).toEqual(expect.arrayContaining(["criou", "publicou"]));
  });

  it("imagem enviada por outra conta é recusada; a imagem do acervo que o item já tinha continua", async () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
    const alheia = await guardarImagem(png, "outra-conta");
    if (!alheia.ok) throw new Error(alheia.erro);
    const imagem = {
      tipo: "imagem" as const,
      src: "",
      alt: "Gravura",
      credito: "Domínio público",
      midia: alheia.id,
    };
    expect(
      salvarArtigo(artigoCompleto({ corpo: ["Lead.", imagem] }), QUEM, "manual", "admin-1"),
    ).toMatchObject({
      ok: false,
      erros: { "campo-corpo-1": expect.any(String) },
    });

    const original = acervo().conteudos.get("c-sete-principios-hermeticos");
    if (!original) throw new Error("artigo de demonstração");
    const form = artigoParaForm(original);
    const r = salvarArtigo({ ...form, titulo: `${form.titulo} (revisado)` }, QUEM, "manual", "admin-1");
    expect(r.ok).toBe(true);
    expect(acervo().conteudos.get("c-sete-principios-hermeticos")?.corpo).toEqual(original.corpo);
  });
});
