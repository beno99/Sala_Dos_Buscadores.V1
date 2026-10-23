import type { Conteudo } from "@/data/types";

/*
 * "Continuar a busca" na página do conteúdo: os publicados que têm ao menos
 * um tema em comum, sem o próprio. Primeiro os das outras Salas (é a proposta
 * da busca comparativa), depois os da mesma Sala; em cada grupo, mais temas
 * em comum primeiro e, em empate, o mais recente.
 */

export const LIMITE_RELACIONADOS = 8;

type Relacionavel = Pick<Conteudo, "sala" | "slug" | "temas" | "publicadoEm">;

export function escolherRelacionados<T extends Relacionavel>(
  alvo: Relacionavel,
  candidatos: readonly T[],
  limite = LIMITE_RELACIONADOS,
): T[] {
  const temas = new Set(alvo.temas);
  return candidatos
    .filter((c) => !(c.sala === alvo.sala && c.slug === alvo.slug))
    .map((c) => ({ c, comum: c.temas.filter((t) => temas.has(t)).length }))
    .filter(({ comum }) => comum > 0)
    .sort(
      (a, b) =>
        Number(a.c.sala === alvo.sala) - Number(b.c.sala === alvo.sala) ||
        b.comum - a.comum ||
        b.c.publicadoEm.localeCompare(a.c.publicadoEm),
    )
    .slice(0, limite)
    .map(({ c }) => c);
}
