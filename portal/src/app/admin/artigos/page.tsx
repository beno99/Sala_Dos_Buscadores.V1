import type { Metadata, Route } from "next";
import { ButtonLink } from "@/components/ds/Button";
import { filtrarArtigos, lerFiltrosArtigos, paginar } from "@/features/admin/listas";
import { ITENS_POR_PAGINA } from "@/features/admin/regras/config";
import { ListaArtigos } from "@/features/admin/ui/ListaArtigos";
import { listarArtigos, pendenciasDoArtigo } from "@/server/admin/consultas";

export const metadata: Metadata = { title: "Artigos" };

export default async function PaginaArtigos(props: PageProps<"/admin/artigos">) {
  const filtros = lerFiltrosArtigos(await props.searchParams);
  const filtrados = filtrarArtigos(listarArtigos(), filtros);
  const { itens, pagina, totalPaginas } = paginar(filtrados, filtros.pagina, ITENS_POR_PAGINA);

  return (
    <>
      <header className="flex flex-col gap-4">
        <p className="sdb-meta sdb-secondary">Curadoria</p>
        <div className="sdb-row sdb-row--between">
          <h1 className="sdb-title-1">Artigos</h1>
          <ButtonLink href={"/admin/artigos/novo" as Route} variant="primary" icon="mais">
            Novo artigo
          </ButtonLink>
        </div>
        <p className="sdb-body-sm sdb-secondary">
          Artigos e fontes primárias de todas as Salas, em qualquer status.
        </p>
      </header>
      <ListaArtigos
        itens={itens.map((a) => ({ ...a, pendencias: pendenciasDoArtigo(a).length }))}
        total={filtrados.length}
        pagina={pagina}
        totalPaginas={totalPaginas}
        filtros={{ ...filtros, pagina }}
      />
    </>
  );
}
