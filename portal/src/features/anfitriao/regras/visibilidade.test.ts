import { describe, expect, it } from "vitest";
import type { StatusEditorial } from "@/data/types";
import { ordenarSalas, salaVisivel } from "./visibilidade";

/* "Sala visível ⇔ publicada e com ≥ 1 artigo publicado" (anfitriões §4.2). */
describe("visibilidade pública da Sala", () => {
  const sala = (status: StatusEditorial, origem: "oficial" | "anfitriao" = "anfitriao") => ({
    slug: "leituras-do-evangelho-de-tome",
    origem,
    status,
  });
  const artigo = (status: StatusEditorial, s = "leituras-do-evangelho-de-tome") => ({ sala: s, status });

  it("publicada e com artigo publicado: aparece", () => {
    expect(salaVisivel(sala("publicado"), [artigo("publicado")])).toBe(true);
  });

  it("publicada sem nenhum artigo publicado: não aparece", () => {
    expect(salaVisivel(sala("publicado"), [])).toBe(false);
    expect(
      salaVisivel(sala("publicado"), [artigo("em_revisao"), artigo("rascunho"), artigo("arquivado")]),
    ).toBe(false);
  });

  it("artigo publicado de outra Sala não conta", () => {
    expect(salaVisivel(sala("publicado"), [artigo("publicado", "o-hino-da-perola")])).toBe(false);
  });

  it.each<StatusEditorial>(["rascunho", "em_revisao", "reprovado", "arquivado"])(
    "Sala %s não aparece, mesmo com artigo publicado",
    (status) => {
      expect(salaVisivel(sala(status), [artigo("publicado")])).toBe(false);
    },
  );

  it("quando o último artigo sai do ar, a Sala some junto (sem mudar o próprio status)", () => {
    const s = sala("publicado");
    expect(salaVisivel(s, [artigo("publicado")])).toBe(true);
    expect(salaVisivel(s, [artigo("rascunho")])).toBe(false);
    expect(s.status).toBe("publicado");
  });

  it("Sala oficial segue a mesma regra: publicada e sem artigo publicado não aparece", () => {
    expect(salaVisivel(sala("publicado", "oficial"), [])).toBe(false);
    expect(salaVisivel(sala("publicado", "oficial"), [artigo("publicado")])).toBe(true);
    expect(salaVisivel(sala("arquivado", "oficial"), [artigo("publicado")])).toBe(false);
  });

  it("ordena oficiais primeiro e cada grupo pelo nome", () => {
    const ordem = ordenarSalas([
      { nome: "Leituras do Evangelho de Tomé", origem: "anfitriao" as const },
      { nome: "O Caibalion", origem: "oficial" as const },
      { nome: "Corpus Hermeticum", origem: "oficial" as const },
    ]).map((s) => s.nome);
    expect(ordem).toEqual(["Corpus Hermeticum", "O Caibalion", "Leituras do Evangelho de Tomé"]);
  });
});
