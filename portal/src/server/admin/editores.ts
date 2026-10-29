import "server-only";
import type { SalaEditorial } from "@/data/types";
import { salasOficiaisAtivas } from "./salas";

/* Dados que os editores de artigo e vídeo recebem dentro da Sala. */

export const salaDoItem = (s: SalaEditorial) => ({ slug: s.slug, nome: s.nome, placa: s.placa });

/** Outras Salas oficiais ativas, para "Mover para outra Sala". */
export const destinosDe = (s: SalaEditorial) => salasOficiaisAtivas().filter((d) => d.slug !== s.slug);
