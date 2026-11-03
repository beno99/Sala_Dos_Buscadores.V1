import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarcarVisto } from "@/features/anfitriao/ui/MarcarVisto";
import { EditorAnuncio } from "@/features/anuncios/EditorAnuncio";
import { revisaoDoAnuncio } from "@/features/anuncios/regras";
import { anfitriaoDaPagina } from "@/server/anfitriao/pagina";
import { anuncioDoDono } from "@/server/anuncios";
import { urlDaMidia } from "@/server/midia";

export const metadata: Metadata = { title: "Editar publicidade" };

/** Anúncio de outra conta (ou inexistente) é 404. */
export default async function EditarPublicidade(props: PageProps<"/anfitriao/publicidade/[id]">) {
  const { id } = await props.params;
  const membro = await anfitriaoDaPagina();
  const a = anuncioDoDono(id, membro.id);
  if (!a) notFound();
  const revisao = revisaoDoAnuncio(a);
  return (
    <>
      <MarcarVisto tipo="anuncio" id={a.id} pendente={revisao.decisoes.some((d) => !d.vista)} />
      <EditorAnuncio
        key={a.atualizadoEm}
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
        atualizadoEm={a.atualizadoEm}
        jaPublicado={revisao.jaPublicado || Boolean(a.publicadoEm)}
        congelado={Boolean(revisao.congelado)}
        motivo={revisao.ultimoMotivo}
      />
    </>
  );
}
