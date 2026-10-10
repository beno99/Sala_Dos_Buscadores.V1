"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ButtonLink } from "@/components/ds/Button";
import { Select } from "@/components/ds/CamposExtras";
import { SeloStatus } from "@/components/ds/Curadoria";
import { Icon } from "@/components/ds/Icon";
import { Menu } from "@/components/ds/Menu";
import { Paginacao } from "@/components/ds/Paginacao";
import { SeloProveniencia } from "@/components/ds/Selos";
import { type ColunaTabela, TabelaDados } from "@/components/ds/TabelaDados";
import { useToast } from "@/components/ds/Toast";
import { salaPorSlug } from "@/data/catalogo";
import { TIPO_ROTULO } from "@/data/rotulos";
import type { ConteudoEditorial } from "@/data/types";
import { formatarData } from "@/lib/texto";
import { duplicarArtigoAcao } from "@/server/admin/acoes";
import { type FiltrosArtigos, paraQuery } from "../listas";
import { CampoBuscaLista, PainelFiltros, useFiltrosNaUrl } from "./BarraFiltros";
import {
  OPCOES_NIVEL,
  OPCOES_PROVENIENCIA,
  OPCOES_SALA,
  OPCOES_STATUS,
  OPCOES_TEMA,
  OPCOES_TIPO,
} from "./opcoes";
import { useAcaoStatus } from "./useAcaoStatus";

export interface LinhaArtigo extends ConteudoEditorial {
  pendencias: number;
}

interface ListaArtigosProps {
  itens: LinhaArtigo[];
  total: number;
  pagina: number;
  totalPaginas: number;
  filtros: FiltrosArtigos;
}

/** Lista de artigos da curadoria (RF-13): busca, filtros, ordenação, paginação e ações em linha. */
export function ListaArtigos({ itens, total, pagina, totalPaginas, filtros }: ListaArtigosProps) {
  const router = useRouter();
  const toast = useToast();
  const { aplicar, pendente } = useFiltrosNaUrl("/admin/artigos", filtros, paraQuery);
  const { pedir, modal } = useAcaoStatus("artigo");
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  const duplicar = async (a: LinhaArtigo) => {
    const r = await duplicarArtigoAcao(a.id);
    if (r.ok) {
      toast(r.mensagem, { icon: "copiar" });
      router.push(`/admin/artigos/${r.valor.id}` as Route);
    } else toast("Tente de novo.", { variant: "erro", title: r.mensagem });
  };

  const colunas: ColunaTabela<LinhaArtigo>[] = [
    {
      id: "titulo",
      cabecalho: "Título",
      ordenavel: "titulo",
      celula: (a) => (
        <>
          <span className="sdb-table__title">
            <Link href={`/admin/artigos/${a.id}` as Route}>{a.titulo || "Sem título"}</Link>
          </span>
          <span className="sdb-table__sub">
            {salaPorSlug(a.sala)?.nome} · {TIPO_ROTULO[a.tipo].toLowerCase()}
            {a.pendencias > 0 && ` · ${a.pendencias} ${a.pendencias === 1 ? "pendência" : "pendências"}`}
          </span>
        </>
      ),
    },
    { id: "status", cabecalho: "Status", celula: (a) => <SeloStatus status={a.status} /> },
    {
      id: "proveniencia",
      cabecalho: "Proveniência",
      celula: (a) => <SeloProveniencia tipo={a.proveniencia} />,
    },
    {
      id: "atualizado",
      cabecalho: "Atualizado",
      ordenavel: "atualizado",
      className: "sdb-tabular",
      celula: (a) => formatarData(a.atualizadoEm.slice(0, 10)),
    },
    {
      id: "acoes",
      cabecalho: "Ações",
      cabecalhoOculto: true,
      className: "sdb-table__actions",
      celula: (a) => (
        <>
          <ButtonLink
            href={`/admin/artigos/${a.id}` as Route}
            variant="secondary"
            size="sm"
            aria-label={`Editar ${a.titulo}`}
          >
            Editar
          </ButtonLink>
          <Menu
            right
            titulo={a.titulo || "Artigo"}
            triggerLabel={`Mais ações para ${a.titulo || "artigo sem título"}`}
            triggerClassName="sdb-btn sdb-btn--icon sdb-btn--secondary sdb-btn--sm"
            trigger={<Icon name="reticencias" size="sm" />}
            items={[
              {
                label: "Pré-visualizar",
                icon: "olho",
                onSelect: () => {
                  window.open(`/admin/artigos/${a.id}/previa`, "_blank", "noopener");
                },
              },
              ...(a.status === "rascunho"
                ? [
                    {
                      label: a.pendencias ? "Publicar (resolva o checklist)" : "Publicar",
                      icon: "check" as const,
                      onSelect: () =>
                        a.pendencias
                          ? router.push(`/admin/artigos/${a.id}#checklist-titulo` as Route)
                          : pedir(a, "publicar"),
                    },
                  ]
                : []),
              ...(a.status === "publicado"
                ? [
                    {
                      label: "Despublicar",
                      icon: "regenerar" as const,
                      onSelect: () => pedir(a, "despublicar"),
                    },
                  ]
                : []),
              { label: "Duplicar", icon: "copiar", onSelect: () => duplicar(a) },
              a.status === "arquivado"
                ? {
                    label: "Restaurar",
                    icon: "regenerar",
                    onSelect: () => pedir(a, "restaurar"),
                    separarAntes: true,
                  }
                : {
                    label: "Arquivar",
                    icon: "cadeado",
                    danger: true,
                    onSelect: () => pedir(a, "arquivar"),
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

  const ordenar = (coluna: string) => {
    const atual = filtros.ordem;
    const proxima =
      coluna === "titulo"
        ? atual === "titulo-asc"
          ? "titulo-desc"
          : "titulo-asc"
        : atual === "atualizado-desc"
          ? "atualizado-asc"
          : "atualizado-desc";
    aplicar({ ordem: proxima } as Partial<FiltrosArtigos>);
  };

  const exportar = `/admin/exportar/artigos${paraQuery(filtros, ["pagina"])}${
    selecionados.size ? `${paraQuery(filtros, ["pagina"]) ? "&" : "?"}ids=${[...selecionados].join(",")}` : ""
  }`;

  return (
    <div className="flex flex-col gap-5">
      <PainelFiltros>
        <CampoBuscaLista rotulo="Buscar por título" valor={filtros.q} onBuscar={(q) => aplicar({ q })} />
        <Select
          label="Sala"
          value={filtros.sala}
          opcoes={OPCOES_SALA}
          onChange={(e) => aplicar({ sala: e.target.value as FiltrosArtigos["sala"] })}
        />
        <Select
          label="Tipo"
          value={filtros.tipo}
          opcoes={OPCOES_TIPO}
          onChange={(e) => aplicar({ tipo: e.target.value as FiltrosArtigos["tipo"] })}
        />
        <Select
          label="Status"
          value={filtros.status}
          opcoes={OPCOES_STATUS}
          onChange={(e) => aplicar({ status: e.target.value as FiltrosArtigos["status"] })}
        />
        <Select
          label="Proveniência"
          value={filtros.proveniencia}
          opcoes={OPCOES_PROVENIENCIA}
          onChange={(e) => aplicar({ proveniencia: e.target.value as FiltrosArtigos["proveniencia"] })}
        />
        <Select
          label="Nível"
          value={filtros.nivel ? String(filtros.nivel) : ""}
          opcoes={OPCOES_NIVEL}
          onChange={(e) => aplicar({ nivel: (Number(e.target.value) || 0) as FiltrosArtigos["nivel"] })}
        />
        <Select
          label="Tema"
          value={filtros.tema}
          opcoes={OPCOES_TEMA}
          onChange={(e) => aplicar({ tema: e.target.value as FiltrosArtigos["tema"] })}
        />
      </PainelFiltros>

      <div className="sdb-row sdb-row--between">
        <p className="sdb-footnote" aria-live="polite">
          {pendente
            ? "Atualizando a lista…"
            : `${total} ${total === 1 ? "artigo" : "artigos"} com estes filtros.`}
        </p>
        <a className="sdb-btn sdb-btn--secondary sdb-btn--sm no-underline" href={exportar} download>
          <Icon name="compartilhar" size="sm" />
          {selecionados.size ? `Exportar ${selecionados.size} selecionados (CSV)` : "Exportar CSV"}
        </a>
      </div>

      <div
        aria-busy={pendente || undefined}
        className={pendente ? "opacity-60 transition-opacity" : "transition-opacity"}
      >
        <TabelaDados
          legenda={`Artigos · página ${pagina} de ${totalPaginas}`}
          colunas={colunas}
          itens={itens}
          chave={(a) => a.id}
          rotuloItem={(a) => a.titulo || "artigo sem título"}
          ordem={ordem}
          onOrdenar={ordenar}
          selecionados={selecionados}
          onSelecionar={setSelecionados}
          vazio={
            <>
              Nenhum artigo com estes filtros.{" "}
              <Link className="sdb-link" href={"/admin/artigos" as Route}>
                Limpar filtros
              </Link>{" "}
              ou{" "}
              <Link className="sdb-link" href={"/admin/artigos/novo" as Route}>
                criar um artigo
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
          rotulo="Páginas da lista de artigos"
          href={(p) => `/admin/artigos${paraQuery({ ...filtros, pagina: p })}`}
        />
      </div>
      {modal}
    </div>
  );
}
