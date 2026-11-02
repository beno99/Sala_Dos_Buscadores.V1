import "server-only";
import { todasAsSalas } from "@/data/catalogo";
import { salaNaLixeira } from "./salas/lixeira";
import { acervo } from "./store";

export type EscopoVinculo = "administrador" | "anfitriao";
export interface VideoSelecionavel {
  id: string;
  titulo: string;
  sala: string;
  status: string;
}

/** Relação única: VideoEditorial.artigos. O formulário do artigo é apenas uma projeção. */
export function idsVideosDoArtigo(artigoId: string): string[] {
  return [...acervo().videos.values()].filter((v) => v.artigos.includes(artigoId)).map((v) => v.id);
}
export function videosSelecionaveis(escopo: EscopoVinculo): VideoSelecionavel[] {
  const visiveis = new Set(todasAsSalas().map((s) => s.slug));
  return [...acervo().videos.values()]
    .filter(
      (v) =>
        !salaNaLixeira(v.sala) &&
        v.status !== "arquivado" &&
        (escopo === "administrador" || (v.status === "publicado" && visiveis.has(v.sala))),
    )
    .map(({ id, titulo, sala, status }) => ({ id, titulo, sala, status }));
}
export function erroVideosDoArtigo(
  artigoId: string | null,
  ids: unknown,
  escopo: EscopoVinculo,
): string | undefined {
  if (ids === undefined) return;
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string"))
    return "A seleção de vídeos é inválida.";
  const permitidos = new Set(videosSelecionaveis(escopo).map((v) => v.id));
  const anteriores = new Set(artigoId ? idsVideosDoArtigo(artigoId) : []);
  if (ids.some((id) => !permitidos.has(id) && !anteriores.has(id)))
    return "Um vídeo não está disponível para associação. Atualize a página.";
}
