import type { IconName } from "@/components/ds/Icon";
import type { SalaSlug, TemaSlug } from "@/data/types";
import { nivelNoAssunto } from "./niveis";
import type { ConquistaId, ItemAcervo, ProgressoEstudo } from "./tipos";

/*
 * Conquistas de estudo, privadas. Os nomes falam de estudo no acervo, nunca de
 * evolução espiritual. Sem placar nem comparação entre pessoas.
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
  medir: (p: ProgressoEstudo, ctx: Contexto) => { atual: number; alvo: number };
}

const lidasDoTipo = (p: ProgressoEstudo, ctx: Contexto, tipo: ItemAcervo["tipo"]) =>
  p.leituras.filter(
    (l) => l.concluidaEm && ctx.acervo.some((c) => c.sala === l.sala && c.slug === l.slug && c.tipo === tipo),
  ).length;

function algumAssuntoAvancado(p: ProgressoEstudo, ctx: Contexto): boolean {
  const salas = new Set<SalaSlug>(ctx.acervo.map((c) => c.sala));
  const temas = new Set<TemaSlug>(ctx.acervo.flatMap((c) => c.temas));
  return (
    [...salas].some((sala) => nivelNoAssunto({ tipo: "sala", sala }, ctx.acervo, p.leituras).nivel === 3) ||
    [...temas].some((tema) => nivelNoAssunto({ tipo: "tema", tema }, ctx.acervo, p.leituras).nivel === 3)
  );
}

export const CONQUISTAS: Definicao[] = [
  {
    id: "porta-aberta",
    nome: "Porta aberta",
    criterio: "Visitar a primeira Sala",
    feito: "Visitou a primeira Sala.",
    icone: "salas",
    medir: (p) => ({ atual: Math.min(1, p.salasVisitadas.length), alvo: 1 }),
  },
  {
    id: "cinco-salas",
    nome: "Cinco Salas",
    criterio: "Visitar as cinco Salas",
    feito: "Visitou as cinco Salas.",
    icone: "grade",
    medir: (p, ctx) => ({ atual: Math.min(ctx.totalSalas, p.salasVisitadas.length), alvo: ctx.totalSalas }),
  },
  {
    id: "lado-a-lado",
    nome: "Lado a lado",
    criterio: "Comparar um tema entre as Salas",
    feito: "Fez a primeira comparação de tema.",
    icone: "comparar",
    medir: (p) => ({ atual: Math.min(1, p.temasComparados.length), alvo: 1 }),
  },
  {
    id: "na-fonte",
    nome: "Na fonte",
    criterio: "Ler 3 fontes primárias",
    feito: "Leu 3 fontes primárias.",
    icone: "fontePrimaria",
    medir: (p, ctx) => ({ atual: Math.min(3, lidasDoTipo(p, ctx, "fonte-primaria")), alvo: 3 }),
  },
  {
    id: "vocabulario",
    nome: "Vocabulário",
    criterio: "Abrir 10 verbetes do glossário",
    feito: "Abriu 10 verbetes do glossário.",
    icone: "glossario",
    medir: (p) => ({ atual: Math.min(10, p.verbetesAbertos.length), alvo: 10 }),
  },
  {
    id: "com-as-fontes",
    nome: "Com as fontes",
    criterio: "Conferir as fontes de uma resposta do assistente",
    feito: "Conferiu as fontes de uma resposta do assistente.",
    icone: "curado",
    medir: (p) => ({ atual: Math.min(1, p.fontesConferidas), alvo: 1 }),
  },
  {
    id: "degrau-iii",
    nome: "Degrau III",
    criterio: "Chegar ao Avançado em um assunto",
    feito: "Chegou ao Avançado em um assunto.",
    icone: "trilha",
    medir: (p, ctx) => ({ atual: algumAssuntoAvancado(p, ctx) ? 1 : 0, alvo: 1 }),
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
  /** Progresso parcial quando a meta tem mais de um passo. */
  parcial?: { atual: number; alvo: number };
}

export function avaliarConquistas(p: ProgressoEstudo, ctx: Contexto): EstadoConquista[] {
  return CONQUISTAS.map((d) => {
    const m = d.medir(p, ctx);
    const em = p.conquistas[d.id];
    const obtida = Boolean(em) || m.atual >= m.alvo;
    return {
      id: d.id,
      nome: d.nome,
      criterio: d.criterio,
      feito: d.feito,
      icone: d.icone,
      obtida,
      ...(em ? { em } : {}),
      ...(!obtida && m.alvo > 1 ? { parcial: m } : {}),
    };
  });
}

/** Conquistas que o progresso já cumpre e ainda não foram registradas. */
export function conquistasNovas(p: ProgressoEstudo, ctx: Contexto): ConquistaId[] {
  return CONQUISTAS.filter((d) => !p.conquistas[d.id] && d.medir(p, ctx).atual >= d.medir(p, ctx).alvo).map(
    (d) => d.id,
  );
}

export const nomeConquista = (id: ConquistaId) => CONQUISTAS.find((c) => c.id === id)?.nome ?? id;
