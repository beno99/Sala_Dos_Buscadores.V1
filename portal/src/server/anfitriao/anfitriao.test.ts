import { beforeEach, describe, expect, it } from "vitest";
import { salaPorSlug, salasNaComparacao, todasAsSalas } from "@/data/catalogo";
import { ANFITRIA_DEMO_ID, FONTE_PROPOSTA_ID, SALA_PEROLA_ID, SALA_TOME_ID } from "@/data/mock/anfitrioes";
import { acervoPublico, fontesPorId, obterConteudo } from "@/data/repositorio";
import { artigoVazio, type FormArtigoAnfitriao, salaVazia } from "@/features/anfitriao/regras/artigo";
import {
  CONTA_ADMIN_DEMONSTRACAO,
  CONTA_ANFITRIAO_DEMONSTRACAO,
  CONTA_CANDIDATA_DEMONSTRACAO,
  CONTA_DEMONSTRACAO,
  contaPorEmail,
  type Membro,
  registrar as registrarConta,
  reiniciarContas,
} from "@/features/auth/contas";
import { mudarStatusArtigo, restaurarAcervo, salvarArtigo as salvarArtigoAdmin } from "../admin/editorial";
import { listarEmails } from "../caixa-saida";
import { guardarImagem } from "../midia";
import { acervo, restaurarAcervoInicial } from "../store";
import {
  artigoDoAnfitriao,
  fontesParaAnfitriao,
  listarAnfitrioes,
  painelDoAnfitriao,
  salaDoAnfitriao,
  totalPendenteRevisao,
} from "./consultas";
import * as anf from "./editorial";
import * as rev from "./revisao";
import * as usu from "./usuarios";

/*
 * Anfitriões no servidor: ciclo completo, regras entre Sala e artigos,
 * permissões por papel e posse, e-mails da caixa de saída.
 */

const ADMIN = CONTA_ADMIN_DEMONSTRACAO.pseudonimo;
const MOTIVO = "Falta indicar a edição usada nas citações do segundo parágrafo.";
const conta = (email: string) => {
  const c = contaPorEmail(email);
  if (!c) throw new Error(`sem conta ${email}`);
  return c;
};
const helena = () => conta(CONTA_ANFITRIAO_DEMONSTRACAO.email);

/** Um segundo anfitrião, promovido pela curadoria e com perfil completo. */
function criarAnfitriaoB(): Membro {
  const r = registrarConta({ pseudonimo: "Rui Sena", email: "rui.sena@exemplo.com", senha: "1234567890" });
  if (!r.ok) throw new Error(r.erro);
  expect(usu.promover(r.valor.id, ADMIN).ok).toBe(true);
  const b = conta("rui.sena@exemplo.com");
  const p = usu.salvarPerfil(
    {
      nome: "Rui Sena (teste)",
      slug: "rui-sena",
      credencial: "Leitor de Plotino",
      apresentacao: "Perfil de teste.",
      link: "",
      avatar: null,
    },
    b,
  );
  expect(p.ok).toBe(true);
  return b;
}

function criarSala(dono: Membro, nome = "Leituras de Plotino") {
  const r = anf.salvarSala(
    { ...salaVazia(), nome, descricao: "As Enéadas em leitura comentada." },
    dono,
    "manual",
  );
  if (!r.ok) throw new Error(r.mensagem);
  return r.valor;
}

function artigoCompleto(salaId: string, parcial: Partial<FormArtigoAnfitriao> = {}): FormArtigoAnfitriao {
  return {
    ...artigoVazio(salaId),
    titulo: "A procissão do Uno",
    corpo: ["Segundo Plotino, nas _Enéadas_, tudo procede do Uno sem que ele diminua."],
    temas: ["origem-do-universo"],
    fontes: ["copenhaver-hermetica"],
    ...parcial,
  };
}

function criarArtigo(dono: Membro, salaId: string, parcial: Partial<FormArtigoAnfitriao> = {}) {
  const r = anf.salvarArtigo(artigoCompleto(salaId, parcial), dono, "manual");
  if (!r.ok) throw new Error(r.mensagem);
  return r.valor;
}

beforeEach(() => {
  reiniciarContas();
  restaurarAcervoInicial();
});

describe("dados de demonstração", () => {
  it("a Sala publicada aparece com 2 artigos; a Sala em revisão não aparece", () => {
    expect(salaPorSlug("leituras-do-evangelho-de-tome")).toMatchObject({
      origem: "anfitriao",
      naComparacao: false,
    });
    expect(salaPorSlug("o-hino-da-perola")).toBeUndefined();
    const doTome = acervoPublico().conteudos.filter((c) => c.sala === "leituras-do-evangelho-de-tome");
    expect(doTome).toHaveLength(2);
    expect(doTome[0]?.proveniencia).toBe("anfitriao");
    expect(doTome.some((c) => c.link?.tipo === "youtube")).toBe(true);
  });

  it("a Sala de anfitrião não entra na comparação até o admin ligar", () => {
    expect(salasNaComparacao().map((s) => s.slug)).not.toContain("leituras-do-evangelho-de-tome");
    expect(rev.definirNaComparacao(SALA_TOME_ID, true, ADMIN).ok).toBe(true);
    expect(salasNaComparacao().map((s) => s.slug)).toContain("leituras-do-evangelho-de-tome");
    expect(rev.definirNaComparacao(SALA_TOME_ID, false, ADMIN).ok).toBe(true);
    // Desligar não despublica nada.
    expect(salaPorSlug("leituras-do-evangelho-de-tome")).toBeDefined();
  });

  it("a fonte proposta fica fora do catálogo público e visível só para a dona", () => {
    expect(fontesPorId([FONTE_PROPOSTA_ID])).toEqual([]);
    expect(fontesParaAnfitriao(ANFITRIA_DEMO_ID).find((f) => f.id === FONTE_PROPOSTA_ID)?.nova).toBe(true);
  });

  it("o painel conta Salas, publicados, em revisão e pendências da curadoria", () => {
    expect(painelDoAnfitriao(ANFITRIA_DEMO_ID).indicadores).toEqual({
      salas: 2,
      publicados: 2,
      emRevisao: 2,
      reprovados: 0,
    });
    expect(totalPendenteRevisao()).toBe(3);
    expect(listarAnfitrioes()[0]).toMatchObject({ pendentes: 3 });
  });
});

describe("revisão pela curadoria", () => {
  it("reprova um artigo e aprova a Sala: vai ao ar com o artigo que sobrou, e a fonte nova entra no catálogo", () => {
    expect(rev.reprovarArtigo("c-anf-perola-narrativa", MOTIVO, ADMIN).ok).toBe(true);
    const r = rev.aprovarSala(SALA_PEROLA_ID, ADMIN);
    expect(r).toMatchObject({ ok: true, valor: { artigos: 1 } });
    expect(salaPorSlug("o-hino-da-perola")).toBeDefined();
    const publicos = acervoPublico()
      .conteudos.filter((c) => c.sala === "o-hino-da-perola")
      .map((c) => c.slug);
    expect(publicos).toEqual(["quem-compos-o-hino"]);
    expect(fontesPorId([FONTE_PROPOSTA_ID])).toHaveLength(1);
    expect(acervo().conteudos.get("c-anf-perola-narrativa")).toMatchObject({
      status: "reprovado",
      revisao: { ultimoMotivo: MOTIVO },
    });
  });

  it("“Aprovar Sala” fica bloqueado se todos os artigos foram reprovados", () => {
    rev.reprovarArtigo("c-anf-perola-narrativa", MOTIVO, ADMIN);
    rev.reprovarArtigo("c-anf-perola-origem", MOTIVO, ADMIN);
    const r = rev.aprovarSala(SALA_PEROLA_ID, ADMIN);
    expect(r.ok).toBe(false);
    expect(acervo().salas.get(SALA_PEROLA_ID)?.status).toBe("em_revisao");
  });

  it("reprovar sem motivo falha; reprovar a Sala devolve os artigos em revisão com o motivo", () => {
    expect(rev.reprovarSala(SALA_PEROLA_ID, "", ADMIN).ok).toBe(false);
    expect(rev.reprovarArtigo("c-anf-perola-origem", "curto", ADMIN).ok).toBe(false);
    expect(rev.reprovarSala(SALA_PEROLA_ID, MOTIVO, ADMIN)).toMatchObject({
      ok: true,
      valor: { artigos: 2 },
    });
    for (const id of ["c-anf-perola-narrativa", "c-anf-perola-origem"]) {
      expect(acervo().conteudos.get(id)).toMatchObject({
        status: "reprovado",
        revisao: { ultimoMotivo: MOTIVO },
      });
    }
  });

  it("artigo avulso só é aprovado numa Sala já publicada", () => {
    expect(rev.aprovarArtigo("c-anf-perola-origem", ADMIN).ok).toBe(false);
  });

  it("cada decisão gera e-mail para o anfitrião e vira novidade no painel", () => {
    rev.reprovarArtigo("c-anf-perola-narrativa", MOTIVO, ADMIN);
    rev.aprovarSala(SALA_PEROLA_ID, ADMIN);
    // A caixa de saída sobrevive a "Restaurar acervo": olhamos os dois mais recentes.
    const emails = listarEmails({ para: CONTA_ANFITRIAO_DEMONSTRACAO.email }).slice(0, 2);
    expect(emails.map((e) => e.assunto)).toEqual([
      "Sua Sala “O Hino da Pérola nos Atos de Tomé” foi publicada",
      "Seu artigo “O príncipe que esquece: a narrativa do Hino da Pérola” voltou para ajustes",
    ]);
    expect(emails[1]?.corpo).toContain(MOTIVO);
    expect(painelDoAnfitriao(ANFITRIA_DEMO_ID).novidades).toHaveLength(3);
    expect(anf.marcarNovidadesVistas("artigo", "c-anf-perola-narrativa", helena()).ok).toBe(true);
    expect(painelDoAnfitriao(ANFITRIA_DEMO_ID).novidades).toHaveLength(2);
  });
});

describe("ciclo do anfitrião", () => {
  it("cria Sala e artigo, envia junto, e tudo vai ao ar só depois da aprovação", () => {
    const h = helena();
    const sala = criarSala(h);
    const artigo = criarArtigo(h, sala.id);
    expect(salaPorSlug(sala.slug)).toBeUndefined();
    // Sem o aceite de direitos, não envia.
    expect(anf.enviarSala(sala.id, [artigo.id], false, h)).toMatchObject({ ok: false });
    // Primeiro envio sem artigo, não envia.
    expect(anf.enviarSala(sala.id, [], true, h)).toMatchObject({ ok: false });
    expect(anf.enviarSala(sala.id, [artigo.id], true, h)).toMatchObject({ ok: true, valor: { artigos: 1 } });
    expect(acervo().salas.get(sala.id)?.revisao?.aceite?.quem).toBe(h.pseudonimo);
    // Em revisão, fica travado.
    expect(
      anf.salvarArtigo({ ...artigoCompleto(sala.id), id: artigo.id, titulo: "Outro" }, h, "manual").ok,
    ).toBe(false);
    expect(rev.aprovarSala(sala.id, ADMIN).ok).toBe(true);
    expect(salaPorSlug(sala.slug)?.anfitriao?.slug).toBe("helena-varga");
  });

  it("não envia artigo com pendência (sem fonte)", () => {
    const h = helena();
    const sala = criarSala(h);
    const artigo = criarArtigo(h, sala.id, { fontes: [] });
    expect(anf.enviarSala(sala.id, [artigo.id], true, h)).toMatchObject({
      ok: false,
      mensagem: expect.stringMatching(/fonte/),
    });
  });

  it("editar um artigo publicado tira o artigo do ar; se era o último, a Sala some junto", async () => {
    const h = helena();
    const form = { ...artigoCompleto(SALA_TOME_ID), id: "c-anf-dito-3", titulo: "O Reino dentro e fora" };
    // O salvamento automático nunca tira do ar sem a confirmação.
    expect(anf.salvarArtigo(form, h, "automatico").ok).toBe(false);
    const r = anf.salvarArtigo(form, h, "manual");
    expect(r).toMatchObject({ ok: true, valor: { status: "rascunho", saiuDoAr: true } });
    await expect(
      obterConteudo("leituras-do-evangelho-de-tome", "o-reino-dentro-e-fora-dito-3"),
    ).resolves.toBeUndefined();
    expect(salaPorSlug("leituras-do-evangelho-de-tome")).toBeDefined();
    expect(anf.retirarDoAr("artigo", "c-anf-abertura-tome", h).ok).toBe(true);
    expect(salaPorSlug("leituras-do-evangelho-de-tome")).toBeUndefined();
    expect(acervo().salas.get(SALA_TOME_ID)?.status).toBe("publicado");
  });

  it("editar a Sala publicada tira a Sala e os artigos do ar até a nova aprovação", async () => {
    const h = helena();
    const sala = acervo().salas.get(SALA_TOME_ID);
    const r = anf.salvarSala(
      {
        id: SALA_TOME_ID,
        nome: "Leituras do Evangelho de Tomé",
        descricao: "Nova descrição.",
        periodo: sala?.periodo ?? "",
        link: "",
        imagem: null,
      },
      h,
      "manual",
    );
    expect(r).toMatchObject({ ok: true, valor: { saiuDoAr: true, slug: "leituras-do-evangelho-de-tome" } });
    await expect(
      obterConteudo("leituras-do-evangelho-de-tome", "os-114-ditos-e-a-abertura"),
    ).resolves.toBeUndefined();
    expect(anf.enviarSala(SALA_TOME_ID, [], true, h).ok).toBe(true);
    expect(rev.aprovarSala(SALA_TOME_ID, ADMIN).ok).toBe(true);
    await expect(
      obterConteudo("leituras-do-evangelho-de-tome", "os-114-ditos-e-a-abertura"),
    ).resolves.toBeDefined();
  });

  it("artigo novo numa Sala publicada é enviado e aprovado sozinho", () => {
    const h = helena();
    const a = criarArtigo(h, SALA_TOME_ID, {
      fontes: ["meyer-nhs"],
      link: "https://www.exemplo.org/dito-77",
    });
    expect(anf.enviarArtigo(a.id, true, h).ok).toBe(true);
    expect(rev.aprovarArtigo(a.id, ADMIN).ok).toBe(true);
    const publicado = acervoPublico().conteudos.find((c) => c.slug === a.slug);
    expect(publicado).toMatchObject({ link: { tipo: "site" }, formato: "texto", proveniencia: "anfitriao" });
  });

  it("só exclui o que nunca foi ao ar", () => {
    const h = helena();
    expect(anf.excluir("artigo", "c-anf-dito-3", h).ok).toBe(false);
    const sala = criarSala(h);
    criarArtigo(h, sala.id);
    expect(anf.excluir("sala", sala.id, h).ok).toBe(true);
    expect(acervo().salas.has(sala.id)).toBe(false);
  });
});

describe("permissões", () => {
  it("o anfitrião A não lê nem edita Sala, artigo ou fonte pendente do B", () => {
    const b = criarAnfitriaoB();
    const salaB = criarSala(b);
    const artigoB = criarArtigo(b, salaB.id);
    const h = helena();
    expect(() => salaDoAnfitriao(salaB.id, h.id)).toThrow("Acesso restrito");
    expect(() => artigoDoAnfitriao(artigoB.id, h.id)).toThrow("Acesso restrito");
    expect(anf.salvarSala({ ...salaVazia(), id: salaB.id, nome: "Tomada" }, h, "manual")).toMatchObject({
      ok: false,
    });
    expect(anf.salvarArtigo({ ...artigoCompleto(salaB.id), id: artigoB.id }, h, "manual")).toMatchObject({
      ok: false,
    });
    expect(anf.enviarSala(salaB.id, [artigoB.id], true, h).ok).toBe(false);
    expect(anf.excluir("artigo", artigoB.id, h).ok).toBe(false);
    // Fonte pendente de Helena: Rui não vê nem cita.
    expect(fontesParaAnfitriao(b.id).some((f) => f.id === FONTE_PROPOSTA_ID)).toBe(false);
    const citaFonteAlheia = anf.salvarArtigo(
      artigoCompleto(salaB.id, { fontes: [FONTE_PROPOSTA_ID] }),
      b,
      "manual",
    );
    expect(citaFonteAlheia).toMatchObject({ ok: false, erros: { "campo-fontes": expect.any(String) } });
    expect(acervo().salas.get(salaB.id)?.nome).toBe("Leituras de Plotino");
  });

  it("imagem enviada por outra conta não entra no item", () => {
    const b = criarAnfitriaoB();
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
    const img = guardarImagem(png, b.id);
    if (!img.ok) throw new Error(img.erro);
    const h = helena();
    const r = anf.salvarSala({ ...salaVazia(), nome: "Com imagem alheia", imagem: img.id }, h, "manual");
    if (!r.ok) throw new Error(r.mensagem);
    expect(acervo().salas.get(r.valor.id)?.imagem).toBeUndefined();
  });

  it("imagem no corpo: a própria entra com o endereço de /midia; a de outra conta é recusada no bloco", () => {
    const h = helena();
    const b = criarAnfitriaoB();
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
    const minha = guardarImagem(png, h.id);
    const alheia = guardarImagem(png, b.id);
    if (!minha.ok || !alheia.ok) throw new Error("envio de imagem");
    const sala = criarSala(h, "Corpo com imagens");
    const imagem = {
      tipo: "imagem" as const,
      src: "/midia/qualquer",
      alt: "Página do Códice II",
      credito: "Foto própria, 2026",
    };

    const recusado = anf.salvarArtigo(
      artigoCompleto(sala.id, { corpo: ["Lead.", { ...imagem, midia: alheia.id }] }),
      h,
      "manual",
    );
    expect(recusado).toMatchObject({ ok: false, erros: { "campo-corpo-1": expect.any(String) } });

    const forjado = anf.salvarArtigo(artigoCompleto(sala.id, { corpo: ["Lead.", imagem] }), h, "manual");
    expect(forjado).toMatchObject({ ok: false, erros: { "campo-corpo-1": expect.any(String) } });

    const r = anf.salvarArtigo(
      artigoCompleto(sala.id, { corpo: ["Lead.", { ...imagem, midia: minha.id }] }),
      h,
      "manual",
    );
    if (!r.ok) throw new Error(r.mensagem);
    expect(acervo().conteudos.get(r.valor.id)?.corpo[1]).toEqual({
      ...imagem,
      src: minha.url,
      midia: minha.id,
    });
  });

  it("membro não age como anfitrião", () => {
    const membro = conta(CONTA_DEMONSTRACAO.email);
    expect(anf.salvarSala({ ...salaVazia(), nome: "Sala de membro" }, membro, "manual")).toMatchObject({
      ok: false,
    });
    expect(
      anf.proporFonte({ titulo: "X", autor: "Y (ed.)", tipo: "Fonte primária", localizacao: "Z" }, membro).ok,
    ).toBe(false);
  });

  it("o admin não edita conteúdo de anfitrião pelo fluxo da curadoria", () => {
    expect(mudarStatusArtigo("c-anf-dito-3", "despublicar", ADMIN)).toMatchObject({
      ok: false,
      mensagem: expect.stringMatching(/de um anfitrião/),
    });
    const r = salvarArtigoAdmin(
      {
        id: "c-anf-dito-3",
        sala: "leituras-do-evangelho-de-tome",
      } as Parameters<typeof salvarArtigoAdmin>[0],
      ADMIN,
      "manual",
    );
    expect(r).toMatchObject({ ok: false, mensagem: expect.stringMatching(/de um anfitrião/) });
  });
});

describe("candidatura, convite e rebaixamento", () => {
  const form = {
    nome: "Tomás Arruda (demonstração)",
    credencial: "Mestrando em literatura siríaca",
    apresentacao: "Estudo Efrém de Nísibis.",
    link: "",
  };

  it("no máximo uma candidatura pendente; recusa exige motivo; o membro pode tentar de novo", () => {
    const tomas = conta(CONTA_CANDIDATA_DEMONSTRACAO.email);
    expect(usu.candidatar(form, tomas).ok).toBe(false);
    expect(usu.decidirCandidatura("cand-tomas-arruda", "recusar", "", ADMIN).ok).toBe(false);
    expect(usu.decidirCandidatura("cand-tomas-arruda", "recusar", MOTIVO, ADMIN).ok).toBe(true);
    expect(usu.ultimaCandidaturaDe(tomas.id)?.motivo).toBe(MOTIVO);
    const nova = usu.candidatar(form, tomas);
    expect(nova.ok).toBe(true);
    if (!nova.ok) return;
    expect(usu.decidirCandidatura(nova.valor.id, "aprovar", undefined, ADMIN).ok).toBe(true);
    expect(conta(CONTA_CANDIDATA_DEMONSTRACAO.email).papel).toBe("anfitriao");
    expect(acervo().perfis.get(tomas.id)?.credencial).toBe(form.credencial);
    expect(
      listarEmails({ para: tomas.email })
        .slice(0, 2)
        .map((e) => e.assunto),
    ).toEqual(["Sua candidatura de anfitrião foi aprovada", "Sua candidatura de anfitrião foi recusada"]);
  });

  it("convite cria a conta já como anfitrião, com o e-mail do convite, e não serve duas vezes", () => {
    const c = usu.convidar("ana.lins@exemplo.com", ADMIN);
    if (!c.ok) throw new Error(c.mensagem);
    const email = listarEmails({ para: "ana.lins@exemplo.com" })[0];
    expect(email?.corpo).toContain(c.valor.link);
    const token = new URL(c.valor.link).searchParams.get("convite") ?? "";
    const r = usu.aceitarConvite(token, { pseudonimo: "Ana Lins", senha: "1234567890" });
    expect(r).toMatchObject({ ok: true, valor: { email: "ana.lins@exemplo.com", papel: "anfitriao" } });
    expect(usu.aceitarConvite(token, { pseudonimo: "Outra", senha: "1234567890" })).toMatchObject({
      ok: false,
      mensagem: expect.stringMatching(/já foi usado/),
    });
  });

  it("convite expirado ou revogado é recusado", () => {
    const antes = new Date(Date.now() - 8 * 86_400_000);
    const velho = usu.convidar("bia.reis@exemplo.com", ADMIN, antes);
    if (!velho.ok) throw new Error(velho.mensagem);
    const tokenVelho = new URL(velho.valor.link).searchParams.get("convite") ?? "";
    expect(usu.aceitarConvite(tokenVelho, { pseudonimo: "Bia", senha: "1234567890" })).toMatchObject({
      ok: false,
      mensagem: expect.stringMatching(/venceu/),
    });
    const novo = usu.convidar("caio.reis@exemplo.com", ADMIN);
    if (!novo.ok) throw new Error(novo.mensagem);
    expect(usu.revogarConvite(novo.valor.id, ADMIN).ok).toBe(true);
    const token = new URL(novo.valor.link).searchParams.get("convite") ?? "";
    expect(usu.aceitarConvite(token, { pseudonimo: "Caio", senha: "1234567890" }).ok).toBe(false);
  });

  it("rebaixar com “Despublicar tudo” arquiva Sala e artigos, volta o que estava em revisão e faz da pessoa membro", () => {
    expect(usu.rebaixar(ANFITRIA_DEMO_ID, { tipo: "despublicar" }, ADMIN).ok).toBe(true);
    expect(helena().papel).toBe("membro");
    expect(todasAsSalas().some((s) => s.origem === "anfitriao")).toBe(false);
    expect(acervo().salas.get(SALA_PEROLA_ID)?.status).toBe("arquivado");
    expect(acervo().conteudos.get("c-anf-dito-3")?.status).toBe("arquivado");
  });

  it("rebaixar com “Manter publicado e congelado”: nada sai do ar e nada é editado", () => {
    expect(usu.rebaixar(ANFITRIA_DEMO_ID, { tipo: "manter" }, ADMIN).ok).toBe(true);
    expect(salaPorSlug("leituras-do-evangelho-de-tome")).toBeDefined();
    expect(acervo().salas.get(SALA_PEROLA_ID)?.status).toBe("rascunho");
    expect(acervo().conteudos.get("c-anf-dito-3")?.revisao?.congelado).toBe(true);
  });

  it("transferir muda o dono; os publicados mantêm a assinatura original", () => {
    const b = criarAnfitriaoB();
    expect(usu.rebaixar(ANFITRIA_DEMO_ID, { tipo: "transferir", para: b.id }, ADMIN).ok).toBe(true);
    expect(acervo().salas.get(SALA_TOME_ID)?.revisao?.donoId).toBe(b.id);
    expect(acervo().conteudos.get("c-anf-dito-3")).toMatchObject({
      revisao: { donoId: b.id },
      anfitriao: { slug: "helena-varga" },
    });
    expect(acervo().conteudos.get("c-anf-perola-origem")?.anfitriao?.slug).toBe("rui-sena");
    expect(acervo().fontes.get(FONTE_PROPOSTA_ID)?.proposta?.donoId).toBe(b.id);
    expect(
      anf.salvarSala(
        { ...salaVazia(), id: SALA_PEROLA_ID, nome: "Hino da Pérola", descricao: "x" },
        b,
        "manual",
      ).ok,
    ).toBe(true);
    expect(listarEmails({ para: b.email })[0]?.assunto).toBe("Você recebeu Salas na Sala dos Buscadores");
  });

  it("“Restaurar acervo” recompõe anfitriões, candidaturas, convites e as contas de demonstração", () => {
    usu.rebaixar(ANFITRIA_DEMO_ID, { tipo: "despublicar" }, ADMIN);
    restaurarAcervo(ADMIN);
    expect(helena().papel).toBe("anfitriao");
    expect(salaPorSlug("leituras-do-evangelho-de-tome")).toBeDefined();
    expect(acervo().candidaturas.get("cand-tomas-arruda")?.status).toBe("pendente");
    expect(acervo().convites.size).toBe(1);
  });
});
