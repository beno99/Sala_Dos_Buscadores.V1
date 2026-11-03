import type { Metadata } from "next";
import { videoParaForm } from "@/features/admin/formularios";
import { EditorVideoAnfitriao } from "@/features/anfitriao/ui/EditorVideoAnfitriao";
import { MarcarVisto } from "@/features/anfitriao/ui/MarcarVisto";
import { salasParaCriar } from "@/server/anfitriao/consultas";
import { anfitriaoDaPagina, ouNaoEncontrado } from "@/server/anfitriao/pagina";
import { artigosLigaveisDoAnfitriao } from "@/server/anfitriao/videos";
import { videoDoDono } from "@/server/sessao";

export const metadata: Metadata = { title: "Vídeo" };

export default async function EditarVideo(props: PageProps<"/anfitriao/videos/[id]">) {
  const { id } = await props.params;
  const membro = await anfitriaoDaPagina();
  const video = structuredClone(ouNaoEncontrado(() => videoDoDono(id, membro.id)));
  const salas = salasParaCriar(membro.id);
  const daSala = salas.some((s) => s.slug === video.sala);
  return (
    <>
      <MarcarVisto
        tipo="video"
        id={video.id}
        pendente={Boolean(video.revisao?.decisoes.some((d) => !d.vista))}
      />
      <EditorVideoAnfitriao
        key={video.atualizadoEm}
        inicial={{ ...videoParaForm(video), versaoEsperada: video.atualizadoEm }}
        status={video.status}
        atualizadoEm={video.atualizadoEm}
        salas={daSala ? salas : [...salas, { slug: video.sala, nome: video.sala }]}
        artigos={artigosLigaveisDoAnfitriao(membro.id)}
        jaPublicado={Boolean(video.revisao?.jaPublicado)}
        congelado={Boolean(video.revisao?.congelado)}
        motivo={video.revisao?.ultimoMotivo}
      />
    </>
  );
}
