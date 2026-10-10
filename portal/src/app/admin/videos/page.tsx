import type { Metadata, Route } from "next";
import { ButtonLink } from "@/components/ds/Button";
import { videoParaForm } from "@/features/admin/formularios";
import { filtrarVideos, lerFiltrosVideos, paginar } from "@/features/admin/listas";
import { checklistVideo } from "@/features/admin/regras/checklist";
import { ITENS_POR_PAGINA } from "@/features/admin/regras/config";
import { ListaVideos } from "@/features/admin/ui/ListaVideos";
import { listarVideos } from "@/server/admin/consultas";

export const metadata: Metadata = { title: "Vídeos" };

export default async function PaginaVideos(props: PageProps<"/admin/videos">) {
  const filtros = lerFiltrosVideos(await props.searchParams);
  const filtrados = filtrarVideos(listarVideos(), filtros);
  const { itens, pagina, totalPaginas } = paginar(filtrados, filtros.pagina, ITENS_POR_PAGINA);
  return (
    <>
      <header className="flex flex-col gap-4">
        <p className="sdb-meta sdb-secondary">Curadoria</p>
        <div className="sdb-row sdb-row--between">
          <h1 className="sdb-title-1">Vídeos do canal</h1>
          <ButtonLink href={"/admin/videos/novo" as Route} variant="primary" icon="mais">
            Novo vídeo
          </ButtonLink>
        </div>
        <p className="sdb-body-sm sdb-secondary">
          Vídeos de demonstração usam uma busca provisória do YouTube no lugar da URL e aparecem com pendência
          até receberem o endereço do vídeo.
        </p>
      </header>
      <ListaVideos
        itens={itens.map((v) => ({
          ...v,
          pendencias: checklistVideo(videoParaForm(v)).filter((i) => i.estado === "pendente").length,
        }))}
        total={filtrados.length}
        pagina={pagina}
        totalPaginas={totalPaginas}
        filtros={{ ...filtros, pagina }}
      />
    </>
  );
}
