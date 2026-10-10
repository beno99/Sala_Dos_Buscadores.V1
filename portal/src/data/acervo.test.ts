import { describe, expect, it } from "vitest";
import { comparacaoDoTema, todasAsSalas } from "./catalogo";
import { RESPOSTAS } from "./mock/assistente";
import { CITACOES } from "./mock/citacoes";
import { COMPARACOES } from "./mock/comparacoes";
import { CONTEUDOS } from "./mock/conteudos";
import { GLOSSARIO } from "./mock/glossario";
import { SALAS } from "./mock/salas";
import { VIDEOS } from "./mock/videos";
import { fontesPorId } from "./repositorio";

/* Regras de domínio do DRS verificadas sobre os dados simulados. */

describe("acervo simulado", () => {
  it("cobre as 5 Salas do primeiro ciclo, com ao menos 3 conteúdos, 1 vídeo, 1 citação e 1 verbete cada", () => {
    expect(SALAS.map((s) => s.slug).sort()).toEqual(
      ["apocrifos-cristianismo-primitivo", "caibalion", "corpus-hermeticum", "nag-hammadi", "urantia"].sort(),
    );
    for (const sala of SALAS) {
      expect(CONTEUDOS.filter((c) => c.sala === sala.slug).length).toBeGreaterThanOrEqual(3);
      expect(VIDEOS.some((v) => v.sala === sala.slug)).toBe(true);
      expect(CITACOES.some((c) => c.sala === sala.slug)).toBe(true);
      expect(GLOSSARIO.some((v) => v.definicoes.some((d) => d.sala === sala.slug))).toBe(true);
    }
  });

  it("lista as Salas em ordem alfabética, sem sugerir hierarquia", () => {
    const nomes = todasAsSalas().map((s) => s.nome);
    expect(nomes).toEqual([...nomes].sort((a, b) => a.localeCompare(b, "pt-BR")));
  });

  it("todo conteúdo tem metadados cruzados e proveniência (RF-11, RNF-DOM-01)", () => {
    for (const c of CONTEUDOS) {
      expect(c.temas.length, c.slug).toBeGreaterThan(0);
      expect(c.periodo, c.slug).toBeTruthy();
      expect(c.proveniencia, c.slug).toBeTruthy();
      expect(fontesPorId(c.fontes), c.slug).toHaveLength(c.fontes.length);
    }
  });

  it("toda citação tem referência bibliográfica (RF-15)", () => {
    for (const c of CITACOES) expect(c.referencia.length, c.id).toBeGreaterThan(40);
  });

  it("a grade de cada tema tem uma coluna por Sala, na ordem fixa das Salas (RF-18, RF-19)", () => {
    const ordem = SALAS.map((s) => s.slug);
    for (const { tema } of COMPARACOES) {
      const c = comparacaoDoTema(tema);
      expect(c?.respostas.map((r) => r.sala)).toEqual(ordem);
    }
  });

  it("toda resposta do assistente cita fonte ou se marca como síntese sem trecho (RNF-DOM-02)", () => {
    for (const r of RESPOSTAS) {
      const semFonte = r.fontes.length === 0;
      if (semFonte)
        expect(r.trechos.every((t) => t.tipo === "ai" && t.rotulo.includes("sem trecho"))).toBe(true);
      else expect(r.trechos.some((t) => t.refs.length > 0)).toBe(true);
      for (const t of r.trechos) for (const n of t.refs) expect(n).toBeLessThanOrEqual(r.fontes.length);
    }
  });

  it("nenhum texto afirma qual crença é verdadeira (RF-30, tom de voz)", () => {
    const textos = [
      ...CONTEUDOS.flatMap((c) => c.corpo),
      ...RESPOSTAS.flatMap((r) => r.trechos.map((t) => t.texto)),
      ...COMPARACOES.flatMap((c) => c.respostas.map((r) => (r.vazia ? r.nota : r.resposta))),
    ];
    for (const t of textos) {
      expect(t).not.toMatch(/a verdade é|é a verdadeira|a única verdade|desperte|segredos revelados/i);
      expect(t).not.toMatch(/!/);
    }
  });
});
