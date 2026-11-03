import type { Metadata } from "next";
import { videoVazio } from "@/features/admin/formularios";
import { EditorVideoAnfitriao } from "@/features/anfitriao/ui/EditorVideoAnfitriao";
import { salasParaCriar } from "@/server/anfitriao/consultas";
import { anfitriaoDaPagina } from "@/server/anfitriao/pagina";
import { artigosLigaveisDoAnfitriao } from "@/server/anfitriao/videos";

export const metadata: Metadata = { title: "Criar vídeo" };

/**
 * Novo vídeo. `?sala=` (slug) e `?artigo=` (id) chegam já escolhidos quando
 * a criação começa numa Sala ou num artigo do anfitrião.
 */
export default async function CriarVideo(props: PageProps<"/anfitriao/videos/novo">) {
  const membro = await anfitriaoDaPagina();
  const { sala, artigo } = await props.searchParams;
  const salas = salasParaCriar(membro.id);
  const artigos = artigosLigaveisDoAnfitriao(membro.id);
  const salaInicial =
    (typeof sala === "string" && salas.find((s) => s.slug === sala)?.slug) ||
    (salas.length === 1 ? salas[0]?.slug : "") ||
    "";
  const ligado = typeof artigo === "string" && artigos.some((a) => a.id === artigo && a.meu) ? [artigo] : [];
  return (
    <EditorVideoAnfitriao
      inicial={{
        ...videoVazio(),
        sala: salaInicial as ReturnType<typeof videoVazio>["sala"],
        artigos: ligado,
      }}
      status="rascunho"
      atualizadoEm={null}
      salas={salas}
      artigos={artigos}
      jaPublicado={false}
      congelado={false}
    />
  );
}
