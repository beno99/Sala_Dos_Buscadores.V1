import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditorPublicidade } from "@/features/publicidade/EditorPublicidade";
import { obterDoDono } from "@/modules/publicidade/publicidade.repositorio";
import { anfitriaoDaPagina } from "@/server/anfitriao/pagina";
export const metadata: Metadata = { title: "Editar publicidade" };
export default async function EditarPublicidade({ params }: { params: Promise<{ id: string }> }) {
  const membro = await anfitriaoDaPagina();
  const { id } = await params;
  const anuncio = await obterDoDono(id, membro.id);
  if (!anuncio) notFound();
  return <EditorPublicidade inicial={anuncio} nomeAnunciante={anuncio.anunciante} />;
}
