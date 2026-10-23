import { salaPorSlug, salasNaComparacao } from "@/data/catalogo";
import { RESPOSTAS } from "@/data/mock/assistente";
import type { RespostaAssistente, SalaSlug, TemaSlug, TrechoResposta } from "@/data/types";
import { detectarTemas } from "@/features/busca/busca";
import { normalizar } from "@/lib/texto";

/*
 * Motor simulado do assistente (RF-26 a RF-31). Não chama nenhuma API de IA:
 * escolhe uma resposta pronta do acervo simulado pelos termos da pergunta.
 * Para ligar um modelo real (RAG), substitua `consultar` mantendo o contrato:
 * etapas reais, trechos tipados (doc/editorial/ai) e fontes numeradas.
 */

export type Escopo = "todo" | SalaSlug;

// ---------- leituras de anfitriões no acervo do assistente (§7) ----------

/** Artigo publicado de uma Sala de anfitrião que a curadoria incluiu na comparação. */
export interface LeituraParaAssistente {
  sala: SalaSlug;
  salaNome: string;
  slug: string;
  titulo: string;
  resumo: string;
  temas: TemaSlug[];
  /** "Nome · credencial" de quem assina. */
  autoria: string;
}

const CHAVE_LEITURAS = Symbol.for("sala-dos-buscadores.leituras-do-assistente");
type ComLeituras = typeof globalThis & { [CHAVE_LEITURAS]?: () => LeituraParaAssistente[] };

/**
 * Como o registro de Salas do catálogo: no servidor, o store instala a fonte;
 * no navegador, o layout raiz manda a lista. Sem registro, não há leituras.
 */
export function instalarLeiturasDoAssistente(fonte: () => LeituraParaAssistente[]): void {
  (globalThis as ComLeituras)[CHAVE_LEITURAS] = fonte;
}

function leiturasDeAnfitrioes(): LeituraParaAssistente[] {
  const naComparacao = new Set(salasNaComparacao().map((s) => s.slug));
  return ((globalThis as ComLeituras)[CHAVE_LEITURAS]?.() ?? []).filter((l) => naComparacao.has(l.sala));
}

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
  const onde = escopo === "todo" ? "nas Salas do acervo" : `na Sala ${salaPorSlug(escopo)?.nome ?? ""}`;
  // Sala oficial nova, sem nenhuma leitura curada para o assistente: diz isso, sem completar a lacuna.
  const semCuradoria =
    escopo !== "todo" &&
    salaPorSlug(escopo)?.origem === "oficial" &&
    !RESPOSTAS.some((r) => r.salas.includes(escopo));
  if (semCuradoria) {
    return {
      trechos: [
        {
          tipo: "ai",
          rotulo: "Síntese da IA · sem leitura curada",
          texto: `A Sala ${salaPorSlug(escopo)?.nome ?? ""} ainda não tem leituras curadas para o assistente. Prefiro não completar a lacuna com suposições: entre na Sala para ler os artigos dela ou amplie o escopo para “Todo o acervo”.`,
          refs: [],
        },
      ],
      fontes: [],
      salasConsultadas: 1,
      trechosLidos: 0,
      semFonte: true,
    };
  }
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
    salasConsultadas: escopo === "todo" ? salasNaComparacao().length : 1,
    trechosLidos: 0,
    semFonte: true,
  };
}

/**
 * Acrescenta as leituras de anfitriões sobre o tema da pergunta, como trechos
 * de interpretação, cada uma com fonte numerada e o selo de anfitrião. A
 * síntese da IA continua por último; quando o acervo da curadoria não tinha
 * trecho, a síntese diz que só há leituras de anfitriões.
 */
function comLeiturasDeAnfitrioes(
  r: Omit<Resposta, "id" | "pergunta" | "escopo">,
  pergunta: string,
  escopo: Escopo,
  arbitragem: boolean,
): Omit<Resposta, "id" | "pergunta" | "escopo"> {
  if (arbitragem) return r;
  const temas = detectarTemas(pergunta);
  if (!temas.length) return r;
  const vistas = new Set<string>();
  const relevantes = leiturasDeAnfitrioes().filter((l) => {
    if (escopo !== "todo" && l.sala !== escopo) return false;
    if (!l.temas.some((t) => temas.includes(t)) || vistas.has(l.sala)) return false;
    vistas.add(l.sala);
    return true;
  });
  if (!relevantes.length) return r;

  const fontes = r.semFonte ? [] : [...r.fontes];
  const anteriores = r.semFonte ? [] : r.trechos;
  const ultima = anteriores.at(-1);
  const sintese = ultima?.tipo === "ai" ? ultima : undefined;
  const trechos: TrechoResposta[] = sintese ? anteriores.slice(0, -1) : [...anteriores];
  const novas: number[] = [];
  for (const l of relevantes) {
    fontes.push({
      titulo: l.titulo,
      referencia: `${l.autoria} · Sala ${l.salaNome}`,
      capa: "grafite",
      inicial: (l.titulo[0] ?? "?").toUpperCase(),
      href: `/salas/${l.sala}/${l.slug}`,
      proveniencia: "anfitriao",
    });
    const n = fontes.length;
    novas.push(n);
    trechos.push({
      tipo: "editorial",
      rotulo: `Leitura de anfitrião · ${l.salaNome}`,
      texto: `Segundo ${l.autoria.split(" · ")[0]}, na Sala ${l.salaNome}: ${l.resumo} [${n}]`,
      refs: [n],
      sala: l.sala,
    });
  }
  if (sintese) trechos.push(sintese);
  else {
    trechos.push({
      tipo: "ai",
      rotulo: "Síntese da IA",
      texto: `O acervo da curadoria não tem trecho direto sobre a pergunta; as leituras acima são de anfitriões, revisadas pela curadoria antes de irem ao ar. Confira as fontes antes de concluir. ${novas.map((n) => `[${n}]`).join("")}`,
      refs: novas,
    });
  }
  return {
    trechos,
    fontes,
    salasConsultadas: r.salasConsultadas + (escopo === "todo" ? relevantes.length : 0),
    trechosLidos: r.trechosLidos + relevantes.length,
    semFonte: false,
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
  const arbitragem = escolhida?.id === "qual-e-verdadeira";
  const completar = (r: Omit<Resposta, "id" | "pergunta" | "escopo">) => ({
    ...base,
    ...comLeiturasDeAnfitrioes(r, pergunta, escopo, arbitragem),
  });
  if (!escolhida) return completar(semResposta(pergunta, escopo));
  if (escopo !== "todo" && escolhida.salas.length > 0) {
    return completar(restringir(escolhida, escopo) ?? semResposta(pergunta, escopo));
  }
  return completar({
    trechos: escolhida.trechos,
    fontes: escolhida.fontes,
    salasConsultadas: escolhida.salas.length || salasNaComparacao().length,
    trechosLidos: escolhida.trechosLidos,
    semFonte: escolhida.fontes.length === 0,
  });
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
