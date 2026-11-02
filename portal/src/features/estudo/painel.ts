import type { SalaSlug, TemaSlug } from "@/data/types";
import { chaveLeitura, type ItemAcervo, type Leitura, type ProgressoEstudo } from "./tipos";

/* Indicadores do Portal: só progresso pessoal e privado, nunca comparação entre pessoas. */

export interface ResumoPainel {
  salas: { visitadas: number; total: number };
  lidos: { total: number; fontesPrimarias: number };
  temas: { total: number; slugs: TemaSlug[] };
  trilhas: { emAndamento: number; salas: SalaSlug[] };
}

/** O histórico é preservado; somente Salas atualmente elegíveis entram no indicador. */
export function resumirVisitas(historico: readonly string[], elegiveis: readonly string[]) {
  const universo = [...new Set(elegiveis)];
  const registradas = new Set(historico);
  return {
    visitadas: universo.filter((slug) => registradas.has(slug)),
    faltantes: universo.filter((slug) => !registradas.has(slug)),
    total: universo.length,
  };
}

export function resumoDoPainel(
  p: ProgressoEstudo,
  acervo: ItemAcervo[],
  salasElegiveis: string[],
): ResumoPainel {
  const visitas = resumirVisitas(p.salasVisitadas, salasElegiveis);
  const lidas = p.leituras.filter((l) => l.concluidaEm);
  const fontesPrimarias = lidas.filter((l) =>
    acervo.some((c) => c.sala === l.sala && c.slug === l.slug && c.tipo === "fonte-primaria"),
  ).length;
  const trilhas = (Object.entries(p.trilhas) as [SalaSlug, number][])
    .filter(([, n]) => n > 0)
    .map(([s]) => s);
  return {
    salas: { visitadas: visitas.visitadas.length, total: visitas.total },
    lidos: { total: lidas.length, fontesPrimarias },
    temas: { total: p.temasComparados.length, slugs: [...p.temasComparados] },
    trilhas: { emAndamento: trilhas.length, salas: trilhas },
  };
}

/** Leituras começadas e não terminadas, da mais recente para a mais antiga. */
export function leiturasEmAndamento(p: ProgressoEstudo): Leitura[] {
  return p.leituras
    .filter((l) => !l.concluidaEm && chaveLeitura(l.sala, l.slug) !== p.continuarDispensado)
    .sort((a, b) => b.atualizadaEm.localeCompare(a.atualizadaEm));
}

/** Última leitura concluída: para quem já leu tudo que começou, em vez de tratá-la como quem nunca leu nada. */
export function ultimaLeituraConcluida(p: ProgressoEstudo): Leitura | undefined {
  return p.leituras
    .filter((l) => l.concluidaEm)
    .sort((a, b) => (b.concluidaEm as string).localeCompare(a.concluidaEm as string))[0];
}
