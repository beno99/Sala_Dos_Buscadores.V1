import type { OrigemSala, Sala, StatusEditorial } from "@/data/types";

/*
 * Quando uma Sala aparece para o público (anfitriões §4.2; curadoria a partir
 * da Sala §4). A regra é calculada, nunca guardada, e vale para Salas oficiais
 * e de anfitriões: a Sala aparece se, e somente se, está publicada e tem pelo
 * menos um artigo publicado. Se o último artigo sai do ar, a Sala some junto,
 * sem perder o próprio status.
 */

export interface SalaParaVisibilidade {
  slug: string;
  origem: OrigemSala;
  status: StatusEditorial;
}

export interface ArtigoParaVisibilidade {
  sala: string;
  status: StatusEditorial;
}

export function salaVisivel(sala: SalaParaVisibilidade, artigos: Iterable<ArtigoParaVisibilidade>): boolean {
  if (sala.status !== "publicado") return false;
  for (const a of artigos) if (a.sala === sala.slug && a.status === "publicado") return true;
  return false;
}

/** Ordem pública: oficiais primeiro, depois as de anfitriões; cada grupo pelo nome. */
export function ordenarSalas<T extends Pick<Sala, "nome" | "origem">>(salas: T[]): T[] {
  const peso = (s: T) => (s.origem === "oficial" ? 0 : 1);
  return [...salas].sort((a, b) => peso(a) - peso(b) || a.nome.localeCompare(b.nome, "pt-BR"));
}
