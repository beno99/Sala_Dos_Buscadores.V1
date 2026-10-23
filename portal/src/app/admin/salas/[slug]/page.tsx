import type { Metadata, Route } from "next";
import { Alerta } from "@/components/ds/Alerta";
import { ButtonLink } from "@/components/ds/Button";
import { filtrarArtigos, lerFiltrosArtigos, paginar } from "@/features/admin/listas";
import { ITENS_POR_PAGINA } from "@/features/admin/regras/config";
import { ListaArtigos } from "@/features/admin/ui/ListaArtigos";
import { CabecalhoSalaAdmin } from "@/features/admin/ui/salas/CabecalhoSalaAdmin";
import { listarArtigos, pendenciasDoArtigo } from "@/server/admin/consultas";
import { cabecalhoDaSala } from "@/server/admin/paginaSala";

export async function generateMetadata(props: PageProps<"/admin/salas/[slug]">): Promise<Metadata> {
  return { title: `Sala: ${(await props.params).slug}` };
}

/** Página da Sala oficial (§5), aba Artigos: artigos e fontes primárias da Sala. */
export default async function SalaAdmin(props: PageProps<"/admin/salas/[slug]">) {
  const { slug } = await props.params;
  const { sala, cabecalho } = cabecalhoDaSala(slug);
  const filtros = { ...lerFiltrosArtigos(await props.searchParams), sala: sala.slug };
  const filtrados = filtrarArtigos(listarArtigos(), filtros);
  const { itens, pagina, totalPaginas } = paginar(filtrados, filtros.pagina, ITENS_POR_PAGINA);
  const arquivada = sala.status === "arquivado";
  return (
    <CabecalhoSalaAdmin {...cabecalho} aba="artigos">
      <div className="flex flex-col gap-5">
        {arquivada ? (
          <Alerta title="Sala arquivada">Restaure a Sala para criar ou editar artigos nela.</Alerta>
        ) : (
          <div>
            <ButtonLink
              href={`/admin/salas/${sala.slug}/artigos/novo` as Route}
              variant="primary"
              icon="mais"
            >
              Novo artigo
            </ButtonLink>
          </div>
        )}
        <ListaArtigos
          itens={itens.map((a) => ({ ...a, pendencias: pendenciasDoArtigo(a).length }))}
          total={filtrados.length}
          pagina={pagina}
          totalPaginas={totalPaginas}
          filtros={{ ...filtros, sala: "", pagina }}
          sala={{ slug: sala.slug, nome: sala.nome }}
        />
      </div>
    </CabecalhoSalaAdmin>
  );
}
