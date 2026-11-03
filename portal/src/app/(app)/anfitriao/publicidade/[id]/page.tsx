import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditorAnuncio } from "@/features/anuncios/EditorAnuncio";
import { anfitriaoDaPagina } from "@/server/anfitriao/pagina";
import { anuncioDoDono } from "@/server/anuncios";
import { urlDaMidia } from "@/server/midia";

export const metadata: Metadata = { title: "Editar publicidade" };

/** Anúncio de outra conta (ou inexistente) é 404. */
export default async function PaginaEditarPublicidade(props: PageProps<"/anfitriao/publicidade/[id]">) {
  const { id } = await props.params;
  const membro = await anfitriaoDaPagina();
  const a = anuncioDoDono(id, membro.id);
  if (!a) notFound();
  return (
    <EditorAnuncio
      key={`${a.id}-${a.atualizadoEm}`}
      inicial={{
        id: a.id,
        midia: a.midia,
        focoX: a.focoX,
        focoY: a.focoY,
        alt: a.alt,
        categoria: a.categoria,
        titulo: a.titulo,
        descricao: a.descricao,
        href: a.href,
        chamada: a.chamada,
        anunciante: a.anunciante,
      }}
      imagem={a.midia ? { id: a.midia, url: urlDaMidia(a.midia) } : null}
      status={a.status}
    />
  );
}
