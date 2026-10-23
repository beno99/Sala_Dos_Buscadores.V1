import { textoDoCorpo } from "@/data/corpo";
import type { FormArtigo, FormCitacao, FormVideo } from "../formularios";
import { LIMITE_TRECHO_PERMITIDO } from "./config";
import { errosDoCorpo, rotuloDoErroDoCorpo } from "./corpo";
import { revisarVoz } from "./voz";
import { extrairIdYoutube, validarDuracao } from "./youtube";

/*
 * Checklist editorial. Itens "pendente" bloqueiam a publicação; itens
 * "alerta" (revisão de voz, limite de trecho) só avisam. Cada item aponta o
 * id do campo do formulário para o link "ir ao campo".
 */

export type EstadoItem = "ok" | "pendente" | "alerta";

export interface ItemChecklist {
  id: string;
  rotulo: string;
  estado: EstadoItem;
  /** id do elemento do formulário que resolve o item. */
  campo: string;
  requisito: string;
  ajuda: string;
}

const item = (
  id: string,
  ok: boolean,
  rotulo: string,
  campo: string,
  requisito: string,
  ajuda: string,
): ItemChecklist => ({ id, rotulo, estado: ok ? "ok" : "pendente", campo, requisito, ajuda });

// ---------- regras de artigo ----------

/** RF-11: Sala, título, resumo, ao menos um tema e nível. */
export function regraIdentificacao(f: FormArtigo): ItemChecklist {
  const faltando: [boolean, string][] = [
    [!f.sala, "campo-sala"],
    [!f.titulo.trim(), "campo-titulo"],
    [!f.resumo.trim(), "campo-resumo"],
    [f.temas.length === 0, "campo-temas"],
    [f.nivel === null, "campo-nivel"],
  ];
  const primeiro = faltando.find(([falta]) => falta);
  return item(
    "identificacao",
    !primeiro,
    "Sala, título, resumo, tema e nível",
    primeiro?.[1] ?? "campo-sala",
    "RF-11",
    "Todo conteúdo carrega metadados cruzados para ser encontrado por Sala e por tema.",
  );
}

/** "IA nunca como curado": texto produzido com IA só pode ter proveniência "ia" (RF-12, RNF-DOM-01). */
export function erroProvenienciaIA(f: Pick<FormArtigo, "producaoIA" | "proveniencia">): string | null {
  if (f.producaoIA && f.proveniencia && f.proveniencia !== "ia") {
    return "texto produzido com auxílio de IA precisa ter a proveniência “Síntese por IA”, nunca curado, especialista ou fonte primária.";
  }
  return null;
}

/** RNF-DOM-01 e RF-12: proveniência classificada antes de ficar visível. */
export function regraProveniencia(f: FormArtigo): ItemChecklist {
  const ok = f.proveniencia !== null && !erroProvenienciaIA(f);
  return item(
    "proveniencia",
    ok,
    "Proveniência definida",
    "campo-proveniencia",
    "RNF-DOM-01",
    f.proveniencia && !ok
      ? "Texto produzido com IA só pode sair como “Síntese por IA”."
      : "Diga de onde vem o texto: fonte primária, curadoria, especialista, comunidade ou IA.",
  );
}

/** RF-11 e RF-12: autoria em texto, ou marcada como não identificada. */
export function regraAutoria(f: FormArtigo): ItemChecklist {
  return item(
    "autoria",
    f.autoriaNaoIdentificada || Boolean(f.autoria.nome.trim()),
    "Autoria preenchida ou não identificada",
    "campo-autoria-nome",
    "RF-12",
    "Nome e credencial em texto simples. Para textos anônimos, marque “Autoria não identificada”.",
  );
}

export function citacaoCompleta(c: FormCitacao): boolean {
  const basico = [c.obra, c.localizacao, c.traducao, c.referencia].every((v) => v.trim());
  const original =
    !c.originalTexto.trim() || (c.originalIdioma.trim() !== "" && c.originalLang.trim() !== "");
  return basico && original;
}

function primeiroCampoDaCitacao(c: FormCitacao): string {
  if (!c.obra.trim()) return "campo-citacao-obra";
  if (!c.localizacao.trim()) return "campo-citacao-localizacao";
  if (c.originalTexto.trim() && !c.originalIdioma.trim()) return "campo-citacao-idioma";
  if (c.originalTexto.trim() && !c.originalLang.trim()) return "campo-citacao-lang";
  if (!c.traducao.trim()) return "campo-citacao-traducao";
  return "campo-citacao-referencia";
}

/** RF-15: fonte primária publica o trecho com obra, localização, tradução e referência. */
export function regraCitacao(f: FormArtigo): ItemChecklist | null {
  const obrigatoria = f.tipo === "fonte-primaria";
  if (!obrigatoria && !f.temCitacao) return null;
  const ok = f.temCitacao && citacaoCompleta(f.citacao);
  return item(
    "citacao",
    ok,
    obrigatoria ? "Citação completa da fonte primária" : "Citação completa",
    f.temCitacao ? primeiroCampoDaCitacao(f.citacao) : "campo-tem-citacao",
    "RF-15",
    "Obra, localização, tradução e referência; se houver original, idioma e código do idioma.",
  );
}

/** RNF-DOM-01: ao menos uma fonte, exceto fonte primária com citação completa. */
export function regraFontes(f: FormArtigo): ItemChecklist {
  const dispensada = f.tipo === "fonte-primaria" && f.temCitacao && citacaoCompleta(f.citacao);
  return item(
    "fontes",
    dispensada || f.fontes.length > 0,
    "Ao menos uma fonte",
    "campo-fontes",
    "RNF-DOM-01",
    "Toda afirmação precisa de origem rastreável. Fonte primária com citação completa dispensa este item.",
  );
}

/** RF-15 e RNF-DOM-04: situação jurídica declarada e completa. */
export function regraSituacaoJuridica(f: FormArtigo): ItemChecklist {
  const s = f.situacaoJuridica;
  const ok =
    s !== null &&
    (s.tipo === "dominio-publico" ||
      s.tipo === "trecho-permitido" ||
      (s.tipo === "licenca" && s.licenca.trim() !== "") ||
      (s.tipo === "cessao" && s.registro.trim() !== ""));
  return item(
    "situacao-juridica",
    ok,
    "Situação jurídica declarada",
    s?.tipo === "licenca" ? "campo-licenca" : s?.tipo === "cessao" ? "campo-cessao" : "campo-situacao",
    "RNF-DOM-04",
    "Texto protegido só entra na íntegra com licença ou cessão registrada; sem isso, em trecho com referência.",
  );
}

/** Total de caracteres reproduzidos: o texto do corpo (sem as imagens) e a citação. */
export function tamanhoReproduzido(f: FormArtigo): number {
  const citacao = f.temCitacao ? f.citacao.originalTexto.length + f.citacao.traducao.length : 0;
  return textoDoCorpo(f.corpo).join("").length + citacao;
}

/**
 * Blocos do texto: o primeiro é um parágrafo; destaque com texto e atribuição;
 * imagem com texto alternativo e crédito. Um item por falta, cada um levando
 * ao bloco certo; sem faltas, um item só, cumprido.
 */
export function regrasDoCorpo(f: Pick<FormArtigo, "corpo">, requisito = "Corpo do artigo"): ItemChecklist[] {
  const erros = Object.entries(errosDoCorpo(f.corpo));
  if (!erros.length) {
    return [
      item(
        "corpo",
        true,
        "Blocos do texto completos",
        "campo-corpo",
        requisito,
        "O texto começa pelo lead; destaques têm atribuição; imagens têm texto alternativo e crédito.",
      ),
    ];
  }
  return erros.map(([campo, mensagem], i) => ({
    id: `corpo-${i}`,
    rotulo: rotuloDoErroDoCorpo(f.corpo, campo),
    estado: "pendente" as const,
    campo,
    requisito,
    ajuda: `${mensagem.charAt(0).toUpperCase()}${mensagem.slice(1)}`,
  }));
}

/** RF-15: trecho permitido acima do limite recebe aviso (não bloqueia). */
export function regraLimiteTrecho(f: FormArtigo): ItemChecklist | null {
  if (f.situacaoJuridica?.tipo !== "trecho-permitido") return null;
  const total = tamanhoReproduzido(f);
  if (total <= LIMITE_TRECHO_PERMITIDO) return null;
  return {
    id: "limite-trecho",
    rotulo: `Trecho com ${total.toLocaleString("pt-BR")} caracteres`,
    estado: "alerta",
    campo: "campo-situacao",
    requisito: "RF-15",
    ajuda: `Acima de ${LIMITE_TRECHO_PERMITIDO.toLocaleString("pt-BR")} caracteres, confira se o recorte ainda é um trecho permitido.`,
  };
}

/** RNF-DOM-03: tema divergente exige a nota que apresenta as leituras. */
export function regraDivergencia(f: FormArtigo): ItemChecklist | null {
  if (!f.temaDivergente) return null;
  return item(
    "divergencia",
    f.notaDivergencia.trim().length >= 20,
    "Nota de divergência",
    "campo-nota-divergencia",
    "RNF-DOM-03",
    "Apresente as leituras divergentes, sem apontar qual é a correta.",
  );
}

/** Revisão de voz: alerta, não bloqueia. */
export function regrasDeVoz(f: FormArtigo): ItemChecklist[] {
  const campos = new Map<string, string>([
    ["título", "campo-titulo"],
    ["resumo", "campo-resumo"],
  ]);
  const blocos = f.corpo.flatMap((b, i) => {
    const texto =
      typeof b === "string"
        ? b
        : b.tipo === "imagem"
          ? null
          : b.tipo === "lista"
            ? b.itens.join("\n")
            : b.texto;
    if (texto === null) return [];
    const onde =
      typeof b === "string"
        ? `parágrafo ${i + 1}`
        : `${b.tipo === "destaque" ? "destaque" : "intertítulo"} ${i + 1}`;
    campos.set(onde, `campo-corpo-${i}`);
    return [{ onde, texto }];
  });
  const achados = revisarVoz([
    { onde: "título", texto: f.titulo },
    { onde: "resumo", texto: f.resumo },
    ...blocos,
  ]);
  return achados.map((a, i) => ({
    id: `voz-${i}`,
    rotulo: `Revisão de voz: “${a.expressao}” no ${a.onde}`,
    estado: "alerta" as const,
    campo: campos.get(a.onde) ?? "campo-corpo",
    requisito: "Tom de voz",
    ajuda: a.sugestao,
  }));
}

export function checklistArtigo(f: FormArtigo): ItemChecklist[] {
  return [
    regraIdentificacao(f),
    regraProveniencia(f),
    regraAutoria(f),
    ...regrasDoCorpo(f),
    regraCitacao(f),
    regraFontes(f),
    regraSituacaoJuridica(f),
    regraDivergencia(f),
    regraLimiteTrecho(f),
    ...regrasDeVoz(f),
  ].filter((i): i is ItemChecklist => i !== null);
}

// ---------- regras de vídeo ----------

export function checklistVideo(f: FormVideo): ItemChecklist[] {
  const faltando: [boolean, string][] = [
    [!f.sala, "campo-sala"],
    [!f.titulo.trim(), "campo-titulo"],
    [!f.tema, "campo-tema"],
    [f.nivel === null, "campo-nivel"],
  ];
  const primeiro = faltando.find(([falta]) => falta);
  return [
    item(
      "identificacao",
      !primeiro,
      "Sala, título, tema e nível",
      primeiro?.[1] ?? "campo-sala",
      "RF-16",
      "O vídeo aparece na Sala e na busca por tema.",
    ),
    item(
      "url",
      extrairIdYoutube(f.url).ok,
      "URL válida do YouTube",
      "campo-url",
      "RF-16",
      "Aceitamos youtube.com/watch, youtu.be e youtube.com/shorts.",
    ),
    item(
      "duracao",
      validarDuracao(f.duracao) === null,
      "Duração válida (mm:ss)",
      "campo-duracao",
      "RF-16",
      "A duração aparece na miniatura do vídeo.",
    ),
  ];
}

export const temPendencia = (itens: ItemChecklist[]) => itens.some((i) => i.estado === "pendente");

// ---------- erros por campo (para o formulário) ----------

/** Ordem dos campos no formulário de artigo: o foco vai ao primeiro com erro. */
export const ORDEM_CAMPOS_ARTIGO = [
  "campo-sala",
  "campo-titulo",
  "campo-slug",
  "campo-resumo",
  "campo-temas",
  "campo-nivel",
  "campo-proveniencia",
  "campo-autoria-nome",
  "campo-corpo",
  "campo-tem-citacao",
  "campo-citacao-obra",
  "campo-citacao-localizacao",
  "campo-citacao-idioma",
  "campo-citacao-lang",
  "campo-citacao-traducao",
  "campo-citacao-referencia",
  "campo-fontes",
  "campo-situacao",
  "campo-licenca",
  "campo-cessao",
  "campo-nota-divergencia",
];

export const ORDEM_CAMPOS_VIDEO = [
  "campo-sala",
  "campo-titulo",
  "campo-url",
  "campo-duracao",
  "campo-tema",
  "campo-nivel",
];

/** O primeiro campo com erro na ordem do formulário; os blocos do corpo (campo-corpo-n…) contam como "campo-corpo". */
export function primeiroCampoComErro(erros: Record<string, string>, ordem: string[]): string | undefined {
  const posicao = (c: string) => {
    const i = ordem.indexOf(c.startsWith("campo-corpo-") ? "campo-corpo" : c);
    return i === -1 ? ordem.length : i;
  };
  const chaves = Object.keys(erros);
  return chaves.reduce<string | undefined>(
    (melhor, c) => (melhor === undefined || posicao(c) < posicao(melhor) ? c : melhor),
    undefined,
  );
}

/** Mensagem de cada campo que impede a publicação (sem o prefixo "Erro:"). */
export function errosDePublicacaoArtigo(f: FormArtigo): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.sala) e["campo-sala"] = "escolha a Sala do conteúdo.";
  if (!f.titulo.trim()) e["campo-titulo"] = "escreva o título.";
  if (!f.resumo.trim()) e["campo-resumo"] = "escreva o resumo que aparece no card do conteúdo.";
  if (f.temas.length === 0) e["campo-temas"] = "escolha ao menos um tema.";
  if (f.nivel === null) e["campo-nivel"] = "escolha o nível de aprofundamento.";
  const erroIA = erroProvenienciaIA(f);
  if (erroIA) e["campo-proveniencia"] = erroIA;
  else if (!f.proveniencia) e["campo-proveniencia"] = "defina a proveniência do conteúdo.";
  if (!f.autoriaNaoIdentificada && !f.autoria.nome.trim()) {
    e["campo-autoria-nome"] = "escreva a autoria ou marque “Autoria não identificada”.";
  }
  const citacao = regraCitacao(f);
  if (citacao?.estado === "pendente") {
    if (!f.temCitacao) e["campo-tem-citacao"] = "fonte primária precisa da citação do trecho.";
    else {
      const c = f.citacao;
      if (!c.obra.trim()) e["campo-citacao-obra"] = "escreva o nome da obra.";
      if (!c.localizacao.trim())
        e["campo-citacao-localizacao"] = "diga onde está o trecho (capítulo, dito, verso).";
      if (c.originalTexto.trim() && !c.originalIdioma.trim())
        e["campo-citacao-idioma"] = "diga o idioma do original.";
      if (c.originalTexto.trim() && !c.originalLang.trim()) {
        e["campo-citacao-lang"] =
          "informe o código do idioma. Ex.: grc para grego antigo, cop para copta, en para inglês.";
      }
      if (!c.traducao.trim()) e["campo-citacao-traducao"] = "escreva a tradução do trecho.";
      if (!c.referencia.trim())
        e["campo-citacao-referencia"] = "escreva a referência completa, no padrão ABNT.";
    }
  }
  Object.assign(e, errosDoCorpo(f.corpo));
  if (regraFontes(f).estado === "pendente")
    e["campo-fontes"] = "escolha ao menos uma fonte ou cadastre uma nova.";
  const s = f.situacaoJuridica;
  if (!s) e["campo-situacao"] = "declare a situação jurídica do texto.";
  else if (s.tipo === "licenca" && !s.licenca.trim())
    e["campo-licenca"] = "diga qual licença permite a publicação.";
  else if (s.tipo === "cessao" && !s.registro.trim())
    e["campo-cessao"] = "informe o registro da cessão do autor.";
  if (regraDivergencia(f)?.estado === "pendente") {
    e["campo-nota-divergencia"] = "apresente as leituras divergentes em ao menos 20 caracteres.";
  }
  return e;
}

/** Erros do corpo que deixaram de valer depois de uma edição dos blocos (para limpar no formulário). */
export function errosDoCorpoResolvidos(erros: Record<string, string>, corpo: FormArtigo["corpo"]): string[] {
  const ainda = errosDoCorpo(corpo);
  return Object.keys(erros).filter((c) => c.startsWith("campo-corpo") && !(c in ainda));
}

export function errosDePublicacaoVideo(f: FormVideo): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.sala) e["campo-sala"] = "escolha a Sala do vídeo.";
  if (!f.titulo.trim()) e["campo-titulo"] = "escreva o título.";
  const url = extrairIdYoutube(f.url);
  if (!url.ok) e["campo-url"] = url.erro;
  const duracao = validarDuracao(f.duracao);
  if (duracao) e["campo-duracao"] = duracao;
  if (!f.tema) e["campo-tema"] = "escolha o tema do vídeo.";
  if (f.nivel === null) e["campo-nivel"] = "escolha o nível.";
  return e;
}
