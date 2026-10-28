import { prepararDemonstracao, SALA_TOME_ID } from "@tests/support/demonstracao";
import { beforeEach, describe, expect, it } from "vitest";
import { acervoPublico } from "@/data/repositorio";
import { responder } from "@/features/assistente/motor";
import { buscar, FILTROS_VAZIOS } from "@/features/busca/busca";
import { definirNaComparacao } from "./revisao";

/* Onde o conteúdo de anfitrião aparece (§7): grade e assistente só com `naComparacao`. */

const ADMIN = "Editoria do acervo";
const grade = (tema: string) =>
  buscar({ ...FILTROS_VAZIOS, temas: [tema as "alma"] }, acervoPublico()).comparacao?.respostas.map(
    (r) => r.sala,
  ) ?? [];

beforeEach(async () => {
  await prepararDemonstracao();
});

describe("grade comparativa", () => {
  it("a Sala de anfitrião fica fora da grade até o admin ligar", () => {
    expect(grade("conhecimento-interior")).not.toContain("leituras-do-evangelho-de-tome");
    definirNaComparacao(SALA_TOME_ID, true, ADMIN);
    expect(grade("conhecimento-interior")).toContain("leituras-do-evangelho-de-tome");
  });

  it("a coluna traz a leitura do anfitrião com o selo; sem leitura no tema, diz isso", () => {
    definirNaComparacao(SALA_TOME_ID, true, ADMIN);
    const comparacao = buscar(
      { ...FILTROS_VAZIOS, temas: ["conhecimento-interior"] },
      acervoPublico(),
    ).comparacao;
    const coluna = comparacao?.respostas.find((r) => r.sala === "leituras-do-evangelho-de-tome");
    expect(coluna).toMatchObject({ proveniencia: "anfitriao", conteudo: expect.any(String) });
    const semLeitura = buscar({ ...FILTROS_VAZIOS, temas: ["morte"] }, acervoPublico()).comparacao;
    expect(semLeitura?.respostas.find((r) => r.sala === "leituras-do-evangelho-de-tome")).toMatchObject({
      vazia: true,
    });
  });

  it("a busca simples e por tema mostra o artigo de anfitrião mesmo fora da comparação", () => {
    const itens = buscar({ ...FILTROS_VAZIOS, temas: ["conhecimento-interior"] }, acervoPublico()).itens;
    expect(itens.some((i) => i.tipo === "conteudo" && i.item.proveniencia === "anfitriao")).toBe(true);
  });
});

describe("assistente", () => {
  const pergunta = "O que é o conhecimento interior para os gnósticos?";

  it("não cita a Sala de anfitrião fora da comparação", () => {
    const r = responder(pergunta);
    expect(r.fontes.some((f) => f.proveniencia === "anfitriao")).toBe(false);
  });

  it("com a Sala na comparação, cita a leitura com o selo, separada como interpretação", () => {
    definirNaComparacao(SALA_TOME_ID, true, ADMIN);
    const r = responder(pergunta);
    const fonte = r.fontes.findIndex((f) => f.proveniencia === "anfitriao");
    expect(fonte).toBeGreaterThanOrEqual(0);
    const trecho = r.trechos.find((t) => t.refs.includes(fonte + 1) && t.tipo === "editorial");
    expect(trecho?.rotulo).toMatch(/^Leitura de anfitrião/);
    expect(trecho?.texto).toMatch(/^Segundo /);
    expect(r.trechos.at(-1)?.tipo).toBe("ai");
  });

  it("nunca entra na resposta que recusa arbitrar qual tradição é a verdadeira", () => {
    definirNaComparacao(SALA_TOME_ID, true, ADMIN);
    const r = responder("Qual tradição é a verdadeira sobre o conhecimento interior?");
    expect(r.fontes.some((f) => f.proveniencia === "anfitriao")).toBe(false);
  });
});
