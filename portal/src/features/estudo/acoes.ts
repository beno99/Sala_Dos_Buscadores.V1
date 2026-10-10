"use server";

import { acervoDeEstudo } from "@/data/repositorio";
import { dispensarContinuar, progressoDe, type ResultadoEvento, registrarEvento } from "@/server/progresso";
import { membroAtual } from "@/server/sessao";
import type { EventoEstudo } from "./tipos";

/* Eventos de estudo da própria conta. Sem sessão, nada é gravado. */

export async function registrarEstudoAcao(
  evento: EventoEstudo,
): Promise<(ResultadoEvento & { mostrarNiveis: boolean }) | null> {
  const membro = await membroAtual();
  if (!membro) return null;
  const r = registrarEvento(membro.email, evento, acervoDeEstudo());
  if (!r) return null;
  return { ...r, mostrarNiveis: progressoDe(membro.email).mostrarNiveis };
}

export async function dispensarContinuarAcao(chave: string): Promise<void> {
  const membro = await membroAtual();
  if (membro) dispensarContinuar(membro.email, String(chave).slice(0, 200));
}
