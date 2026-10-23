import "server-only";
import type { SalaEditorial } from "@/data/types";
import { listarVideos } from "./consultas";
import { salasOficiaisAtivas } from "./salas";

/* Dados que os editores de artigo e vídeo recebem dentro da Sala. */

export const salaDoItem = (s: SalaEditorial) => ({ slug: s.slug, nome: s.nome, placa: s.placa });

/** Outras Salas oficiais ativas, para "Mover para outra Sala". */
export const destinosDe = (s: SalaEditorial) => salasOficiaisAtivas().filter((d) => d.slug !== s.slug);

/** Vídeos da Sala: os ligados ao artigo e os que ainda podem ser ligados. */
export function videosDoArtigo(salaSlug: string, artigoId: string) {
  const daSala = listarVideos().filter((v) => v.sala === salaSlug);
  const resumo = (v: (typeof daSala)[number]) => ({
    id: v.id,
    titulo: v.titulo,
    status: v.status,
    duracao: v.duracao,
  });
  return {
    ligados: daSala.filter((v) => v.artigos.includes(artigoId)).map(resumo),
    disponiveis: daSala.filter((v) => !v.artigos.includes(artigoId) && v.status !== "arquivado").map(resumo),
  };
}
