// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { salaPorSlug } from "@/data/catalogo";
import { acervoPublico, conteudosDaSala, videosDaSala } from "@/data/repositorio";
import { artigoCompleto, videoCompleto } from "@/features/admin/regras/fixtures";
import { type FormSalaOficial, salaOficialVazia } from "@/features/admin/regras/sala";
import {
  abrirSessao,
  CONTA_ADMIN_DEMONSTRACAO,
  contaPorEmail,
  reiniciarContas,
} from "@/features/auth/contas";
import { buscar, FILTROS_VAZIOS, NOTA_SEM_LEITURA_CURADA } from "@/features/busca/busca";
import { acervo, restaurarAcervoInicial } from "../store";
import { moverArtigo, mudarStatusArtigo, mudarStatusVideo, salvarArtigo, salvarVideo } from "./editorial";
import { listarSalasAdmin, mudarStatusSala, salvarSalaOficial } from "./salas";

/* Curadoria a partir da Sala: nada se cria fora de uma Sala oficial ativa. */

let token: string | undefined;
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => (token ? { value: token } : undefined), set: vi.fn(), delete: vi.fn() }),
  headers: async () => new Headers({ "x-sdb-caminho": "/admin" }),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const QUEM = CONTA_ADMIN_DEMONSTRACAO.pseudonimo;
const admin = () => {
  const c = contaPorEmail(CONTA_ADMIN_DEMONSTRACAO.email);
  if (!c) throw new Error("sem admin");
  return c;
};

const upanishads = (parcial: Partial<FormSalaOficial> = {}): FormSalaOficial => ({
  ...salaOficialVazia(),
  nome: "Upanishads",
  tradicao: "Vedanta · textos em sânscrito, séc. VIII a.C. – séc. I",
  tradicaoCurta: "Vedanta",
  descricao:
    "Diálogos que encerram os Vedas, reunidos ao longo de séculos, sobre o si mesmo (ātman) e o absoluto (brahman).",
  periodo: "séc. VIII a.C. – séc. I (datação incerta)",
  placa: "bege",
  inicial: "U",
  ...parcial,
});

function criarSala(parcial: Partial<FormSalaOficial> = {}) {
  const r = salvarSalaOficial(upanishads(parcial), admin(), "manual");
  if (!r.ok) throw new Error(r.mensagem);
  return r.valor;
}

function publicarArtigoNa(sala: string, titulo = "O si mesmo na Chandogya") {
  const r = salvarArtigo(artigoCompleto({ sala, titulo, slug: "" }), QUEM, "manual");
  if (!r.ok) throw new Error(r.mensagem);
  const p = mudarStatusArtigo(r.valor.id, "publicar", QUEM);
  if (!p.ok) throw new Error(p.mensagem);
  return r.valor;
}

beforeEach(() => {
  reiniciarContas();
  restaurarAcervoInicial();
  token = undefined;
});

describe("rotas antigas redirecionam para a Sala (308 no servidor)", () => {
  const pedido = (caminho: string) => new Request(`http://localhost${caminho}`);
  const ctx = <T extends object>(params: T) => ({ params: Promise.resolve(params) });
  const destino = (r: Response) => new URL(r.headers.get("location") ?? "").pathname;

  beforeEach(() => {
    token = abrirSessao(CONTA_ADMIN_DEMONSTRACAO.email);
  });

  it("listas e “novo” vão para /admin/salas", async () => {
    for (const modulo of [
      await import("@/app/admin/artigos/route"),
      await import("@/app/admin/artigos/novo/route"),
      await import("@/app/admin/videos/route"),
      await import("@/app/admin/videos/novo/route"),
    ]) {
      const r = await modulo.GET(pedido("/admin/artigos/novo"));
      expect(r.status).toBe(308);
      expect(destino(r)).toBe("/admin/salas");
    }
  });

  it("editor e prévia de artigo vão para dentro da Sala", async () => {
    const { GET: editor } = await import("@/app/admin/artigos/[id]/route");
    const { GET: previa } = await import("@/app/admin/artigos/[id]/previa/route");
    const id = "c-poimandres-a-mente-que-fala";
    expect(acervo().conteudos.get(id)?.sala).toBe("corpus-hermeticum");
    const r1 = await editor(pedido(`/admin/artigos/${id}`), ctx({ id }));
    expect([r1.status, destino(r1)]).toEqual([308, `/admin/salas/corpus-hermeticum/artigos/${id}`]);
    const r2 = await previa(pedido(`/admin/artigos/${id}/previa`), ctx({ id }));
    expect(destino(r2)).toBe(`/admin/salas/corpus-hermeticum/artigos/${id}/previa`);
  });

  it("editor de vídeo vai para dentro da Sala; item inexistente é 404", async () => {
    const { GET } = await import("@/app/admin/videos/[id]/route");
    const [video] = acervo().videos.values();
    if (!video) throw new Error("sem vídeo");
    const r = await GET(pedido(`/admin/videos/${video.id}`), ctx({ id: video.id }));
    expect([r.status, destino(r)]).toEqual([308, `/admin/salas/${video.sala}/videos/${video.id}`]);
    expect((await GET(pedido("/admin/videos/x"), ctx({ id: "nao-existe" }))).status).toBe(404);
  });

  it("artigo de anfitrião vai para a revisão, nunca para um editor", async () => {
    const { GET } = await import("@/app/admin/artigos/[id]/route");
    const r = await GET(pedido("/admin/artigos/c-anf-dito-3"), ctx({ id: "c-anf-dito-3" }));
    expect(destino(r)).toBe("/admin/anfitrioes/u-anfitria-demo/salas/s-leituras-tome");
  });

  it("sem papel de administrador, vai para /admin sem revelar a Sala do item", async () => {
    token = undefined;
    const { GET } = await import("@/app/admin/artigos/[id]/route");
    const r = await GET(pedido("/admin/artigos/c-poimandres"), ctx({ id: "c-poimandres-a-mente-que-fala" }));
    expect(destino(r)).toBe("/admin");
  });
});

describe("criar artigo ou vídeo exige uma Sala oficial ativa", () => {
  const casos: [string, string][] = [
    ["sem Sala", ""],
    ["Sala inexistente", "sala-que-nao-existe"],
    ["Sala de anfitrião", "leituras-do-evangelho-de-tome"],
  ];

  it.each(casos)("recusa artigo %s", (_n, sala) => {
    const r = salvarArtigo(artigoCompleto({ sala }), QUEM, "manual");
    expect(r).toMatchObject({ ok: false, erros: { "campo-sala": expect.any(String) } });
  });

  it.each(casos)("recusa vídeo %s", (_n, sala) => {
    const r = salvarVideo(videoCompleto({ sala }), QUEM, "manual");
    expect(r).toMatchObject({ ok: false, erros: { "campo-sala": expect.any(String) } });
  });

  it("recusa artigo e vídeo em Sala arquivada", () => {
    const sala = criarSala();
    expect(mudarStatusSala(sala.id, "arquivar", QUEM).ok).toBe(true);
    expect(salvarArtigo(artigoCompleto({ sala: sala.slug }), QUEM, "manual")).toMatchObject({
      ok: false,
      mensagem: expect.stringMatching(/arquivada/),
    });
    expect(salvarVideo(videoCompleto({ sala: sala.slug }), QUEM, "manual")).toMatchObject({
      ok: false,
      mensagem: expect.stringMatching(/arquivada/),
    });
  });

  it("a Server Action também recusa (o papel é conferido e a Sala também)", async () => {
    token = abrirSessao(CONTA_ADMIN_DEMONSTRACAO.email);
    const { salvarArtigoAcao, salvarVideoAcao } = await import("./acoes");
    expect(await salvarArtigoAcao(artigoCompleto({ sala: "" }), "manual")).toMatchObject({ ok: false });
    expect(
      await salvarVideoAcao(videoCompleto({ sala: "leituras-do-evangelho-de-tome" }), "manual"),
    ).toMatchObject({
      ok: false,
    });
    token = undefined;
    expect(await salvarArtigoAcao(artigoCompleto(), "manual")).toMatchObject({
      ok: false,
      mensagem: expect.stringMatching(/restrito à curadoria/),
    });
  });

  it("o item não muda de Sala pelo formulário", () => {
    const r = salvarArtigo(artigoCompleto(), QUEM, "manual");
    if (!r.ok) throw new Error(r.mensagem);
    const outra = salvarArtigo(artigoCompleto({ id: r.valor.id, sala: "nag-hammadi" }), QUEM, "manual");
    expect(outra).toMatchObject({ ok: false, mensagem: expect.stringMatching(/Mover para outra Sala/) });
  });
});

describe("Mover para outra Sala", () => {
  it("move rascunho entre Salas oficiais", () => {
    const r = salvarArtigo(artigoCompleto(), QUEM, "manual");
    if (!r.ok) throw new Error(r.mensagem);
    expect(moverArtigo(r.valor.id, "nag-hammadi", QUEM)).toMatchObject({
      ok: true,
      valor: { sala: "nag-hammadi" },
    });
    expect(acervo().conteudos.get(r.valor.id)?.sala).toBe("nag-hammadi");
  });

  it("recusa artigo já publicado, Sala de anfitrião e Sala arquivada", () => {
    const publicado = publicarArtigoNa("corpus-hermeticum");
    expect(moverArtigo(publicado.id, "nag-hammadi", QUEM)).toMatchObject({
      ok: false,
      mensagem: expect.stringMatching(/já publicado/),
    });
    const r = salvarArtigo(artigoCompleto({ titulo: "Rascunho para mover", slug: "" }), QUEM, "manual");
    if (!r.ok) throw new Error(r.mensagem);
    expect(moverArtigo(r.valor.id, "leituras-do-evangelho-de-tome", QUEM).ok).toBe(false);
    const arquivada = criarSala();
    mudarStatusSala(arquivada.id, "arquivar", QUEM);
    expect(moverArtigo(r.valor.id, arquivada.slug, QUEM).ok).toBe(false);
  });
});

describe("Sala oficial: visibilidade, arquivar e restaurar", () => {
  it("publicada e sem artigo publicado não aparece no portal; com um, aparece", () => {
    const sala = criarSala();
    expect(mudarStatusSala(sala.id, "publicar", QUEM)).toMatchObject({
      ok: true,
      mensagem: expect.stringMatching(/quando tiver um artigo publicado/),
    });
    expect(salaPorSlug(sala.slug)).toBeUndefined();
    publicarArtigoNa(sala.slug);
    expect(salaPorSlug(sala.slug)).toMatchObject({ nome: "Upanishads", origem: "oficial" });
  });

  it("publicar exige o checklist; o slug fica travado depois da primeira publicação", () => {
    const incompleta = criarSala({ tradicaoCurta: "", nome: "Sala incompleta" });
    expect(mudarStatusSala(incompleta.id, "publicar", QUEM)).toMatchObject({
      ok: false,
      mensagem: expect.stringMatching(/tradição curta/),
    });
    const sala = criarSala();
    mudarStatusSala(sala.id, "publicar", QUEM);
    const r = salvarSalaOficial(
      upanishads({ id: sala.id, nome: "Upanishads antigas", slug: "outro" }),
      admin(),
      "manual",
    );
    expect(r).toMatchObject({ ok: true, valor: { slug: "upanishads" } });
  });

  it("arquivar tira do ar artigos e vídeos sem mudar o status deles; restaurar devolve tudo", () => {
    const sala = criarSala();
    mudarStatusSala(sala.id, "publicar", QUEM);
    const artigo = publicarArtigoNa(sala.slug);
    const v = salvarVideo(videoCompleto({ sala: sala.slug, artigos: [artigo.id] }), QUEM, "manual");
    if (!v.ok) throw new Error(v.mensagem);
    expect(mudarStatusVideo(v.valor.id, "publicar", QUEM).ok).toBe(true);
    expect(conteudosDaSala(sala.slug)).toHaveLength(1);
    expect(videosDaSala(sala.slug)).toHaveLength(1);

    const arquivo = mudarStatusSala(sala.id, "arquivar", QUEM);
    expect(arquivo).toMatchObject({ ok: true, valor: { foraDoAr: { artigos: 1, videos: 1 } } });
    expect(salaPorSlug(sala.slug)).toBeUndefined();
    expect(acervoPublico().conteudos.some((c) => c.sala === sala.slug)).toBe(false);
    expect(acervoPublico().videos.some((x) => x.sala === sala.slug)).toBe(false);
    expect(acervo().conteudos.get(artigo.id)?.status).toBe("publicado");

    expect(mudarStatusSala(sala.id, "restaurar", QUEM)).toMatchObject({
      ok: true,
      valor: { status: "publicado" },
    });
    expect(conteudosDaSala(sala.slug)).toHaveLength(1);
    expect(videosDaSala(sala.slug)).toHaveLength(1);
  });

  it("Sala de anfitrião não é editada nem arquivada por aqui", () => {
    const tome = acervo().salas.get("s-leituras-tome");
    if (!tome) throw new Error("sem Sala de anfitrião");
    expect(mudarStatusSala(tome.id, "arquivar", QUEM).ok).toBe(false);
    expect(salvarSalaOficial(upanishads({ id: tome.id }), admin(), "manual").ok).toBe(false);
  });

  it("a lista de Salas traz oficiais e de anfitriões, com o motivo de estar fora do ar", () => {
    const sala = criarSala();
    const linhas = listarSalasAdmin();
    expect(linhas.find((l) => l.sala.id === sala.id)).toMatchObject({
      visivel: false,
      foraDoAr: expect.stringMatching(/Rascunho/),
    });
    expect(linhas.find((l) => l.sala.id === "s-leituras-tome")).toMatchObject({
      anfitriao: expect.stringMatching(/Helena/),
    });
  });

  it("Sala oficial nova entra na grade com uma coluna vazia serena", () => {
    const sala = criarSala();
    mudarStatusSala(sala.id, "publicar", QUEM);
    publicarArtigoNa(sala.slug);
    const coluna = buscar(
      { ...FILTROS_VAZIOS, temas: ["meditacao"] },
      acervoPublico(),
    ).comparacao?.respostas.find((r) => r.sala === sala.slug);
    expect(coluna).toEqual({
      sala: sala.slug,
      vazia: true,
      nota: NOTA_SEM_LEITURA_CURADA,
      linkRotulo: "Entrar na Sala",
    });
  });
});
