import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";
import { videoVazio } from "@/features/admin/formularios";
import { EditorVideo } from "@/features/admin/ui/EditorVideo";
import { listarArtigos } from "@/server/admin/consultas";
import { salaDoItem } from "@/server/admin/editores";
import { salaOficialDaRota } from "@/server/admin/rotas";

export const metadata: Metadata = { title: "Novo vídeo" };

/**
 * O vídeo nasce dentro da Sala; aberto por "Novo vídeo neste artigo"
 * (?artigo=), já chega ligado ao artigo.
 */
export default async function NovoVideoNaSala(props: PageProps<"/admin/salas/[slug]/videos/novo">) {
  const sala = salaOficialDaRota((await props.params).slug);
  if (sala.status === "arquivado") redirect(`/admin/salas/${sala.slug}/videos` as Route);
  const { artigo } = await props.searchParams;
  const artigos = listarArtigos()
    .filter((a) => a.sala === sala.slug)
    .map(({ id, titulo, sala: s, status }) => ({ id, titulo, sala: s, status }));
  const ligado = typeof artigo === "string" && artigos.some((a) => a.id === artigo) ? [artigo] : [];
  return (
    <EditorVideo
      inicial={{ ...videoVazio(), sala: sala.slug, artigos: ligado }}
      status="rascunho"
      atualizadoEm={null}
      artigos={artigos}
      sala={salaDoItem(sala)}
    />
  );
}
