import { describe, expect, it } from "vitest";
import type { ConteudoEditorial } from "@/data/types";
import {
  BOM,
  COLUNAS_ARTIGOS,
  COLUNAS_FONTES,
  COLUNAS_VIDEOS,
  celula,
  gerarCsv,
  rotuloSituacao,
} from "./csv";

const artigo = {
  id: "c-1",
  slug: "tratado-x",
  sala: "corpus-hermeticum",
  tipo: "artigo",
  titulo: 'O "silêncio"; no Tratado X',
  resumo: "",
  temas: ["meditacao", "alma"],
  periodo: "séc. II",
  nivel: 3,
  formato: "texto",
  proveniencia: "especialista",
  duracaoMin: 9,
  autoria: { nome: "Clara Menezes", credencial: "Doutora em Estudos Clássicos" },
  publicadoEm: "2026-09-28",
  corpo: [],
  fontes: ["a", "b"],
  status: "publicado",
  criadoEm: "2026-09-01T10:00:00.000Z",
  atualizadoEm: "2026-09-28T10:00:00.000Z",
  criadoPor: "Editoria do acervo",
  atualizadoPor: "Editoria do acervo",
  situacaoJuridica: { tipo: "licenca", licenca: "CC BY-SA 4.0" },
  temaDivergente: false,
  notaDivergencia: "",
  producaoIA: false,
} satisfies ConteudoEditorial;

describe("exportação CSV (RF-38)", () => {
  it("começa com BOM UTF-8 e usa ; com cabeçalhos em português", () => {
    const csv = gerarCsv(COLUNAS_ARTIGOS, [artigo]);
    expect(csv.startsWith(BOM)).toBe(true);
    const [cabecalho, linha] = csv.slice(1).split("\r\n");
    expect(cabecalho?.split(";").slice(0, 4)).toEqual(["Título", "Sala", "Tipo", "Status"]);
    expect(linha).toContain('"O ""silêncio""; no Tratado X"');
    expect(linha).toContain("Corpus Hermeticum");
    expect(linha).toContain("Meditação, Alma");
    expect(linha).toContain("Licença compatível: CC BY-SA 4.0");
  });

  it("escapa aspas, separador e quebra de linha", () => {
    expect(celula("simples")).toBe("simples");
    expect(celula('a "b"')).toBe('"a ""b"""');
    expect(celula("linha\nnova")).toBe('"linha\nnova"');
  });

  it("RNF-LEG-01/02: não exporta dados de contas (quem criou ou editou, e-mail)", () => {
    const cabecalhos = [...COLUNAS_ARTIGOS, ...COLUNAS_VIDEOS, ...COLUNAS_FONTES].map((c) =>
      c.cabecalho.toLowerCase(),
    );
    expect(cabecalhos.some((c) => /criado por|atualizado por|e-mail|email|pseud/.test(c))).toBe(false);
    expect(gerarCsv(COLUNAS_ARTIGOS, [artigo])).not.toContain("Editoria do acervo");
  });

  it("descreve a situação jurídica por extenso", () => {
    expect(rotuloSituacao(null)).toBe("Não declarada");
    expect(rotuloSituacao({ tipo: "trecho-permitido" })).toBe("Trecho permitido com referência");
  });
});
