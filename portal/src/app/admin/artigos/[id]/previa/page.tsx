import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Alerta } from "@/components/ds/Alerta";
import { salaPorSlug } from "@/data/catalogo";
import { conteudoParaPublico, fontesPorId, resumirSala, videosDoConteudo } from "@/data/repositorio";
import { LeituraConteudo } from "@/features/acervo/LeituraConteudo";
import { STATUS_ROTULO } from "@/features/admin/regras/csv";
import { obterArtigo } from "@/server/admin/consultas";

export const metadata: Metadata = { title: "Pré-visualização" };

/** "Pré-visualizar como buscador": a página pública do conteúdo, com os mesmos componentes, em qualquer status. */
export default async function PreviaArtigo(props: PageProps<"/admin/artigos/[id]/previa">) {
  const { id } = await props.params;
  const item = obterArtigo(id);
  const sala = item ? salaPorSlug(item.artigo.sala) : undefined;
  if (!item || !sala) notFound();
  const conteudo = conteudoParaPublico(item.artigo);
  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-3 z-30">
        <Alerta variant="warning" title={`Pré-visualização · ${STATUS_ROTULO[item.artigo.status]}`}>
          É assim que o buscador vai ver este conteúdo
          {item.artigo.status === "publicado" ? "" : " quando for publicado"}. Esta página não é pública.
        </Alerta>
      </div>
      <LeituraConteudo
        sala={resumirSala(sala)}
        conteudo={{ ...conteudo, publicadoEm: conteudo.publicadoEm || new Date().toISOString().slice(0, 10) }}
        citacao={item.citacao}
        fontes={fontesPorId(conteudo.fontes)}
        videos={videosDoConteudo(sala.slug, conteudo.slug)}
      />
    </div>
  );
}
