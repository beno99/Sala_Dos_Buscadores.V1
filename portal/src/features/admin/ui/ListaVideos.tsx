"use client";

import type { Route } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ds/Button";
import { Select } from "@/components/ds/CamposExtras";
import { SeloStatus } from "@/components/ds/Curadoria";
import { Icon } from "@/components/ds/Icon";
import { Menu } from "@/components/ds/Menu";
import { Paginacao } from "@/components/ds/Paginacao";
import { type ColunaTabela, TabelaDados } from "@/components/ds/TabelaDados";
import { temaPorSlug } from "@/data/catalogo";
import type { VideoEditorial } from "@/data/types";
import { formatarData } from "@/lib/texto";
import { type FiltrosVideos, paraQuery } from "../listas";
import { CampoBuscaLista, PainelFiltros, useFiltrosNaUrl } from "./BarraFiltros";
import { OPCOES_NIVEL, OPCOES_STATUS, OPCOES_TEMA } from "./opcoes";
import { useAcaoStatus } from "./useAcaoStatus";

export interface LinhaVideo extends VideoEditorial {
  pendencias: number;
}

/** Vídeos do canal dentro de uma Sala (RF-16, curadoria a partir da Sala), com os artigos a que se ligam. */
export function ListaVideos({
  itens,
  total,
  pagina,
  totalPaginas,
  filtros,
  sala,
  titulosDosArtigos,
}: {
  itens: LinhaVideo[];
  total: number;
  pagina: number;
  totalPaginas: number;
  filtros: FiltrosVideos;
  sala: { slug: string; nome: string };
  /** Título de cada artigo da Sala, para a coluna "Ligado a". */
  titulosDosArtigos: Record<string, string>;
}) {
  const base = `/admin/salas/${sala.slug}/videos`;
  const { aplicar, pendente } = useFiltrosNaUrl(base, filtros, paraQuery);
  const { pedir: pedirStatus, modal } = useAcaoStatus("video");
  const pedir = (v: LinhaVideo, acao: Parameters<typeof pedirStatus>[1]) =>
    pedirStatus({ ...v, salaNome: sala.nome }, acao);

  const colunas: ColunaTabela<LinhaVideo>[] = [
    {
      id: "titulo",
      cabecalho: "Título",
      ordenavel: "titulo",
      celula: (v) => (
        <>
          <span className="sdb-table__title">
            <Link href={`${base}/${v.id}` as Route}>{v.titulo || "Sem título"}</Link>
          </span>
          <span className="sdb-table__sub">
            {temaPorSlug(v.tema)?.nome} · {v.duracao || "sem duração"}
            {v.pendencias > 0 && ` · ${v.pendencias} ${v.pendencias === 1 ? "pendência" : "pendências"}`}
          </span>
        </>
      ),
    },
    { id: "status", cabecalho: "Status", celula: (v) => <SeloStatus status={v.status} /> },
    {
      id: "ligado",
      cabecalho: "Ligado a",
      celula: (v) => {
        const titulos = v.artigos.map((id) => titulosDosArtigos[id]).filter(Boolean);
        return titulos.length ? (
          <span className="sdb-footnote">{titulos.join(" · ")}</span>
        ) : (
          <span className="sdb-badge sdb-badge--neutral">Só na Sala</span>
        );
      },
    },
    {
      id: "atualizado",
      cabecalho: "Atualizado",
      ordenavel: "atualizado",
      className: "sdb-tabular",
      celula: (v) => formatarData(v.atualizadoEm.slice(0, 10)),
    },
    {
      id: "acoes",
      cabecalho: "Ações",
      cabecalhoOculto: true,
      className: "sdb-table__actions",
      celula: (v) => (
        <>
          <ButtonLink
            href={`${base}/${v.id}` as Route}
            variant="secondary"
            size="sm"
            aria-label={`Editar ${v.titulo}`}
          >
            Editar
          </ButtonLink>
          <Menu
            right
            titulo={v.titulo || "Vídeo"}
            triggerLabel={`Mais ações para ${v.titulo || "vídeo sem título"}`}
            triggerClassName="sdb-btn sdb-btn--icon sdb-btn--secondary sdb-btn--sm"
            trigger={<Icon name="reticencias" size="sm" />}
            items={[
              ...(v.status === "rascunho" && !v.pendencias
                ? [{ label: "Publicar", icon: "check" as const, onSelect: () => pedir(v, "publicar") }]
                : []),
              ...(v.status === "publicado"
                ? [
                    {
                      label: "Despublicar",
                      icon: "regenerar" as const,
                      onSelect: () => pedir(v, "despublicar"),
                    },
                  ]
                : []),
              v.status === "arquivado"
                ? { label: "Restaurar", icon: "regenerar", onSelect: () => pedir(v, "restaurar") }
                : {
                    label: "Arquivar",
                    icon: "cadeado",
                    danger: true,
                    onSelect: () => pedir(v, "arquivar"),
                    separarAntes: true,
                  },
            ]}
          />
        </>
      ),
    },
  ];

  const ordem = filtros.ordem.startsWith("titulo")
    ? {
        coluna: "titulo",
        direcao: filtros.ordem.endsWith("asc") ? ("ascending" as const) : ("descending" as const),
      }
    : {
        coluna: "atualizado",
        direcao: filtros.ordem.endsWith("asc") ? ("ascending" as const) : ("descending" as const),
      };

  return (
    <div className="flex flex-col gap-5">
      <PainelFiltros>
        <CampoBuscaLista rotulo="Buscar por título" valor={filtros.q} onBuscar={(q) => aplicar({ q })} />
        <Select
          label="Tema"
          value={filtros.tema}
          opcoes={OPCOES_TEMA}
          onChange={(e) => aplicar({ tema: e.target.value as FiltrosVideos["tema"] })}
        />
        <Select
          label="Nível"
          value={filtros.nivel ? String(filtros.nivel) : ""}
          opcoes={OPCOES_NIVEL}
          onChange={(e) => aplicar({ nivel: (Number(e.target.value) || 0) as FiltrosVideos["nivel"] })}
        />
        <Select
          label="Status"
          value={filtros.status}
          opcoes={OPCOES_STATUS}
          onChange={(e) => aplicar({ status: e.target.value as FiltrosVideos["status"] })}
        />
      </PainelFiltros>
      <p className="sdb-footnote" aria-live="polite">
        {pendente
          ? "Atualizando a lista…"
          : `${total} ${total === 1 ? "vídeo" : "vídeos"} com estes filtros.`}
      </p>
      <div
        aria-busy={pendente || undefined}
        className={pendente ? "opacity-60 transition-opacity" : "transition-opacity"}
      >
        <TabelaDados
          legenda={`Vídeos da Sala ${sala.nome} · página ${pagina} de ${totalPaginas}`}
          colunas={colunas}
          itens={itens}
          chave={(v) => v.id}
          rotuloItem={(v) => v.titulo}
          ordem={ordem}
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
          vazio={
            <>
              Nenhum vídeo com estes filtros.{" "}
              <Link className="sdb-link" href={base as Route}>
                Limpar filtros
              </Link>
              .
            </>
          }
        />
      </div>
      <div className="flex justify-center">
        <Paginacao
          pagina={pagina}
          total={totalPaginas}
          rotulo="Páginas da lista de vídeos"
          href={(p) => `${base}${paraQuery({ ...filtros, pagina: p })}`}
        />
      </div>
      {modal}
    </div>
  );
}
