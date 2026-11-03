import type { Metadata } from "next";
import { MarcarVisto } from "@/features/anfitriao/ui/MarcarVisto";
import { EditorAnuncio } from "@/features/publicidade/ui/EditorAnuncio";
import { anuncioParaForm } from "@/server/anfitriao/anuncios";
import { anfitriaoDaPagina, ouNaoEncontrado } from "@/server/anfitriao/pagina";
import { anuncioDoDono } from "@/server/sessao";

export const metadata: Metadata = { title: "Anúncio" };

export default async function EditarPublicidade(props: PageProps<"/anfitriao/publicidade/[id]">) {
  const { id } = await props.params;
  const membro = await anfitriaoDaPagina();
  const anuncio = structuredClone(ouNaoEncontrado(() => anuncioDoDono(id, membro.id)));
  return (
    <>
      <MarcarVisto tipo="anuncio" id={anuncio.id} pendente={anuncio.revisao.decisoes.some((d) => !d.vista)} />
      <EditorAnuncio
        key={anuncio.atualizadoEm}
        inicial={anuncioParaForm(anuncio)}
        imagemInicial={anuncio.midia && anuncio.imagem ? { id: anuncio.midia, url: anuncio.imagem } : null}
        status={anuncio.status}
        atualizadoEm={anuncio.atualizadoEm}
        jaPublicado={anuncio.revisao.jaPublicado}
        congelado={Boolean(anuncio.revisao.congelado)}
        motivo={anuncio.revisao.ultimoMotivo}
      />
    </>
  );
}
