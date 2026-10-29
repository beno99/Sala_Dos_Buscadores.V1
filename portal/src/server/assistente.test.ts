// @vitest-environment node
import { prepararDemonstracao } from "@tests/support/demonstracao";
import { beforeAll, describe, expect, it } from "vitest";
import { acervoPublico } from "@/data/repositorio";
import { montarResposta } from "./assistente";

beforeAll(() => prepararDemonstracao());

describe("assistente com IA", () => {
  it("renumera as fontes pela ordem de citação e descarta documentos inexistentes", () => {
    const docs = acervoPublico().conteudos.slice(0, 5);
    const r = montarResposta({ pergunta: "o que é gnose?", modo: "explorar", escopo: "todo" }, docs, {
      semFonte: false,
      trechos: [
        { tipo: "doc", texto: "“Trecho” [4]", refs: [4] },
        { tipo: "ai", texto: "Síntese [2] e [4] e [99].", refs: [2, 4, 99] },
      ],
    });
    expect(r.fontes.map((f) => f.titulo)).toEqual([docs[3]?.titulo, docs[1]?.titulo]);
    expect(r.trechos[0]).toMatchObject({
      refs: [1],
      texto: "“Trecho” [1]",
      rotulo: `Trecho documental · ${docs[3]?.titulo}`,
    });
    expect(r.trechos[1]).toMatchObject({
      refs: [2, 1],
      texto: "Síntese [2] e [1] e .",
      rotulo: "Síntese da IA",
    });
    expect(r.fontes[0]?.href).toBe(`/salas/${docs[3]?.sala}/${docs[3]?.slug}`);
    expect(r.semFonte).toBe(false);
  });
});
