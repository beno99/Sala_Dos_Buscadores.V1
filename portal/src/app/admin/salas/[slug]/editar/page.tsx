import type { Metadata } from "next";
import { EditorSalaOficial } from "@/features/admin/ui/salas/EditorSalaOficial";
import { salaOficialDaRota } from "@/server/admin/rotas";
import { salaParaForm } from "@/server/admin/salas";

export async function generateMetadata(props: PageProps<"/admin/salas/[slug]/editar">): Promise<Metadata> {
  return { title: `Editar Sala: ${(await props.params).slug}` };
}

export default async function EditarSala(props: PageProps<"/admin/salas/[slug]/editar">) {
  const sala = salaOficialDaRota((await props.params).slug);
  return (
    <EditorSalaOficial
      key={`${sala.id}-${sala.status}`}
      inicial={salaParaForm(sala)}
      imagem={sala.midia && sala.imagem ? { id: sala.midia, url: sala.imagem } : null}
      status={sala.status}
      atualizadoEm={sala.atualizadoEm}
      slugTravado={Boolean(sala.publicadaEm)}
    />
  );
}
