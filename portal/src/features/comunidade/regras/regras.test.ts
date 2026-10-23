import { describe, expect, it } from "vitest";
import { comunidadeInicial } from "@/data/mock/comunidade";
import {
  dentroDoLimiteDiario,
  emDebate,
  normalizarTextoComunidade,
  ordenarComentarios,
  ordenarFeed,
  podeEditarPublicacao,
  podeFixar,
  podeOcultarComentario,
  podeTransitar,
  validarComentario,
  validarPublicacao,
} from "./index";

const agora = new Date("2026-10-23T12:00:00Z");
const dados = comunidadeInicial(agora);
const posts = [...dados.publicacoes.values()];
const p = posts[0];
if (!p) throw new Error("Seed ausente");
describe("regras da Comunidade", () => {
  it("seeds cobrem quatro tipos, cinco Salas e seis autores, sem administrador", () => {
    expect(posts).toHaveLength(14);
    expect(new Set(posts.map((p) => p.tipo)).size).toBe(4);
    expect(new Set(posts.map((p) => p.salaSlug)).size).toBe(5);
    expect(new Set(posts.map((p) => p.autorId)).size).toBe(6);
    expect(posts.every((p) => p.autorId !== "u-curadoria" && !validarPublicacao(p).length)).toBe(true);
  });
  it("valida limites e campos obrigatórios dos quatro tipos", () => {
    expect(
      validarPublicacao({ ...p, texto: " ", temas: ["alma", "morte", "meditacao", "origem-do-universo"] }),
    ).toHaveLength(2);
    expect(validarPublicacao({ ...p, tipo: "citacao" })).toContain("Informe trecho, obra e passagem.");
    expect(validarPublicacao({ ...p, tipo: "pergunta", salaSlug: undefined })).toHaveLength(1);
    expect(validarPublicacao({ ...p, tipo: "achado" })).toHaveLength(1);
    expect(validarPublicacao({ ...p, texto: "a".repeat(1501) })).toHaveLength(1);
    expect(normalizarTextoComunidade(" <b>Fonte</b>\u0000 ")).toBe("Fonte");
  });
  it("limita comentários e respostas a um nível da mesma publicação", () => {
    expect(validarComentario("a".repeat(600))).toEqual([]);
    expect(validarComentario("a".repeat(601))).toHaveLength(1);
    expect(validarComentario("<b></b>")).toHaveLength(1);
    expect(
      validarComentario("nota", { paiId: "outro", publicacaoId: p.id, estado: "visivel" }, p.id),
    ).toHaveLength(1);
    expect(validarComentario("nota", { publicacaoId: "outra", estado: "visivel" }, p.id)).toHaveLength(1);
  });
  it("limites contam inclusive registros removidos e são por autor/dia UTC", () => {
    const registros = Array.from({ length: 10 }, () => ({
      autorId: p.autorId,
      criadaEm: agora.toISOString(),
    }));
    expect(dentroDoLimiteDiario("publicacao", p.autorId, registros, agora)).toBe(false);
    expect(dentroDoLimiteDiario("publicacao", "outra", registros, agora)).toBe(true);
    expect(
      dentroDoLimiteDiario(
        "comentario",
        p.autorId,
        Array.from({ length: 60 }, () => ({ autorId: p.autorId, criadaEm: agora.toISOString() })),
        agora,
      ),
    ).toBe(false);
  });
  it("autor edita o próprio texto; papel de admin não concede edição", () => {
    expect(podeEditarPublicacao(p.autorId, p)).toBe(true);
    expect(podeEditarPublicacao("u-curadoria", p)).toBe(false);
    expect(podeEditarPublicacao(p.autorId, { ...p, estado: "oculta" })).toBe(false);
    expect(podeFixar("membro", "a", "a")).toBe(false);
    expect(podeFixar("anfitriao", "a", "b")).toBe(false);
    expect(podeFixar("anfitriao", "a", "a")).toBe(true);
    expect(podeOcultarComentario("administrador", "a")).toBe(true);
    expect(podeOcultarComentario("anfitriao", "a", "b")).toBe(false);
  });
  it("transições não restauram removidas nem permitem membro ocultar", () => {
    expect(podeTransitar("visivel", "oculta", "membro", true)).toBe(false);
    expect(podeTransitar("visivel", "removida", "administrador", false)).toBe(false);
    expect(podeTransitar("oculta", "visivel", "administrador", false)).toBe(true);
    expect(podeTransitar("removida", "visivel", "administrador", false)).toBe(false);
  });
  it("prioridade é leve; Seguindo inclui só pessoas e não muta entrada", () => {
    const lista = [
      { ...p, id: "recente", criadaEm: "2026-10-23T12:00:00Z", salaSlug: "outra" },
      { ...p, id: "seguida", criadaEm: "2026-10-23T11:00:00Z" },
      { ...p, id: "antiga", criadaEm: "2026-10-22T11:00:00Z" },
    ];
    const ctx = {
      pessoaId: "u-buscador",
      aba: "para-voce" as const,
      seguindo: dados.seguindo,
      salasTrilhas: [],
      anfitrioes: [],
    };
    expect(ordenarFeed(lista, ctx).map((p) => p.id)).toEqual(["seguida", "recente", "antiga"]);
    expect(lista[0]?.id).toBe("recente");
    expect(
      ordenarFeed(posts, { ...ctx, aba: "seguindo" }).every((p) =>
        ["u-lucia-demo", "u-anfitria-demo"].includes(p.autorId),
      ),
    ).toBe(true);
    expect(ordenarFeed(posts, { ...ctx, aba: "seguindo", seguindo: [] })).toEqual([]);
  });
  it("debate conta conversa recente e visível, nunca curtidas", () => {
    const cs = [...dados.comentarios.values()];
    expect(emDebate(posts, cs, agora).length).toBeGreaterThanOrEqual(3);
    expect(emDebate(posts, cs, new Date("2027-01-01"))).toEqual([]);
    expect(
      emDebate(
        posts,
        cs.map((c) => ({ ...c, estado: "oculta" })),
        agora,
      ),
    ).toEqual([]);
  });
  it("resposta segue pai; pai oculto não deixa resposta órfã no painel", () => {
    const cs = [...dados.comentarios.values()].filter((c) => c.publicacaoId === "p-demo-2");
    expect(ordenarComentarios(cs, { tipo: "pergunta" }, ["u-anfitria-demo"]).map((c) => c.id)).toEqual([
      "cm-demo-3",
      "cm-demo-4",
    ]);
    expect(
      ordenarComentarios(
        cs.map((c) => (c.id === "cm-demo-3" ? { ...c, estado: "oculta" } : c)),
        { tipo: "pergunta" },
        [],
      ),
    ).toEqual([]);
  });
});
