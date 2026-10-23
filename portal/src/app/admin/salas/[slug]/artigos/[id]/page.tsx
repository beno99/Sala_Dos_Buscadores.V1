import type { Metadata, Route } from "next";
import { notFound, redirect } from "next/navigation";
import { ListaHistorico } from "@/components/ds/Curadoria";
import { artigoParaForm } from "@/features/admin/formularios";
import { EditorArtigo } from "@/features/admin/ui/EditorArtigo";
import { historicoDoItem, listarFontes, obterArtigo } from "@/server/admin/consultas";
import { destinosDe, salaDoItem, videosDoArtigo } from "@/server/admin/editores";
import { rotaDoArtigo, salaOficialDaRota } from "@/server/admin/rotas";

export async function generateMetadata(
  props: PageProps<"/admin/salas/[slug]/artigos/[id]">,
): Promise<Metadata> {
  const item = obterArtigo((await props.params).id);
  return { title: item ? `Editar: ${item.artigo.titulo || "sem título"}` : "Artigo" };
}

export default async function EditarArtigoNaSala(props: PageProps<"/admin/salas/[slug]/artigos/[id]">) {
  const { slug, id } = await props.params;
  const item = obterArtigo(id);
  if (!item) notFound();
  // Endereço com a Sala errada (ou artigo de anfitrião): leva ao lugar certo.
  if (item.artigo.sala !== slug || item.artigo.revisao) {
    const rota = rotaDoArtigo(id);
    if (!rota) notFound();
    redirect(rota as Route);
  }
  const sala = salaOficialDaRota(slug);
  const { artigo, citacao } = item;
  return (
    <EditorArtigo
      key={`${artigo.id}-${artigo.status}`}
      inicial={artigoParaForm(artigo, citacao)}
      status={artigo.status}
      atualizadoEm={artigo.atualizadoEm}
      slugTravado={Boolean(artigo.publicadoEm)}
      fontes={listarFontes()}
      sala={salaDoItem(sala)}
      salasDestino={destinosDe(sala)}
      videos={videosDoArtigo(sala.slug, artigo.id)}
      historico={<ListaHistorico registros={historicoDoItem(id)} mostrarItem={false} />}
    />
  );
}
