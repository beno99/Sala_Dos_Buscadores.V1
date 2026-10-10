import { describe, expect, it, vi } from "vitest";
import { consultar, escolherResposta, responder } from "./motor";

describe("motor do assistente", () => {
  it("responde a pergunta que atravessa Salas expondo as diferenças, sem arbitrar (RF-30)", () => {
    const r = responder("O que acontece com a alma após a morte?");
    expect(r.salasConsultadas).toBeGreaterThan(1);
    const sintese = r.trechos.find((t) => t.tipo === "ai");
    expect(sintese?.texto).toMatch(/não indica qual dessas descrições é verdadeira/);
    expect(new Set(r.trechos.map((t) => t.tipo))).toEqual(new Set(["doc", "editorial", "ai"]));
  });

  it("recusa o papel de autoridade quando perguntam qual tradição é a certa (RF-31)", () => {
    expect(escolherResposta("Qual religião é a verdadeira sobre a morte?")?.id).toBe("qual-e-verdadeira");
  });

  it("diz que não encontrou, sem inventar fonte, quando o acervo não trata do assunto (RNF-DOM-02)", () => {
    const r = responder("Qual a melhor receita de pão?");
    expect(r.semFonte).toBe(true);
    expect(r.fontes).toHaveLength(0);
    expect(r.trechos[0]?.rotulo).toMatch(/sem trecho do acervo/);
  });

  it("restringe ao escopo de uma Sala e renumera as fontes", () => {
    const r = responder("O que acontece após a morte?", "urantia");
    expect(r.salasConsultadas).toBe(1);
    expect(r.fontes).toHaveLength(1);
    for (const t of r.trechos) for (const n of t.refs) expect(n).toBe(1);
    expect(r.trechos.at(-1)?.texto).toMatch(/restrita à Sala O Livro de Urântia/);
  });

  it("consulta etapa por etapa e pode ser interrompida", async () => {
    vi.useFakeTimers();
    const etapas: string[] = [];
    const ctrl = new AbortController();
    const promessa = consultar("morte", { signal: ctrl.signal, onEtapa: (e) => etapas.push(e) });
    await vi.advanceTimersByTimeAsync(1000);
    ctrl.abort();
    await expect(promessa).rejects.toMatchObject({ name: "AbortError" });
    expect(etapas).toEqual(["buscar", "ler"]);
    vi.useRealTimers();
  });
});
