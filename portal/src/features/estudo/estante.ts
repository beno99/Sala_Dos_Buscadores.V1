import type { ItemEstante } from "./tipos";

/* Regras puras da Estante: salvar e tirar Salas, conteúdos e vídeos. */

export type TipoEstante = ItemEstante["tipo"];

export const TIPOS_ESTANTE: readonly TipoEstante[] = ["sala", "conteudo", "video"];

/** Chave única de um item ("sala:urantia", "conteudo:caibalion/slug", "video:v-poimandres"). */
export const chaveEstante = (tipo: TipoEstante, ref: string) => `${tipo}:${ref}`;

/** Salva o item (no topo, o mais recente primeiro) ou o tira, se já estava salvo. Não altera a lista recebida. */
export function alternarItem(
  estante: readonly ItemEstante[],
  tipo: TipoEstante,
  ref: string,
  agora: string,
): { estante: ItemEstante[]; salvo: boolean } {
  const ja = estante.some((e) => e.tipo === tipo && e.ref === ref);
  if (ja) return { estante: estante.filter((e) => !(e.tipo === tipo && e.ref === ref)), salvo: false };
  return { estante: [{ tipo, ref, em: agora }, ...estante], salvo: true };
}

export function contarEstante(estante: readonly ItemEstante[]): Record<"todos" | TipoEstante, number> {
  const conta = { todos: estante.length, sala: 0, conteudo: 0, video: 0 };
  for (const e of estante) conta[e.tipo] += 1;
  return conta;
}
