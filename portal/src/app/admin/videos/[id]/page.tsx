import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListaHistorico } from "@/components/ds/Curadoria";
import { videoParaForm } from "@/features/admin/formularios";
import { EditorVideo } from "@/features/admin/ui/EditorVideo";
import { historicoDoItem, listarArtigos, obterVideo } from "@/server/admin/consultas";

export async function generateMetadata(props: PageProps<"/admin/videos/[id]">): Promise<Metadata> {
  const v = obterVideo((await props.params).id);
  return { title: v ? `Editar: ${v.titulo || "sem título"}` : "Vídeo" };
}

export default async function EditarVideo(props: PageProps<"/admin/videos/[id]">) {
  const { id } = await props.params;
  const video = obterVideo(id);
  if (!video) notFound();
  const artigos = listarArtigos().map(({ id: a, titulo, sala, status }) => ({ id: a, titulo, sala, status }));
  return (
    <EditorVideo
      key={`${video.id}-${video.status}`}
      inicial={videoParaForm(video)}
      status={video.status}
      atualizadoEm={video.atualizadoEm}
      artigos={artigos}
      historico={<ListaHistorico registros={historicoDoItem(id)} mostrarItem={false} />}
    />
  );
}
