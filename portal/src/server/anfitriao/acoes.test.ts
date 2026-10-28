// @vitest-environment node

import {
  abrirSessao,
  CONTA_ADMIN_DEMONSTRACAO,
  CONTA_ANFITRIAO_DEMONSTRACAO,
  CONTA_DEMONSTRACAO,
  prepararDemonstracao,
  SALA_PEROLA_ID,
  SALA_TOME_ID,
} from "@tests/support/demonstracao";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { artigoVazio, salaVazia } from "@/features/anfitriao/regras/artigo";
import { acervo } from "../store";

/*
 * Permissões nas Server Actions e no upload: o que a interface esconde não
 * vale como proteção, então cada chamada direta é conferida no servidor.
 */

let token: string | undefined;
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => (token ? { value: token } : undefined), set: vi.fn(), delete: vi.fn() }),
  headers: async () => new Headers({ "x-sdb-caminho": "/anfitriao" }),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const MOTIVO = "Falta indicar a edição usada nas citações do segundo parágrafo.";
const entrarComo = async (email?: string) => {
  token = email ? await abrirSessao(email) : undefined;
};

beforeEach(async () => {
  await prepararDemonstracao();
  token = undefined;
});

describe("ações da curadoria sobre anfitriões", () => {
  it("o anfitrião não chama ações do admin", async () => {
    const admin = await import("./acoes-admin");
    await entrarComo(CONTA_ANFITRIAO_DEMONSTRACAO.email);
    const respostas = await Promise.all([
      admin.aprovarSalaAcao(SALA_PEROLA_ID),
      admin.reprovarArtigoAcao("c-anf-perola-origem", MOTIVO),
      admin.definirNaComparacaoAcao(SALA_TOME_ID, true),
      admin.promoverAcao("u-buscador"),
      admin.convidarAcao("alguem@exemplo.com"),
      admin.decidirCandidaturaAcao("cand-tomas-arruda", "aprovar"),
    ]);
    for (const r of respostas)
      expect(r).toMatchObject({ ok: false, mensagem: expect.stringMatching(/restrito à curadoria/) });
    expect(acervo().salas.get(SALA_PEROLA_ID)?.status).toBe("em_revisao");
    expect(acervo().salas.get(SALA_TOME_ID)?.naComparacao).toBe(false);
  });

  it("membro e visitante sem sessão também não", async () => {
    const admin = await import("./acoes-admin");
    await entrarComo(CONTA_DEMONSTRACAO.email);
    expect((await admin.aprovarSalaAcao(SALA_PEROLA_ID)).ok).toBe(false);
    await entrarComo();
    expect((await admin.aprovarSalaAcao(SALA_PEROLA_ID)).ok).toBe(false);
  });

  it("o admin aprova pelas ações dele", async () => {
    const admin = await import("./acoes-admin");
    await entrarComo(CONTA_ADMIN_DEMONSTRACAO.email);
    expect(await admin.aprovarSalaAcao(SALA_PEROLA_ID)).toMatchObject({ ok: true });
  });
});

describe("ações do anfitrião", () => {
  it("o admin não edita conteúdo de anfitrião (nem pelas ações do anfitrião)", async () => {
    const anf = await import("./acoes");
    await entrarComo(CONTA_ADMIN_DEMONSTRACAO.email);
    const r = await anf.salvarArtigoAnfitriaoAcao(
      { ...artigoVazio(SALA_TOME_ID), id: "c-anf-dito-3", titulo: "Editado pela curadoria" },
      "manual",
    );
    expect(r).toMatchObject({ ok: false, mensagem: expect.stringMatching(/restrito a anfitriões/) });
    expect(await anf.retirarDoArAcao("sala", SALA_TOME_ID)).toMatchObject({ ok: false });
    expect(acervo().conteudos.get("c-anf-dito-3")?.titulo).toBe(
      "O Reino dentro e fora: o dito 3 em leitura comparada",
    );
  });

  it("membro não age como anfitrião", async () => {
    const anf = await import("./acoes");
    await entrarComo(CONTA_DEMONSTRACAO.email);
    expect(await anf.salvarSalaAcao({ ...salaVazia(), nome: "Sala de membro" }, "manual")).toMatchObject({
      ok: false,
      mensagem: expect.stringMatching(/restrito a anfitriões/),
    });
    expect(await anf.enviarSalaAcao(SALA_TOME_ID, [], true)).toMatchObject({ ok: false });
  });

  it("o anfitrião dono age; tipo de item inválido é recusado", async () => {
    const anf = await import("./acoes");
    await entrarComo(CONTA_ANFITRIAO_DEMONSTRACAO.email);
    expect(
      await anf.salvarSalaAcao({ ...salaVazia(), nome: "Leituras de Valentino", descricao: "x" }, "manual"),
    ).toMatchObject({
      ok: true,
    });
    expect(await anf.excluirItemAcao("fonte" as "sala", "meyer-nhs")).toMatchObject({ ok: false });
  });
});

describe("upload de imagem", () => {
  const png = () => new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3])]);
  const enviar = async (arquivo: Blob, nome = "codice.png") => {
    const { POST } = await import("@/app/midia/route");
    const corpo = new FormData();
    corpo.set("arquivo", arquivo, nome);
    return POST(new Request("http://localhost/midia", { method: "POST", body: corpo }));
  };

  it("sem sessão não envia; o membro envia para o próprio Perfil, e a imagem fica com o dono", async () => {
    token = undefined;
    expect((await enviar(png())).status).toBe(401);
    await entrarComo(CONTA_DEMONSTRACAO.email);
    const r = await enviar(png());
    expect(r.status).toBe(201);
    const { id } = (await r.json()) as { id: string };
    const { midiaDoDono } = await import("@/server/midia");
    expect(midiaDoDono(id, "outra-conta")).toBeUndefined();
  });

  it("o tipo vem dos magic bytes: um GIF chamado .png é recusado", async () => {
    await entrarComo(CONTA_ANFITRIAO_DEMONSTRACAO.email);
    const gif = new Blob([new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0, 0])]);
    const r = await enviar(gif, "foto.png");
    expect(r.status).toBe(422);
    expect(await r.json()).toMatchObject({ ok: false, erro: "o arquivo precisa ser JPEG, PNG ou WebP." });
  });

  it("aceita PNG e serve de volta com o tipo certo", async () => {
    await entrarComo(CONTA_ANFITRIAO_DEMONSTRACAO.email);
    const r = await enviar(png());
    expect(r.status).toBe(201);
    const { id } = (await r.json()) as { id: string };
    const { GET } = await import("@/app/midia/[id]/route");
    const imagem = await GET(new Request(`http://localhost/midia/${id}`), {
      params: Promise.resolve({ id }),
    });
    expect(imagem.headers.get("Content-Type")).toBe("image/png");
    expect(imagem.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });
});
