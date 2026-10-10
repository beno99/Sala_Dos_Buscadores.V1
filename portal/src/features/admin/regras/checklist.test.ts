import { describe, expect, it } from "vitest";
import {
  checklistArtigo,
  checklistVideo,
  erroProvenienciaIA,
  errosDePublicacaoArtigo,
  errosDePublicacaoVideo,
  ORDEM_CAMPOS_ARTIGO,
  primeiroCampoComErro,
  regraAutoria,
  regraCitacao,
  regraDivergencia,
  regraFontes,
  regraIdentificacao,
  regraLimiteTrecho,
  regraProveniencia,
  regraSituacaoJuridica,
  temPendencia,
} from "./checklist";
import { LIMITE_TRECHO_PERMITIDO } from "./config";
import { artigoCompleto, videoCompleto } from "./fixtures";

const citacaoCompleta = {
  obra: "Poimandres",
  localizacao: "Tratado I, 26",
  originalTexto: "",
  originalIdioma: "",
  originalLang: "",
  traducao: "“Este é o bom fim para os que alcançaram o conhecimento.”",
  rotuloTraducao: "",
  referencia: "CORPUS HERMETICUM, Tratado I, 26.",
};

describe("checklist editorial de artigo", () => {
  it("artigo completo não tem pendência", () => {
    expect(temPendencia(checklistArtigo(artigoCompleto()))).toBe(false);
  });

  it("RF-11: exige Sala, título, resumo, ao menos um tema e nível, e aponta o primeiro campo", () => {
    expect(regraIdentificacao(artigoCompleto()).estado).toBe("ok");
    expect(regraIdentificacao(artigoCompleto({ sala: "" })).campo).toBe("campo-sala");
    expect(regraIdentificacao(artigoCompleto({ resumo: " " })).campo).toBe("campo-resumo");
    expect(regraIdentificacao(artigoCompleto({ temas: [] })).estado).toBe("pendente");
    expect(regraIdentificacao(artigoCompleto({ nivel: null })).campo).toBe("campo-nivel");
  });

  it("RNF-DOM-01: exige proveniência definida", () => {
    expect(regraProveniencia(artigoCompleto({ proveniencia: null })).estado).toBe("pendente");
    expect(regraProveniencia(artigoCompleto()).estado).toBe("ok");
  });

  it("RF-12: conteúdo marcado como IA nunca pode sair como curado", () => {
    expect(erroProvenienciaIA({ producaoIA: true, proveniencia: "curado" })).toMatch(/Síntese por IA/);
    expect(erroProvenienciaIA({ producaoIA: true, proveniencia: "ia" })).toBeNull();
    expect(erroProvenienciaIA({ producaoIA: false, proveniencia: "curado" })).toBeNull();
    expect(regraProveniencia(artigoCompleto({ producaoIA: true, proveniencia: "curado" })).estado).toBe(
      "pendente",
    );
  });

  it("RF-12: autoria preenchida ou marcada como não identificada", () => {
    expect(regraAutoria(artigoCompleto({ autoria: { nome: "", credencial: "" } })).estado).toBe("pendente");
    expect(
      regraAutoria(artigoCompleto({ autoria: { nome: "", credencial: "" }, autoriaNaoIdentificada: true }))
        .estado,
    ).toBe("ok");
  });

  it("RNF-DOM-01: ao menos uma fonte, exceto fonte primária com citação completa", () => {
    expect(regraFontes(artigoCompleto({ fontes: [] })).estado).toBe("pendente");
    expect(
      regraFontes(
        artigoCompleto({ fontes: [], tipo: "fonte-primaria", temCitacao: true, citacao: citacaoCompleta }),
      ).estado,
    ).toBe("ok");
    expect(
      regraFontes(
        artigoCompleto({
          fontes: [],
          tipo: "fonte-primaria",
          temCitacao: true,
          citacao: { ...citacaoCompleta, referencia: "" },
        }),
      ).estado,
    ).toBe("pendente");
  });

  it("RF-15: fonte primária exige citação completa; original pede idioma e código", () => {
    expect(regraCitacao(artigoCompleto())).toBeNull();
    expect(regraCitacao(artigoCompleto({ tipo: "fonte-primaria" }))?.estado).toBe("pendente");
    expect(
      regraCitacao(artigoCompleto({ tipo: "fonte-primaria", temCitacao: true, citacao: citacaoCompleta }))
        ?.estado,
    ).toBe("ok");
    const semCodigo = { ...citacaoCompleta, originalTexto: "τοῦτό ἐστι", originalIdioma: "grego" };
    const r = regraCitacao(artigoCompleto({ tipo: "fonte-primaria", temCitacao: true, citacao: semCodigo }));
    expect(r?.estado).toBe("pendente");
    expect(r?.campo).toBe("campo-citacao-lang");
  });

  it("RNF-DOM-04: situação jurídica declarada; licença e cessão pedem o registro", () => {
    expect(regraSituacaoJuridica(artigoCompleto({ situacaoJuridica: null })).estado).toBe("pendente");
    expect(
      regraSituacaoJuridica(artigoCompleto({ situacaoJuridica: { tipo: "licenca", licenca: "" } })).campo,
    ).toBe("campo-licenca");
    expect(
      regraSituacaoJuridica(
        artigoCompleto({ situacaoJuridica: { tipo: "licenca", licenca: "CC BY-SA 4.0" } }),
      ).estado,
    ).toBe("ok");
    expect(
      regraSituacaoJuridica(artigoCompleto({ situacaoJuridica: { tipo: "cessao", registro: "" } })).estado,
    ).toBe("pendente");
    expect(
      regraSituacaoJuridica(artigoCompleto({ situacaoJuridica: { tipo: "dominio-publico" } })).estado,
    ).toBe("ok");
  });

  it("RF-15: trecho permitido acima do limite gera alerta, sem bloquear", () => {
    const longo = artigoCompleto({ corpo: ["a".repeat(LIMITE_TRECHO_PERMITIDO + 1)] });
    expect(regraLimiteTrecho(longo)?.estado).toBe("alerta");
    expect(temPendencia(checklistArtigo(longo))).toBe(false);
    expect(regraLimiteTrecho(artigoCompleto())).toBeNull();
    expect(regraLimiteTrecho({ ...longo, situacaoJuridica: { tipo: "dominio-publico" } })).toBeNull();
  });

  it("RNF-DOM-03: tema divergente exige a nota que apresenta as leituras", () => {
    expect(regraDivergencia(artigoCompleto())).toBeNull();
    expect(regraDivergencia(artigoCompleto({ temaDivergente: true }))?.estado).toBe("pendente");
    expect(
      regraDivergencia(
        artigoCompleto({
          temaDivergente: true,
          notaDivergencia: "Parte dos estudiosos data o texto no séc. I; outra, no II.",
        }),
      )?.estado,
    ).toBe("ok");
  });

  it("revisão de voz alerta no checklist, sem bloquear a publicação", () => {
    const itens = checklistArtigo(
      artigoCompleto({ resumo: "A verdade é que o Tratado X ensina o silêncio." }),
    );
    const voz = itens.filter((i) => i.id.startsWith("voz-"));
    expect(voz).toHaveLength(1);
    expect(voz[0]).toMatchObject({ estado: "alerta", campo: "campo-resumo" });
    expect(temPendencia(itens)).toBe(false);
  });

  it("os erros por campo seguem a ordem do formulário, para o foco ir ao primeiro", () => {
    const erros = errosDePublicacaoArtigo(artigoCompleto({ titulo: "", fontes: [], situacaoJuridica: null }));
    expect(Object.keys(erros).sort()).toEqual(["campo-fontes", "campo-situacao", "campo-titulo"]);
    expect(primeiroCampoComErro(erros, ORDEM_CAMPOS_ARTIGO)).toBe("campo-titulo");
  });
});

describe("checklist de vídeo (RF-16)", () => {
  it("vídeo completo não tem pendência", () => {
    expect(temPendencia(checklistVideo(videoCompleto()))).toBe(false);
  });

  it("URL válida do YouTube e duração válida são obrigatórias", () => {
    const itens = checklistVideo(videoCompleto({ url: "https://vimeo.com/1", duracao: "5:99" }));
    expect(itens.filter((i) => i.estado === "pendente").map((i) => i.id)).toEqual(["url", "duracao"]);
    expect(Object.keys(errosDePublicacaoVideo(videoCompleto({ url: "" })))).toEqual(["campo-url"]);
  });
});
