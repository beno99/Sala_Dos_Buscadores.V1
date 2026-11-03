import type { IconName } from "@/components/ds/Icon";
import { formatarData } from "@/lib/texto";
import { type CodigoGema, type ContextoJornada, estadoDasGemas, GEMAS } from "../jornada/regras";
import type { ProgressoEstudo } from "./tipos";

/*
 * Gemas da Jornada no formato dos cards de Conquista (mesma arte de antes).
 * Nomes e critérios vêm da especificação da Jornada (features/jornada/regras.ts).
 */

const ICONE: Record<CodigoGema, IconName> = {
  citrino: "biblioteca",
  esmeralda: "relogio",
  "cristal-de-rocha": "fontePrimaria",
  safira: "trilha",
  turmalina: "comparar",
  opala: "salas",
  ametista: "editar",
  rubi: "comunidade",
};

export interface EstadoConquista {
  id: CodigoGema;
  nome: string;
  criterio: string;
  feito: string;
  icone: IconName;
  obtida: boolean;
  em?: string;
  disponibilidade?: "em-breve";
  indisponibilidade?: string;
  parcial?: { atual: number; alvo: number };
  modalidade: string;
}

export function avaliarConquistas(p: ProgressoEstudo, ctx: ContextoJornada): EstadoConquista[] {
  return estadoDasGemas(p, ctx).map((g) => {
    const principal = g.progresso?.find((m) => m.atual < m.alvo) ?? g.progresso?.[0];
    return {
      id: g.codigo,
      nome: g.nome,
      modalidade: g.modalidade,
      criterio: g.criterio,
      feito: g.em ? `${g.criterio} Conquistada em ${formatarData(g.em.slice(0, 10))}.` : g.criterio,
      icone: ICONE[g.codigo],
      obtida: g.estado === "conquistada",
      ...(g.em ? { em: g.em } : {}),
      ...(g.estado === "em-preparacao"
        ? { disponibilidade: "em-breve" as const, indisponibilidade: g.emPreparacao }
        : {}),
      ...(g.estado !== "conquistada" && principal && principal.alvo > 1
        ? { parcial: { atual: principal.atual, alvo: principal.alvo } }
        : {}),
    };
  });
}

export const nomeConquista = (id: string) => GEMAS.find((g) => g.codigo === id)?.nome ?? id;
