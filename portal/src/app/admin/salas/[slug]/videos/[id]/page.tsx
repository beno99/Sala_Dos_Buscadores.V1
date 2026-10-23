import type { Metadata, Route } from "next";
import { notFound, redirect } from "next/navigation";
import { ListaHistorico } from "@/components/ds/Curadoria";
import { videoParaForm } from "@/features/admin/formularios";
import { EditorVideo } from "@/features/admin/ui/EditorVideo";
import { historicoDoItem, listarArtigos, obterVideo } from "@/server/admin/consultas";
import { salaDoItem } from "@/server/admin/editores";
import { rotaDoVideo, salaOficialDaRota } from "@/server/admin/rotas";

export async function generateMetadata(
  props: PageProps<"/admin/salas/[slug]/videos/[id]">,
): Promise<Metadata> {
  const v = obterVideo((await props.params).id);
  return { title: v ? `Editar: ${v.titulo || "sem título"}` : "Vídeo" };
}

export default async function EditarVideoNaSala(props: PageProps<"/admin/salas/[slug]/videos/[id]">) {
  const { slug, id } = await props.params;
  const video = obterVideo(id);
  if (!video) notFound();
  if (video.sala !== slug) redirect((rotaDoVideo(id) ?? "/admin/salas") as Route);
  const sala = salaOficialDaRota(slug);
  const artigos = listarArtigos()
    .filter((a) => a.sala === sala.slug)
    .map(({ id: a, titulo, sala: s, status }) => ({ id: a, titulo, sala: s, status }));
  return (
    <EditorVideo
      key={`${video.id}-${video.status}`}
      inicial={videoParaForm(video)}
      status={video.status}
      atualizadoEm={video.atualizadoEm}
      artigos={artigos}
      sala={salaDoItem(sala)}
      historico={<ListaHistorico registros={historicoDoItem(id)} mostrarItem={false} />}
    />
  );
}
