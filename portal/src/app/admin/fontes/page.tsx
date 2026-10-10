import type { Metadata, Route } from "next";
import { ButtonLink } from "@/components/ds/Button";
import { filtrarFontes, lerFiltrosFontes, paginar } from "@/features/admin/listas";
import { ITENS_POR_PAGINA } from "@/features/admin/regras/config";
import { ListaFontes } from "@/features/admin/ui/ListaFontes";
import { listarFontes, usosDaFonte } from "@/server/admin/consultas";

export const metadata: Metadata = { title: "Fontes" };

export default async function PaginaFontes(props: PageProps<"/admin/fontes">) {
  const filtros = lerFiltrosFontes(await props.searchParams);
  const filtradas = filtrarFontes(listarFontes(), filtros);
  const { itens, pagina, totalPaginas } = paginar(filtradas, filtros.pagina, ITENS_POR_PAGINA);
  return (
    <>
      <header className="flex flex-col gap-4">
        <p className="sdb-meta sdb-secondary">Curadoria</p>
        <div className="sdb-row sdb-row--between">
          <h1 className="sdb-title-1">Fontes bibliográficas</h1>
          <ButtonLink href={"/admin/fontes/novo" as Route} variant="primary" icon="mais">
            Nova fonte
          </ButtonLink>
        </div>
        <p className="sdb-body-sm sdb-secondary">
          Obras que os conteúdos citam. Artigo sem fonte não é publicado; fonte citada por conteúdo publicado
          só pode ser editada.
        </p>
      </header>
      <ListaFontes
        itens={itens.map((f) => {
          const usos = usosDaFonte(f.id);
          return {
            ...f,
            usos: usos.length,
            usosPublicados: usos.filter((u) => u.status === "publicado").length,
          };
        })}
        total={filtradas.length}
        pagina={pagina}
        totalPaginas={totalPaginas}
        filtros={{ ...filtros, pagina }}
      />
    </>
  );
}
