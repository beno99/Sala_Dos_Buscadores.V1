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
  opala: "salas",
  agata: "artigo",
  jaspe: "trilha",
  "quartzo-rosa": "regenerar",
  fluorita: "comparar",
  "lapis-lazuli": "estante",
  amazonita: "salas",
  granada: "biblioteca",
  "pedra-da-lua": "relogio",
  topazio: "trilha",
  alexandrita: "salas",
  benitoita: "salas",
  espinelio: "relogio",
  demantoide: "relogio",
  paraiba: "salas",
  "rubi-estrela": "artigo",
  padparadscha: "salas",
  "diamante-rosa": "trilha",
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
    const principal = g.progresso.find((m) => m.atual < m.alvo) ?? g.progresso[0];
    return {
      id: g.codigo,
      nome: g.nome,
      modalidade: g.modalidade,
      criterio:
        g.estado === "conquistada"
          ? g.criterio
          : `${g.criterio} ${g.progresso.map((r) => `${r.rotulo}: ${r.atual}/${r.alvo}`).join(" · ")}.`,
      feito: g.em ? `${g.criterio} Conquistada em ${formatarData(g.em.slice(0, 10))}.` : g.criterio,
      icone: ICONE[g.codigo],
      obtida: g.estado === "conquistada",
      ...(g.em ? { em: g.em } : {}),
      ...(g.estado !== "conquistada" && principal
        ? { parcial: { atual: principal.atual, alvo: principal.alvo } }
        : {}),
    };
  });
}

export const nomeConquista = (id: string) => GEMAS.find((g) => g.codigo === id)?.nome ?? id;
