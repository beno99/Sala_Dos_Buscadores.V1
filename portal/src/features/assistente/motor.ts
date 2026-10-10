import { salaPorSlug, todasAsSalas } from "@/data/catalogo";
import { RESPOSTAS } from "@/data/mock/assistente";
import type { RespostaAssistente, SalaSlug, TrechoResposta } from "@/data/types";
import { normalizar } from "@/lib/texto";

/*
 * Motor simulado do assistente (RF-26 a RF-31). Não chama nenhuma API de IA:
 * escolhe uma resposta pronta do acervo simulado pelos termos da pergunta.
 * Para ligar um modelo real (RAG), substitua `consultar` mantendo o contrato:
 * etapas reais, trechos tipados (doc/editorial/ai) e fontes numeradas.
 */

export type Escopo = "todo" | SalaSlug;

export interface Resposta {
  id: string;
  pergunta: string;
  escopo: Escopo;
  trechos: TrechoResposta[];
  fontes: RespostaAssistente["fontes"];
  salasConsultadas: number;
  trechosLidos: number;
  /** A resposta não encontrou trecho no acervo e diz isso (RNF-DOM-02). */
  semFonte: boolean;
}

export const ETAPAS = ["buscar", "ler", "conferir", "escrever"] as const;
export type Etapa = (typeof ETAPAS)[number];

export function rotuloEtapa(etapa: Etapa, salas: number, trechos: number): string {
  switch (etapa) {
    case "buscar":
      return `Buscar em ${salas} ${salas === 1 ? "Sala" : "Salas"}`;
    case "ler":
      return `Ler ${trechos} ${trechos === 1 ? "trecho relevante" : "trechos relevantes"}`;
    case "conferir":
      return "Conferir as fontes citadas";
    case "escrever":
      return "Escrever a síntese";
  }
}

/** Sugestões para os chips do campo de pergunta. */
export const SUGESTOES = RESPOSTAS.map((r) => r.exemplo);

function pontuar(pergunta: string, resposta: RespostaAssistente): number {
  const q = ` ${normalizar(pergunta)} `;
  return resposta.gatilhos.reduce((soma, g) => (q.includes(` ${g} `) ? soma + g.split(" ").length : soma), 0);
}

export function escolherResposta(pergunta: string): RespostaAssistente | null {
  let melhor: RespostaAssistente | null = null;
  let pontos = 0;
  for (const r of RESPOSTAS) {
    const p = pontuar(pergunta, r);
    // A pergunta sobre "qual é a verdadeira" tem prioridade: o assistente nunca arbitra (RF-31).
    if (p > 0 && r.id === "qual-e-verdadeira") return r;
    if (p > pontos) {
      melhor = r;
      pontos = p;
    }
  }
  return melhor;
}

/** Restringe a resposta a uma Sala, renumerando as fontes que continuam citadas. */
function restringir(
  r: RespostaAssistente,
  sala: SalaSlug,
): Omit<Resposta, "id" | "pergunta" | "escopo"> | null {
  if (!r.salas.includes(sala)) return null;
  if (r.salas.length === 1) {
    return {
      trechos: r.trechos,
      fontes: r.fontes,
      salasConsultadas: 1,
      trechosLidos: r.trechosLidos,
      semFonte: r.fontes.length === 0,
    };
  }
  const daSala = r.trechos.filter((t) => t.sala === sala);
  const usadas = [...new Set(daSala.flatMap((t) => t.refs))].sort((a, b) => a - b);
  const mapa = new Map(usadas.map((antiga, i) => [antiga, i + 1]));
  const renumerar = (t: TrechoResposta): TrechoResposta => ({
    ...t,
    refs: t.refs.map((n) => mapa.get(n) ?? n),
    texto: t.texto.replace(/\[(\d+)\]/g, (_, n) => `[${mapa.get(Number(n)) ?? n}]`),
  });
  const nome = salaPorSlug(sala)?.nome ?? "esta Sala";
  const refs = usadas.map((n) => mapa.get(n) ?? n);
  const sintese: TrechoResposta = {
    tipo: "ai",
    rotulo: "Síntese da IA",
    texto: `Esta resposta ficou restrita à Sala ${nome}. Outras Salas também tratam do tema, com vocabulário e conclusões próprias; amplie o escopo para “Todo o acervo” para ver as diferenças lado a lado. ${refs.map((n) => `[${n}]`).join("")}`,
    refs,
  };
  return {
    trechos: [...daSala.map(renumerar), sintese],
    fontes: usadas.map((n) => r.fontes[n - 1]).filter((f): f is NonNullable<typeof f> => Boolean(f)),
    salasConsultadas: 1,
    trechosLidos: Math.max(2, Math.round(r.trechosLidos / r.salas.length)),
    semFonte: false,
  };
}

function semResposta(pergunta: string, escopo: Escopo): Omit<Resposta, "id" | "pergunta" | "escopo"> {
  const onde = escopo === "todo" ? "nas cinco Salas do acervo" : `na Sala ${salaPorSlug(escopo)?.nome ?? ""}`;
  return {
    trechos: [
      {
        tipo: "ai",
        rotulo: "Síntese da IA · sem trecho do acervo",
        texto: `Não encontrei ${onde} trechos que tratem diretamente de “${pergunta.trim()}”. Prefiro não completar a lacuna com suposições. Tente um tema que atravessa as Salas, como morte, alma, meditação ou origem do universo, ou use a busca comparativa.`,
        refs: [],
      },
    ],
    fontes: [],
    salasConsultadas: escopo === "todo" ? todasAsSalas().length : 1,
    trechosLidos: 0,
    semFonte: true,
  };
}

/** Monta a resposta para uma pergunta, sem esperar (útil em testes). */
export function responder(pergunta: string, escopo: Escopo = "todo"): Resposta {
  const base = {
    id: `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    pergunta,
    escopo,
  };
  const escolhida = escolherResposta(pergunta);
  if (!escolhida) return { ...base, ...semResposta(pergunta, escopo) };
  if (escopo !== "todo" && escolhida.salas.length > 0) {
    const restrita = restringir(escolhida, escopo);
    return { ...base, ...(restrita ?? semResposta(pergunta, escopo)) };
  }
  return {
    ...base,
    trechos: escolhida.trechos,
    fontes: escolhida.fontes,
    salasConsultadas: escolhida.salas.length || todasAsSalas().length,
    trechosLidos: escolhida.trechosLidos,
    semFonte: escolhida.fontes.length === 0,
  };
}

export interface OpcoesConsulta {
  escopo?: Escopo;
  signal?: AbortSignal;
  onEtapa?: (etapa: Etapa, indice: number) => void;
  /** Duração de cada etapa, em ms. */
  duracoes?: readonly [number, number, number, number];
}

const DURACOES_PADRAO = [900, 900, 700, 800] as const;

/** Simula a consulta etapa por etapa; rejeita com AbortError se interrompida. */
export async function consultar(pergunta: string, opcoes: OpcoesConsulta = {}): Promise<Resposta> {
  const { escopo = "todo", signal, onEtapa, duracoes = DURACOES_PADRAO } = opcoes;
  for (const [i, etapa] of ETAPAS.entries()) {
    onEtapa?.(etapa, i);
    await esperar(duracoes[i] ?? 0, signal);
  }
  return responder(pergunta, escopo);
}

function esperar(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException("Consulta interrompida", "AbortError"));
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        reject(new DOMException("Consulta interrompida", "AbortError"));
      },
      { once: true },
    );
  });
}
