import { describe, expect, it } from "vitest";
import {
  artigoVazio,
  checklistEnvioArtigo,
  duracaoDoTexto,
  interpretarLink,
  resumoDoTexto,
  salaVazia,
  validarLinkHttps,
  validarSala,
} from "./artigo";

/* Campos calculados e validações do artigo de anfitrião (§3.2). */
describe("campos calculados", () => {
  it("o resumo sai do primeiro parágrafo, sem marcação e cortado em palavra", () => {
    const curto = "O _Evangelho de Tomé_ reúne 114 *ditos*.";
    expect(resumoDoTexto(["", curto, "Segundo parágrafo."])).toBe("O Evangelho de Tomé reúne 114 ditos.");
    const longo = `${"Segundo a tradução de Marvin Meyer, o texto não narra a vida de Jesus ".repeat(4)}fim.`;
    const r = resumoDoTexto([longo]);
    expect(r.length).toBeLessThanOrEqual(181);
    expect(r.endsWith("…")).toBe(true);
    expect(longo.startsWith(r.slice(0, -1))).toBe(true);
  });

  it("a duração sai da contagem de palavras (200 por minuto, mínimo 1)", () => {
    expect(duracaoDoTexto(["poucas palavras"])).toBe(1);
    expect(duracaoDoTexto([Array(401).fill("dito").join(" ")])).toBe(3);
  });

  it("com blocos: o resumo sai do primeiro parágrafo e a duração conta texto, intertítulo e destaque, não imagem", () => {
    const corpo = [
      { tipo: "intertitulo" as const, texto: "Abertura" },
      "O _Evangelho de Tomé_ reúne 114 *ditos*.",
      { tipo: "destaque" as const, texto: Array(200).fill("dito").join(" "), atribuicao: "Dito 2" },
      {
        tipo: "imagem" as const,
        src: "/midia/m-1",
        alt: Array(500).fill("alt").join(" "),
        credito: Array(500).fill("crédito").join(" "),
      },
    ];
    expect(resumoDoTexto(corpo)).toBe("O Evangelho de Tomé reúne 114 ditos.");
    expect(duracaoDoTexto(corpo)).toBe(2);
  });
});

describe("link do artigo: um só, YouTube ou site", () => {
  it("vazio é permitido", () => expect(interpretarLink("  ")).toEqual({ ok: true, link: null }));

  it("YouTube vira player, com o código extraído", () => {
    expect(interpretarLink("https://youtu.be/abcdefghijk")).toEqual({
      ok: true,
      link: { tipo: "youtube", url: "https://www.youtube.com/watch?v=abcdefghijk", youtubeId: "abcdefghijk" },
    });
  });

  it("link do YouTube sem código válido é recusado", () => {
    expect(interpretarLink("https://www.youtube.com/@canal").ok).toBe(false);
  });

  it("site precisa ser https", () => {
    expect(interpretarLink("https://www.nag-hammadi.org/tome")).toEqual({
      ok: true,
      link: { tipo: "site", url: "https://www.nag-hammadi.org/tome" },
    });
    expect(interpretarLink("http://www.exemplo.org").ok).toBe(false);
    expect(validarLinkHttps("ftp://exemplo.org")).toMatch(/https/);
  });
});

describe("checklist de envio", () => {
  it("título, texto, tema, fonte e aceite", () => {
    const vazio = checklistEnvioArtigo(artigoVazio("s-1"), false);
    expect(vazio.filter((i) => i.estado === "pendente").map((i) => i.id)).toEqual([
      "titulo",
      "texto",
      "temas",
      "fontes",
      "aceite",
    ]);
    const completo = checklistEnvioArtigo(
      { ...artigoVazio("s-1"), titulo: "Dito 3", corpo: ["Texto."], temas: ["alma"], fontes: ["meyer-nhs"] },
      true,
    );
    expect(completo.every((i) => i.estado === "ok")).toBe(true);
  });

  it("imagem sem crédito e destaque sem atribuição impedem o envio, apontando o bloco", () => {
    const itens = checklistEnvioArtigo(
      {
        ...artigoVazio("s-1"),
        titulo: "Dito 3",
        corpo: [
          "Texto.",
          { tipo: "destaque", texto: "Quem busca não pare de buscar.", atribuicao: "" },
          { tipo: "imagem", src: "/midia/m-1", alt: "Página do Códice II", credito: "", midia: "m-1" },
        ],
        temas: ["alma"],
        fontes: ["meyer-nhs"],
      },
      true,
    );
    expect(itens.filter((i) => i.estado === "pendente").map((i) => i.campo)).toEqual([
      "campo-corpo-1-atribuicao",
      "campo-corpo-2-credito",
    ]);
  });

  it("Sala exige nome e só aceita link https", () => {
    expect(Object.keys(validarSala(salaVazia()))).toEqual(["campo-sala-nome"]);
    expect(
      validarSala({ ...salaVazia(), nome: "Leituras", link: "http://x.org" })["campo-sala-link"],
    ).toMatch(/https/);
  });
});
