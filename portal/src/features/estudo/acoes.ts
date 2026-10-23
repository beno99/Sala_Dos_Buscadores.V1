"use server";

import { salaPorSlug } from "@/data/catalogo";
import { acervoDeEstudo, acervoPublico } from "@/data/repositorio";
import {
  alternarNaEstante,
  dispensarContinuar,
  progressoDe,
  type ResultadoEvento,
  registrarEvento,
} from "@/server/progresso";
import { membroAtual } from "@/server/sessao";
import { TIPOS_ESTANTE, type TipoEstante } from "./estante";
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

/** Só entra na Estante o que está publicado: Sala visível, conteúdo ou vídeo no ar. */
function existe(tipo: TipoEstante, ref: string): boolean {
  if (tipo === "sala") return Boolean(salaPorSlug(ref));
  const publico = acervoPublico();
  if (tipo === "video") return publico.videos.some((v) => v.id === ref);
  return publico.conteudos.some((c) => `${c.sala}/${c.slug}` === ref);
}

/** Salva ou tira um item da Estante da própria conta. Sem sessão ou com item inexistente, nada muda. */
export async function alternarEstanteAcao(
  tipo: TipoEstante,
  ref: string,
): Promise<{ salvo: boolean } | null> {
  const membro = await membroAtual();
  if (!membro) return null;
  const t = String(tipo) as TipoEstante;
  const r = String(ref).slice(0, 200);
  if (!TIPOS_ESTANTE.includes(t) || !existe(t, r)) return null;
  return { salvo: alternarNaEstante(membro.email, t, r) };
}
