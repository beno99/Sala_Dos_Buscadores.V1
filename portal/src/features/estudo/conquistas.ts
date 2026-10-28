import type { IconName } from "@/components/ds/Icon";
import { normalizar } from "@/lib/texto";
import { type ConquistaId, chaveLeitura, type ItemAcervo, type ProgressoEstudo } from "./tipos";

/*
 * Conquistas de estudo, privadas. Os nomes falam de estudo no acervo, nunca de
 * evolução espiritual. Sem placar nem comparação entre pessoas.
 * As conquistas legadas ficam no histórico, sem conversão para critérios novos.
 */

interface Contexto {
  acervo: ItemAcervo[];
  totalSalas: number;
}

interface Definicao {
  id: ConquistaId;
  nome: string;
  /** Critério, mostrado enquanto bloqueada. */
  criterio: string;
  /** O que a pessoa fez, no passado, depois de obtida. */
  feito: string;
  icone: IconName;
  disponibilidade?: "em-breve";
  /** Explica por que uma atividade ainda não pode conceder a conquista. */
  indisponibilidade?: string;
  medir?: (p: ProgressoEstudo, ctx: Contexto) => { atual: number; alvo: number };
}

/** Conta cada leitura uma vez e somente se o conteúdo ainda pertence ao acervo. */
function leiturasValidas(p: ProgressoEstudo, ctx: Contexto): ItemAcervo[] {
  const lidas = new Set(p.leituras.filter((l) => l.concluidaEm).map((l) => chaveLeitura(l.sala, l.slug)));
  return [
    ...new Map(
      ctx.acervo
        .filter((c) => lidas.has(chaveLeitura(c.sala, c.slug)))
        .map((c) => [chaveLeitura(c.sala, c.slug), c]),
    ).values(),
  ];
}

export const CONQUISTAS: Definicao[] = [
  {
    id: "primeiro-passo",
    nome: "Primeiro passo",
    criterio: "Conclua sua primeira leitura no acervo.",
    feito: "Concluiu sua primeira leitura no acervo.",
    icone: "biblioteca",
    medir: (p, ctx) => ({ atual: Math.min(1, leiturasValidas(p, ctx).length), alvo: 1 }),
  },
  {
    id: "palavra-por-palavra",
    nome: "Palavra por palavra",
    criterio: "Consulte 10 verbetes distintos.",
    feito: "Consultou 10 verbetes distintos.",
    icone: "glossario",
    medir: (p) => ({
      atual: Math.min(10, new Set(p.verbetesAbertos.map(normalizar).filter(Boolean)).size),
      alvo: 10,
    }),
  },
  {
    id: "na-fonte",
    nome: "Na fonte",
    criterio: "Conclua leituras de 3 fontes primárias distintas.",
    feito: "Concluiu leituras de 3 fontes primárias distintas.",
    icone: "fontePrimaria",
    medir: (p, ctx) => ({
      atual: Math.min(3, leiturasValidas(p, ctx).filter((c) => c.tipo === "fonte-primaria").length),
      alvo: 3,
    }),
  },
  {
    id: "alem-da-primeira-leitura",
    nome: "Além da primeira leitura",
    criterio: "Conclua 3 pares de documento e comentário, de fontes distintas.",
    feito: "Concluiu 3 pares de documento e comentário, de fontes distintas.",
    icone: "biblioteca",
    disponibilidade: "em-breve",
    indisponibilidade: "Os pares de documento e comentário ainda estão em preparação.",
  },
  {
    id: "lado-a-lado",
    nome: "Lado a lado",
    criterio: "Consulte a comparação de um tema entre Salas.",
    feito: "Consultou a comparação de um tema entre Salas.",
    icone: "comparar",
    medir: (p) => ({ atual: Math.min(1, p.temasComparados.length), alvo: 1 }),
  },
  {
    id: "entre-salas",
    nome: "Entre Salas",
    criterio: "Conclua uma leitura em cada uma de 5 Salas.",
    feito: "Concluiu uma leitura em cada uma de 5 Salas.",
    icone: "salas",
    medir: (p, ctx) => ({
      atual: Math.min(5, new Set(leiturasValidas(p, ctx).map((c) => c.sala)).size),
      alvo: 5,
    }),
  },
  {
    id: "leitura-atenta",
    nome: "Leitura atenta",
    criterio: "Conclua a atividade sobre texto, interpretação e hipótese.",
    feito: "Concluiu a atividade sobre texto, interpretação e hipótese.",
    icone: "curado",
    disponibilidade: "em-breve",
    indisponibilidade: "A atividade sobre texto, interpretação e hipótese ainda está em preparação.",
  },
  {
    id: "caminho-percorrido",
    nome: "Caminho percorrido",
    criterio: "Conclua as atividades obrigatórias do seu primeiro percurso.",
    feito: "Concluiu as atividades obrigatórias do seu primeiro percurso.",
    icone: "trilha",
    disponibilidade: "em-breve",
    indisponibilidade: "Os percursos com conclusão de atividades ainda estão em preparação.",
  },
];

export interface EstadoConquista {
  id: ConquistaId;
  nome: string;
  criterio: string;
  feito: string;
  icone: IconName;
  obtida: boolean;
  em?: string;
  disponibilidade?: "em-breve";
  indisponibilidade?: string;
  /** Progresso parcial quando a meta tem mais de um passo. */
  parcial?: { atual: number; alvo: number };
}

export function avaliarConquistas(p: ProgressoEstudo, ctx: Contexto): EstadoConquista[] {
  return CONQUISTAS.map((d) => {
    const m = d.medir?.(p, ctx);
    const em = p.conquistas[d.id];
    const obtida = Boolean(em) || Boolean(m && m.atual >= m.alvo);
    return {
      id: d.id,
      nome: d.nome,
      criterio: d.criterio,
      feito: d.feito,
      icone: d.icone,
      obtida,
      ...(em ? { em } : {}),
      ...(d.disponibilidade
        ? { disponibilidade: d.disponibilidade, indisponibilidade: d.indisponibilidade }
        : {}),
      ...(!obtida && m && m.alvo > 1 ? { parcial: m } : {}),
    };
  });
}

/** Conquistas que o progresso já cumpre e ainda não foram registradas. */
export function conquistasNovas(p: ProgressoEstudo, ctx: Contexto): ConquistaId[] {
  return CONQUISTAS.filter((d) => {
    if (p.conquistas[d.id] || d.disponibilidade === "em-breve") return false;
    const m = d.medir?.(p, ctx);
    return Boolean(m && m.atual >= m.alvo);
  }).map((d) => d.id);
}

export const nomeConquista = (id: ConquistaId) => CONQUISTAS.find((c) => c.id === id)?.nome ?? id;
