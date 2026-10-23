import { describe, expect, it } from "vitest";
import type { BlocoCorpo } from "@/data/types";
import { checklistArtigo, errosDePublicacaoArtigo, regrasDoCorpo, temPendencia } from "./checklist";
import { errosDoCorpo, rotuloDoErroDoCorpo } from "./corpo";
import { artigoCompleto } from "./fixtures";

const destaque = (texto: string, atribuicao: string): BlocoCorpo => ({ tipo: "destaque", texto, atribuicao });
const imagem = (alt: string, credito: string, src = "/imagens/salas/caibalion.webp"): BlocoCorpo => ({
  tipo: "imagem",
  src,
  alt,
  credito,
});

describe("validação do corpo em blocos", () => {
  it("corpo completo não tem erro", () => {
    expect(
      errosDoCorpo([
        "Lead.",
        destaque("Frase.", "_O Caibalion_, cap. II"),
        imagem("Templo", "Domínio público"),
      ]),
    ).toEqual({});
  });

  it("o primeiro bloco é um parágrafo", () => {
    expect(errosDoCorpo([{ tipo: "intertitulo", texto: "Abertura" }, "Texto."])).toHaveProperty(
      "campo-corpo-0",
    );
    expect(errosDoCorpo(["", destaque("Frase.", "Fonte")])).toHaveProperty("campo-corpo-1");
  });

  it("destaque precisa de texto e atribuição", () => {
    const e = errosDoCorpo(["Lead.", destaque("", "")]);
    expect(e["campo-corpo-1"]).toMatch(/frase do destaque/);
    expect(e["campo-corpo-1-atribuicao"]).toMatch(/de onde vem a frase/);
  });

  it("imagem precisa de arquivo, texto alternativo e crédito; a legenda é opcional", () => {
    const e = errosDoCorpo(["Lead.", imagem("", "", "")]);
    expect(Object.keys(e).sort()).toEqual(["campo-corpo-1", "campo-corpo-1-alt", "campo-corpo-1-credito"]);
  });

  it("o checklist ganha um item por falta, cada um levando ao bloco certo, e bloqueia a publicação", () => {
    const f = artigoCompleto({ corpo: ["Lead.", destaque("Frase.", ""), imagem("Templo", "")] });
    const itens = regrasDoCorpo(f);
    expect(itens.map((i) => [i.campo, i.rotulo])).toEqual([
      ["campo-corpo-1-atribuicao", "Atribuição do destaque (bloco 2)"],
      ["campo-corpo-2-credito", "Crédito da imagem (bloco 3)"],
    ]);
    expect(temPendencia(checklistArtigo(f))).toBe(true);
    expect(errosDePublicacaoArtigo(f)).toMatchObject({
      "campo-corpo-1-atribuicao": expect.any(String),
      "campo-corpo-2-credito": expect.any(String),
    });
    expect(temPendencia(checklistArtigo(artigoCompleto()))).toBe(false);
  });

  it("rótulos dizem o que falta e em qual bloco", () => {
    const corpo: BlocoCorpo[] = ["Lead.", imagem("", "")];
    expect(rotuloDoErroDoCorpo(corpo, "campo-corpo-1-alt")).toBe("Texto alternativo da imagem (bloco 2)");
  });
});
