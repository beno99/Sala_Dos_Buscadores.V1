import type { Metadata, Route } from "next";
import { Alerta } from "@/components/ds/Alerta";
import { ButtonLink } from "@/components/ds/Button";
import { videoParaForm } from "@/features/admin/formularios";
import { filtrarVideos, lerFiltrosVideos, paginar } from "@/features/admin/listas";
import { checklistVideo } from "@/features/admin/regras/checklist";
import { ITENS_POR_PAGINA } from "@/features/admin/regras/config";
import { ListaVideos } from "@/features/admin/ui/ListaVideos";
import { CabecalhoSalaAdmin } from "@/features/admin/ui/salas/CabecalhoSalaAdmin";
import { listarArtigos, listarVideos } from "@/server/admin/consultas";
import { cabecalhoDaSala } from "@/server/admin/paginaSala";

export async function generateMetadata(props: PageProps<"/admin/salas/[slug]/videos">): Promise<Metadata> {
  return { title: `Vídeos da Sala: ${(await props.params).slug}` };
}

/** Página da Sala oficial (§5), aba Vídeos: vídeos da Sala e a que artigos se ligam. */
export default async function VideosDaSalaAdmin(props: PageProps<"/admin/salas/[slug]/videos">) {
  const { slug } = await props.params;
  const { sala, cabecalho } = cabecalhoDaSala(slug);
  const filtros = { ...lerFiltrosVideos(await props.searchParams), sala: sala.slug };
  const filtrados = filtrarVideos(listarVideos(), filtros);
  const { itens, pagina, totalPaginas } = paginar(filtrados, filtros.pagina, ITENS_POR_PAGINA);
  const titulos = Object.fromEntries(
    listarArtigos()
      .filter((a) => a.sala === sala.slug)
      .map((a) => [a.id, a.titulo || "Sem título"]),
  );
  const arquivada = sala.status === "arquivado";
  return (
    <CabecalhoSalaAdmin {...cabecalho} aba="videos">
      <div className="flex flex-col gap-5">
        {arquivada ? (
          <Alerta title="Sala arquivada">Restaure a Sala para criar ou editar vídeos nela.</Alerta>
        ) : (
          <div>
            <ButtonLink href={`/admin/salas/${sala.slug}/videos/novo` as Route} variant="primary" icon="mais">
              Novo vídeo
            </ButtonLink>
          </div>
        )}
        <ListaVideos
          itens={itens.map((v) => ({
            ...v,
            pendencias: checklistVideo(videoParaForm(v)).filter((i) => i.estado === "pendente").length,
          }))}
          total={filtrados.length}
          pagina={pagina}
          totalPaginas={totalPaginas}
          filtros={{ ...filtros, sala: "", pagina }}
          sala={{ slug: sala.slug, nome: sala.nome }}
          titulosDosArtigos={titulos}
        />
      </div>
    </CabecalhoSalaAdmin>
  );
}
