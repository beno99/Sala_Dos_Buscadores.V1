import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { corpoParaForm } from "@/data/corpo";
import { obterConteudo } from "@/data/repositorio";
import { EditorArtigoAnfitriao } from "@/features/anfitriao/ui/EditorArtigoAnfitriao";
import { MarcarVisto } from "@/features/anfitriao/ui/MarcarVisto";
import { artigoDoAnfitriao } from "@/server/anfitriao/consultas";
import { dadosDoEditorDeArtigo } from "@/server/anfitriao/editor";
import { anfitriaoDaPagina, ouNaoEncontrado } from "@/server/anfitriao/pagina";

export const metadata: Metadata = { title: "Artigo" };

/** O artigo do anfitrião; de outra pessoa (ou inexistente) é 404. */
export default async function PaginaArtigo(props: PageProps<"/anfitriao/artigos/[id]">) {
  const { id } = await props.params;
  const membro = await anfitriaoDaPagina();
  const { artigo, sala } = ouNaoEncontrado(() => artigoDoAnfitriao(id, membro.id));
  if (!sala) notFound();
  const dados = dadosDoEditorDeArtigo(sala, membro.id, membro.pseudonimo);
  const revisao = artigo.revisao;
  const noAr = (await obterConteudo(artigo.sala, artigo.slug))
    ? `/salas/${artigo.sala}/${artigo.slug}`
    : undefined;
  const imagem = (midia: string | undefined, url: string | undefined) =>
    midia && url ? { id: midia, url } : null;
  return (
    <>
      <MarcarVisto tipo="artigo" id={artigo.id} pendente={Boolean(revisao?.decisoes.some((d) => !d.vista))} />
      <EditorArtigoAnfitriao
        key={`${artigo.id}-${artigo.status}`}
        inicial={{
          id: artigo.id,
          salaId: sala.id,
          titulo: artigo.titulo,
          corpo: corpoParaForm(artigo.corpo),
          temas: artigo.temas,
          fontes: artigo.fontes,
          nivel: artigo.nivel,
          link: artigo.link?.url ?? "",
          imagemCard: artigo.midias?.card ?? null,
          thumb: artigo.midias?.thumb ?? null,
        }}
        status={artigo.status}
        atualizadoEm={artigo.atualizadoEm}
        jaPublicado={Boolean(revisao?.jaPublicado)}
        congelado={Boolean(revisao?.congelado)}
        ultimoMotivo={revisao?.ultimoMotivo}
        sala={dados.sala}
        assinatura={artigo.anfitriao ?? dados.assinaturaPadrao}
        fontes={dados.fontes}
        publicados={dados.publicados}
        imagens={{
          card: imagem(artigo.midias?.card, artigo.imagem),
          thumb: imagem(artigo.midias?.thumb, artigo.thumb),
        }}
        publicadoEm={artigo.publicadoEm}
        slug={artigo.slug}
        noAr={noAr}
      />
    </>
  );
}
