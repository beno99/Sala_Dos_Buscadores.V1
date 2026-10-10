import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListaHistorico } from "@/components/ds/Curadoria";
import { artigoParaForm } from "@/features/admin/formularios";
import { EditorArtigo } from "@/features/admin/ui/EditorArtigo";
import { historicoDoItem, listarFontes, obterArtigo } from "@/server/admin/consultas";

export async function generateMetadata(props: PageProps<"/admin/artigos/[id]">): Promise<Metadata> {
  const item = obterArtigo((await props.params).id);
  return { title: item ? `Editar: ${item.artigo.titulo || "sem título"}` : "Artigo" };
}

export default async function EditarArtigo(props: PageProps<"/admin/artigos/[id]">) {
  const { id } = await props.params;
  const item = obterArtigo(id);
  if (!item) notFound();
  const { artigo, citacao } = item;
  return (
    <EditorArtigo
      key={`${artigo.id}-${artigo.status}`}
      inicial={artigoParaForm(artigo, citacao)}
      status={artigo.status}
      atualizadoEm={artigo.atualizadoEm}
      slugTravado={Boolean(artigo.publicadoEm)}
      fontes={listarFontes()}
      historico={<ListaHistorico registros={historicoDoItem(id)} mostrarItem={false} />}
    />
  );
}
