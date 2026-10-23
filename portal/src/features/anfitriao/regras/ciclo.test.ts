import { describe, expect, it } from "vitest";
import type { StatusEditorial } from "@/data/types";
import {
  type EventoCiclo,
  editar,
  MOTIVO_MINIMO,
  planejarAprovacaoSala,
  planejarEnvioSala,
  planejarReprovacaoSala,
  podeEnviarArtigoAvulso,
  podeExcluir,
  reprovar,
  transicao,
  validarMotivo,
} from "./ciclo";

const TODOS: StatusEditorial[] = ["rascunho", "em_revisao", "publicado", "reprovado", "arquivado"];
const MOTIVO = "Faltou indicar a edição usada na citação do dito 3.";

/* Máquina de estados de Salas e artigos de anfitrião (anfitriões §4.1). */
describe("transições permitidas", () => {
  const permitidas: [StatusEditorial, EventoCiclo, StatusEditorial][] = [
    ["rascunho", "enviar", "em_revisao"],
    ["reprovado", "enviar", "em_revisao"],
    ["em_revisao", "aprovar", "publicado"],
    ["em_revisao", "reprovar", "reprovado"],
    ["reprovado", "editar", "rascunho"],
    ["rascunho", "editar", "rascunho"],
    ["publicado", "editar", "rascunho"],
    ["arquivado", "editar", "rascunho"],
    ["publicado", "retirar", "arquivado"],
  ];
  it.each(permitidas)("%s --%s--> %s", (de, evento, para) => {
    expect(transicao(de, evento)).toEqual({ ok: true, para });
  });
});

describe("transições proibidas", () => {
  const permitido = new Set([
    "rascunho:enviar",
    "reprovado:enviar",
    "em_revisao:aprovar",
    "em_revisao:reprovar",
    "reprovado:editar",
    "rascunho:editar",
    "publicado:editar",
    "arquivado:editar",
    "publicado:retirar",
  ]);
  const eventos: EventoCiclo[] = ["editar", "enviar", "aprovar", "reprovar", "retirar"];
  const proibidas = TODOS.flatMap((de) =>
    eventos.filter((ev) => !permitido.has(`${de}:${ev}`)).map((ev) => [de, ev] as const),
  );

  it("cobre as 16 combinações restantes", () => expect(proibidas).toHaveLength(16));

  it.each(proibidas)("%s não aceita %s", (de, evento) => {
    const t = transicao(de, evento);
    expect(t.ok).toBe(false);
    if (!t.ok) expect(t.erro).toMatch(/^[a-zà-ú]/);
  });

  it("publicar direto, sem revisão, não existe: rascunho não vai a publicado", () => {
    expect(transicao("rascunho", "aprovar").ok).toBe(false);
    expect(transicao("reprovado", "aprovar").ok).toBe(false);
  });

  it("em revisão o item fica travado para o anfitrião", () => {
    expect(editar("em_revisao")).toMatchObject({ ok: false, erro: expect.stringContaining("em revisão") });
  });
});

describe("motivo de reprovação", () => {
  it("reprovar sem motivo falha", () => {
    expect(reprovar("em_revisao", "").ok).toBe(false);
    expect(reprovar("em_revisao", "   ").ok).toBe(false);
    expect(reprovar("em_revisao", undefined).ok).toBe(false);
  });

  it(`exige pelo menos ${MOTIVO_MINIMO} caracteres úteis`, () => {
    expect(validarMotivo("Faltou fonte.")).toMatch(/pelo menos 20/);
    expect(validarMotivo(MOTIVO)).toBeNull();
    expect(reprovar("em_revisao", MOTIVO)).toEqual({ ok: true, para: "reprovado" });
  });

  it("com motivo, ainda vale a regra de status", () => {
    expect(reprovar("publicado", MOTIVO).ok).toBe(false);
  });
});

describe("editar um item publicado tira o item do ar", () => {
  it("publicado volta a rascunho e avisa que saiu do ar", () => {
    expect(editar("publicado")).toEqual({ ok: true, para: "rascunho", saiDoAr: true });
  });
  it("rascunho e reprovado não saem do ar (não estavam)", () => {
    expect(editar("rascunho")).toEqual({ ok: true, para: "rascunho", saiDoAr: false });
    expect(editar("reprovado")).toEqual({ ok: true, para: "rascunho", saiDoAr: false });
  });
});

describe("excluir", () => {
  it("só o que nunca foi ao ar", () => {
    expect(podeExcluir({ status: "rascunho", jaPublicado: false })).toBeNull();
    expect(podeExcluir({ status: "reprovado", jaPublicado: false })).toBeNull();
    expect(podeExcluir({ status: "rascunho", jaPublicado: true })).toMatch(/retire do ar/);
    expect(podeExcluir({ status: "arquivado", jaPublicado: true })).toMatch(/retire do ar/);
    expect(podeExcluir({ status: "em_revisao", jaPublicado: false })).toMatch(/em revisão/);
  });
});

describe("Sala e artigos (§4.2, §4.3)", () => {
  const sala = (status: StatusEditorial, jaPublicado = false) => ({ status, jaPublicado });

  it("primeiro envio da Sala precisa de pelo menos um artigo", () => {
    const artigos = [{ id: "a1", status: "rascunho" as const }];
    expect(planejarEnvioSala(sala("rascunho"), artigos, []).ok).toBe(false);
    expect(planejarEnvioSala(sala("rascunho"), artigos, ["a1"])).toEqual({ ok: true, artigos: ["a1"] });
  });

  it("só rascunhos e reprovados da própria Sala vão junto", () => {
    const artigos = [
      { id: "a1", status: "rascunho" as const },
      { id: "a2", status: "publicado" as const },
    ];
    expect(planejarEnvioSala(sala("rascunho"), artigos, ["a2"]).ok).toBe(false);
    expect(planejarEnvioSala(sala("rascunho"), artigos, ["outro"]).ok).toBe(false);
  });

  it("Sala já publicada (editada) pode ser reenviada sozinha", () => {
    expect(planejarEnvioSala(sala("rascunho", true), [{ id: "a1", status: "publicado" }], [])).toEqual({
      ok: true,
      artigos: [],
    });
  });

  it("artigo avulso só numa Sala publicada", () => {
    expect(podeEnviarArtigoAvulso("publicado")).toBeNull();
    expect(podeEnviarArtigoAvulso("rascunho")).toMatch(/envie a Sala/);
    expect(podeEnviarArtigoAvulso("em_revisao")).toMatch(/espere/);
  });

  it("“Aprovar Sala” fica bloqueado sem artigo aprovado", () => {
    const artigos = [{ id: "a1", status: "reprovado" as const }];
    const r = planejarAprovacaoSala({ status: "em_revisao" }, artigos);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erro).toMatch(/pelo menos um artigo/);
  });

  it("“Aprovar Sala” publica os artigos em revisão e deixa de fora os reprovados nesta revisão", () => {
    const artigos = [
      { id: "a1", status: "em_revisao" as const },
      { id: "a2", status: "reprovado" as const },
      { id: "a3", status: "rascunho" as const },
    ];
    expect(planejarAprovacaoSala({ status: "em_revisao" }, artigos)).toEqual({ ok: true, publicar: ["a1"] });
  });

  it("Sala reenviada depois de editar pode ser aprovada com os artigos que já estavam no ar", () => {
    expect(planejarAprovacaoSala({ status: "em_revisao" }, [{ id: "a1", status: "publicado" }])).toEqual({
      ok: true,
      publicar: [],
    });
  });

  it("“Reprovar Sala” devolve a Sala e os artigos em revisão, com motivo obrigatório", () => {
    const artigos = [
      { id: "a1", status: "em_revisao" as const },
      { id: "a2", status: "publicado" as const },
    ];
    expect(planejarReprovacaoSala({ status: "em_revisao" }, artigos, "").ok).toBe(false);
    expect(planejarReprovacaoSala({ status: "em_revisao" }, artigos, MOTIVO)).toEqual({
      ok: true,
      devolver: ["a1"],
    });
  });
});
