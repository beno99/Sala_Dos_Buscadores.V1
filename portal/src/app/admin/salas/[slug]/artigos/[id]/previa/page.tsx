import type { Metadata, Route } from "next";
import { notFound, redirect } from "next/navigation";
import { Alerta } from "@/components/ds/Alerta";
import {
  conteudoParaPublico,
  fontesPorId,
  relacionadosDoConteudo,
  resumirSala,
  videosDoConteudo,
} from "@/data/repositorio";
import { LeituraConteudo } from "@/features/acervo/LeituraConteudo";
import { STATUS_ROTULO } from "@/features/admin/regras/csv";
import { obterArtigo } from "@/server/admin/consultas";
import { rotaDoArtigo, salaOficialDaRota } from "@/server/admin/rotas";
import { imagemDoCard } from "@/server/imagens";
import { salaParaPublico } from "@/server/store";

export const metadata: Metadata = { title: "Pré-visualização" };

/** "Pré-visualizar como buscador": a página pública do conteúdo, em qualquer status, dentro da Sala. */
export default async function PreviaNaSala(props: PageProps<"/admin/salas/[slug]/artigos/[id]/previa">) {
  const { slug, id } = await props.params;
  const item = obterArtigo(id);
  if (!item) notFound();
  if (item.artigo.sala !== slug || item.artigo.revisao) {
    const rota = rotaDoArtigo(id, true);
    if (!rota) notFound();
    redirect(rota as Route);
  }
  const sala = salaOficialDaRota(slug);
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
        sala={resumirSala(salaParaPublico(sala))}
        conteudo={{ ...conteudo, publicadoEm: conteudo.publicadoEm || new Date().toISOString().slice(0, 10) }}
        citacao={item.citacao}
        fontes={fontesPorId(conteudo.fontes)}
        videos={videosDoConteudo(sala.slug, conteudo.slug)}
        relacionados={relacionadosDoConteudo(conteudo)}
        imagemCard={imagemDoCard(conteudo)}
      />
    </div>
  );
}
