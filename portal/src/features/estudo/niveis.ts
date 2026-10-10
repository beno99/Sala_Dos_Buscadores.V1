import type { Nivel, SalaSlug, TemaSlug } from "@/data/types";
import type { ItemAcervo, Leitura, ProgressoEstudo } from "./tipos";

/*
 * Níveis de conhecimento por assunto (Sala ou tema), na escala do Selo de
 * nível. Regra simples e transparente, explicada no Modal "Como os níveis
 * funcionam": Iniciante ao começar; Intermediário com metade dos conteúdos do
 * assunto lidos (arredondada para cima); Avançado com todos. Mede só o estudo
 * no acervo, nunca crença ou espiritualidade. Sem pontos.
 */

export type Assunto = { tipo: "sala"; sala: SalaSlug } | { tipo: "tema"; tema: TemaSlug };

export interface NivelAssunto {
  nivel: Nivel;
  lidas: number;
  total: number;
  proximo: Nivel | null;
  faltam: number;
  /** Preenchimento de cada degrau, de 0 a 1. */
  degraus: [number, number, number];
}

export const NOME_NIVEL: Record<Nivel, string> = { 1: "Iniciante", 2: "Intermediário", 3: "Avançado" };

export function limitesDoAssunto(total: number) {
  return { intermediario: Math.max(1, Math.ceil(total / 2)), avancado: Math.max(1, total) };
}

export function calcularNivel(lidas: number, total: number): NivelAssunto {
  if (total === 0) return { nivel: 1, lidas: 0, total: 0, proximo: null, faltam: 0, degraus: [1, 0, 0] };
  const { intermediario, avancado } = limitesDoAssunto(total);
  const nivel: Nivel = lidas >= avancado ? 3 : lidas >= intermediario ? 2 : 1;
  const proximo: Nivel | null = nivel === 3 ? null : ((nivel + 1) as Nivel);
  const faltam = proximo === 2 ? intermediario - lidas : proximo === 3 ? avancado - lidas : 0;
  const segundo = Math.min(1, lidas / intermediario);
  const terceiro =
    lidas >= intermediario ? Math.min(1, (lidas - intermediario) / Math.max(1, avancado - intermediario)) : 0;
  return { nivel, lidas, total, proximo, faltam, degraus: [1, segundo, terceiro] };
}

const concluida = (l: Leitura) => Boolean(l.concluidaEm);

function noAssunto(assunto: Assunto, c: { sala: SalaSlug; temas: TemaSlug[] }) {
  return assunto.tipo === "sala" ? c.sala === assunto.sala : c.temas.includes(assunto.tema);
}

export function nivelNoAssunto(assunto: Assunto, acervo: ItemAcervo[], leituras: Leitura[]): NivelAssunto {
  const doAssunto = acervo.filter((c) => noAssunto(assunto, c));
  const lidas = doAssunto.filter((c) =>
    leituras.some((l) => concluida(l) && l.sala === c.sala && l.slug === c.slug),
  ).length;
  return calcularNivel(lidas, doAssunto.length);
}

export function textoQuantoFalta(n: NivelAssunto): string {
  if (n.proximo === null)
    return n.total === 0 ? "Ainda sem conteúdos neste assunto" : "Chegou ao Avançado neste assunto";
  const leituras = n.faltam === 1 ? "leitura" : "leituras";
  return `${n.faltam === 1 ? "Falta" : "Faltam"} ${n.faltam} ${leituras} para ${NOME_NIVEL[n.proximo]}`;
}

/** Assunto em foco: a Sala da leitura mais recente; sem leituras, o primeiro interesse declarado. */
export function assuntoEmFoco(
  progresso: ProgressoEstudo,
  interesses: { temas: TemaSlug[]; salas: SalaSlug[] },
): Assunto | null {
  const recente = [...progresso.leituras].sort((a, b) => b.atualizadaEm.localeCompare(a.atualizadaEm))[0];
  if (recente) return { tipo: "sala", sala: recente.sala };
  if (interesses.salas[0]) return { tipo: "sala", sala: interesses.salas[0] };
  if (interesses.temas[0]) return { tipo: "tema", tema: interesses.temas[0] };
  return null;
}
