"use client";

import type { Route } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ds/Button";
import { Icon } from "@/components/ds/Icon";
import { Paginacao } from "@/components/ds/Paginacao";
import { type ColunaTabela, TabelaDados } from "@/components/ds/TabelaDados";
import type { FonteEditorial } from "@/data/types";
import { formatarData } from "@/lib/texto";
import { type FiltrosFontes, paraQuery } from "../listas";
import { CampoBuscaLista, PainelFiltros, useFiltrosNaUrl } from "./BarraFiltros";

export interface LinhaFonte extends FonteEditorial {
  usos: number;
  usosPublicados: number;
}

/** Lista de fontes bibliográficas da curadoria. */
export function ListaFontes({
  itens,
  total,
  pagina,
  totalPaginas,
  filtros,
}: {
  itens: LinhaFonte[];
  total: number;
  pagina: number;
  totalPaginas: number;
  filtros: FiltrosFontes;
}) {
  const { aplicar, pendente } = useFiltrosNaUrl("/admin/fontes", filtros, paraQuery);
  const colunas: ColunaTabela<LinhaFonte>[] = [
    {
      id: "titulo",
      cabecalho: "Obra",
      ordenavel: "titulo",
      celula: (f) => (
        <>
          <span className="sdb-table__title">
            <Link href={`/admin/fontes/${f.id}` as Route}>{f.titulo}</Link>
          </span>
          <span className="sdb-table__sub">
            {f.autor} · {f.referencia}
          </span>
        </>
      ),
    },
    {
      id: "tipo",
      cabecalho: "Tipo",
      celula: (f) => <span className="sdb-badge sdb-badge--neutral">{f.tipo}</span>,
    },
    {
      id: "usos",
      cabecalho: "Citada por",
      className: "sdb-table__num",
      celula: (f) => (f.usos ? `${f.usos} (${f.usosPublicados} publ.)` : "Nenhum"),
    },
    {
      id: "atualizado",
      cabecalho: "Atualizada",
      ordenavel: "atualizado",
      className: "sdb-tabular",
      celula: (f) => formatarData(f.atualizadoEm.slice(0, 10)),
    },
    {
      id: "acoes",
      cabecalho: "Ações",
      cabecalhoOculto: true,
      className: "sdb-table__actions",
      celula: (f) => (
        <ButtonLink
          href={`/admin/fontes/${f.id}` as Route}
          variant="secondary"
          size="sm"
          aria-label={`Editar ${f.titulo}`}
        >
          Editar
        </ButtonLink>
      ),
    },
  ];
  return (
    <div className="flex flex-col gap-5">
      <PainelFiltros>
        <CampoBuscaLista
          rotulo="Buscar por título ou autor"
          valor={filtros.q}
          onBuscar={(q) => aplicar({ q })}
        />
      </PainelFiltros>
      <div className="sdb-row sdb-row--between">
        <p className="sdb-footnote" aria-live="polite">
          {pendente ? "Atualizando a lista…" : `${total} ${total === 1 ? "fonte" : "fontes"}.`}
        </p>
        <a
          className="sdb-btn sdb-btn--secondary sdb-btn--sm no-underline"
          href={`/admin/exportar/fontes${paraQuery(filtros, ["pagina"])}`}
          download
        >
          <Icon name="compartilhar" size="sm" />
          Exportar CSV
        </a>
      </div>
      <TabelaDados
        legenda={`Fontes · página ${pagina} de ${totalPaginas}`}
        colunas={colunas}
        itens={itens}
        chave={(f) => f.id}
        rotuloItem={(f) => f.titulo}
        ordem={
          filtros.ordem.startsWith("titulo")
            ? { coluna: "titulo", direcao: filtros.ordem.endsWith("asc") ? "ascending" : "descending" }
            : { coluna: "atualizado", direcao: filtros.ordem.endsWith("asc") ? "ascending" : "descending" }
        }
        onOrdenar={(c) =>
          aplicar({
            ordem:
              c === "titulo"
                ? filtros.ordem === "titulo-asc"
                  ? "titulo-desc"
                  : "titulo-asc"
                : filtros.ordem === "atualizado-desc"
                  ? "atualizado-asc"
                  : "atualizado-desc",
          })
        }
        vazio="Nenhuma fonte com essa busca."
      />
      <div className="flex justify-center">
        <Paginacao
          pagina={pagina}
          total={totalPaginas}
          rotulo="Páginas da lista de fontes"
          href={(p) => `/admin/fontes${paraQuery({ ...filtros, pagina: p })}`}
        />
      </div>
    </div>
  );
}
