import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListaHistorico } from "@/components/ds/Curadoria";
import { fonteParaForm } from "@/features/admin/formularios";
import { EditorFonte } from "@/features/admin/ui/EditorFonte";
import { historicoDoItem, obterFonte, usosDaFonte } from "@/server/admin/consultas";

export async function generateMetadata(props: PageProps<"/admin/fontes/[id]">): Promise<Metadata> {
  const f = obterFonte((await props.params).id);
  return { title: f ? `Editar: ${f.titulo}` : "Fonte" };
}

export default async function EditarFonte(props: PageProps<"/admin/fontes/[id]">) {
  const { id } = await props.params;
  const fonte = obterFonte(id);
  if (!fonte) notFound();
  return (
    <EditorFonte
      key={`${fonte.id}-${fonte.atualizadoEm}`}
      inicial={fonteParaForm(fonte)}
      usos={usosDaFonte(id)}
      historico={<ListaHistorico registros={historicoDoItem(id)} mostrarItem={false} />}
    />
  );
}
