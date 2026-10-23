"use client";

import type { Route } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ds/Button";
import { Select } from "@/components/ds/CamposExtras";
import { SeloStatus } from "@/components/ds/Curadoria";
import { Icon } from "@/components/ds/Icon";
import { Menu } from "@/components/ds/Menu";
import { TabelaDados } from "@/components/ds/TabelaDados";
import type { Placa, StatusEditorial } from "@/data/types";
import { formatarData } from "@/lib/texto";
import { type FiltrosSalas, paraQuery } from "../../listas";
import { CampoBuscaLista, PainelFiltros, useFiltrosNaUrl } from "../BarraFiltros";
import { MiniaturaSala } from "./MiniaturaSala";

export interface LinhaSalaAdmin {
  id: string;
  slug: string;
  nome: string;
  tradicao: string;
  origem: "oficial" | "anfitriao";
  anfitriao?: string;
  donoId?: string;
  status: StatusEditorial;
  artigos: { publicados: number; total: number };
  videos: number;
  naComparacao: boolean;
  atualizadaEm: string;
  imagem?: string;
  placa: Placa;
  foraDoAr: string | null;
}

const OPCOES_ORIGEM = [
  { value: "", label: "Todas" },
  { value: "oficial", label: "Curadoria" },
  { value: "anfitriao", label: "Anfitriões" },
];

const OPCOES_STATUS_SALA = [
  { value: "", label: "Todos os status" },
  { value: "rascunho", label: "Rascunho" },
  { value: "em_revisao", label: "Em revisão" },
  { value: "publicado", label: "Publicado" },
  { value: "reprovado", label: "Reprovado" },
  { value: "arquivado", label: "Arquivado" },
];

/** Lista de Salas da curadoria (curadoria a partir da Sala, §3). */
export function ListaSalasAdmin({
  salas,
  filtros,
  anfitrioes,
}: {
  salas: LinhaSalaAdmin[];
  filtros: FiltrosSalas;
  anfitrioes: { id: string; nome: string }[];
}) {
  const { aplicar, pendente } = useFiltrosNaUrl("/admin/salas", filtros, paraQuery);
  const exportar = (tipo: "artigos" | "videos") => {
    window.location.href = `/admin/exportar/${tipo}${paraQuery(filtros)}`;
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="@container">
        <section className="sdb-pagehead sdb-card" aria-labelledby="titulo-salas-admin">
          <div className="sdb-pagehead__titles">
            <p className="sdb-pagehead__eyebrow">
              <Icon name="salas" />
              Curadoria
            </p>
            <h1 className="sdb-pagehead__title" id="titulo-salas-admin">
              Salas
            </h1>
          </div>
          <p className="sdb-pagehead__sub">
            Tudo começa pela Sala: artigos e vídeos nascem dentro dela. As Salas de anfitriões abrem na
            revisão, somente leitura.
          </p>
          <div className="sdb-pagehead__top">
            <ButtonLink href={"/admin/salas/nova" as Route} variant="primary" icon="mais">
              Nova Sala
            </ButtonLink>
          </div>
        </section>
      </div>

      <PainelFiltros>
        <CampoBuscaLista rotulo="Buscar por nome" valor={filtros.q} onBuscar={(q) => aplicar({ q })} />
        <Select
          label="Origem"
          value={filtros.origem}
          opcoes={OPCOES_ORIGEM}
          onChange={(e) =>
            aplicar({
              origem: e.target.value as FiltrosSalas["origem"],
              anfitriao: "",
            } as Partial<FiltrosSalas>)
          }
        />
        <Select
          label="Status"
          value={filtros.status}
          opcoes={OPCOES_STATUS_SALA}
          onChange={(e) => aplicar({ status: e.target.value as FiltrosSalas["status"] })}
        />
        {filtros.origem === "anfitriao" && (
          <Select
            label="Anfitrião"
            value={filtros.anfitriao}
            opcoes={[
              { value: "", label: "Todos os anfitriões" },
              ...anfitrioes.map((a) => ({ value: a.id, label: a.nome })),
            ]}
            onChange={(e) => aplicar({ anfitriao: e.target.value })}
          />
        )}
      </PainelFiltros>

      <div className="sdb-row sdb-row--between">
        <p className="sdb-footnote" aria-live="polite">
          {pendente
            ? "Atualizando a lista…"
            : `${salas.length} ${salas.length === 1 ? "Sala" : "Salas"} com estes filtros.`}
        </p>
        <Menu
          right
          titulo="Exportar CSV"
          triggerLabel="Exportar CSV"
          triggerClassName="sdb-btn sdb-btn--secondary sdb-btn--sm"
          trigger={
            <>
              <Icon name="compartilhar" size="sm" />
              Exportar CSV
            </>
          }
          items={[
            { label: "Artigos", icon: "artigo", onSelect: () => exportar("artigos") },
            { label: "Vídeos", icon: "video", onSelect: () => exportar("videos") },
          ]}
        />
      </div>

      <div
        aria-busy={pendente || undefined}
        className={pendente ? "opacity-60 transition-opacity" : "transition-opacity"}
      >
        <TabelaDados<LinhaSalaAdmin>
          legenda={`Salas · ${salas.length}`}
          itens={salas}
          chave={(s) => s.id}
          rotuloItem={(s) => s.nome}
          vazio={
            <>
              Nenhuma Sala com estes filtros.{" "}
              <Link className="sdb-link" href={"/admin/salas" as Route}>
                Limpar filtros
              </Link>
              .
            </>
          }
          colunas={[
            {
              id: "sala",
              cabecalho: "Sala",
              celula: (s) => (
                <div className="sdb-table__sala">
                  <MiniaturaSala imagem={s.imagem} placa={s.placa} />
                  <div className="min-w-[12rem]">
                    <span className="sdb-table__title">
                      <Link href={(s.origem === "oficial" ? `/admin/salas/${s.slug}` : revisao(s)) as Route}>
                        {s.nome}
                      </Link>
                    </span>
                    <span className="sdb-table__sub">{s.foraDoAr ?? "No portal"}</span>
                  </div>
                </div>
              ),
            },
            {
              id: "origem",
              cabecalho: "Origem",
              celula: (s) =>
                s.origem === "oficial" ? (
                  "Curadoria"
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Icon name="anfitriao" size="sm" />
                    {s.anfitriao ?? "Anfitrião"}
                  </span>
                ),
            },
            { id: "status", cabecalho: "Status", celula: (s) => <SeloStatus status={s.status} /> },
            {
              id: "artigos",
              cabecalho: "Artigos",
              className: "sdb-table__num",
              celula: (s) => `${s.artigos.publicados} / ${s.artigos.total}`,
            },
            { id: "videos", cabecalho: "Vídeos", className: "sdb-table__num", celula: (s) => s.videos },
            { id: "comparacao", cabecalho: "Na comparação", celula: (s) => (s.naComparacao ? "Sim" : "Não") },
            {
              id: "atualizada",
              cabecalho: "Atualizada em",
              className: "sdb-tabular",
              celula: (s) => formatarData(s.atualizadaEm.slice(0, 10)),
            },
            {
              id: "acao",
              cabecalho: "Ação",
              cabecalhoOculto: true,
              className: "sdb-table__actions",
              celula: (s) =>
                s.origem === "oficial" ? (
                  <ButtonLink
                    href={`/admin/salas/${s.slug}` as Route}
                    variant="secondary"
                    size="sm"
                    aria-label={`Abrir ${s.nome}`}
                  >
                    Abrir
                  </ButtonLink>
                ) : (
                  <ButtonLink
                    href={revisao(s) as Route}
                    variant="secondary"
                    size="sm"
                    aria-label={`Revisar ${s.nome}`}
                  >
                    Revisar
                  </ButtonLink>
                ),
            },
          ]}
        />
      </div>
    </div>
  );
}

const revisao = (s: LinhaSalaAdmin) => `/admin/anfitrioes/${s.donoId ?? ""}/salas/${s.id}`;
