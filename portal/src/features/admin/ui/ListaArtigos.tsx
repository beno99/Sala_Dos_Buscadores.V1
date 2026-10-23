"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ButtonLink } from "@/components/ds/Button";
import { Select } from "@/components/ds/CamposExtras";
import { SeloStatus } from "@/components/ds/Curadoria";
import { Icon } from "@/components/ds/Icon";
import { Menu } from "@/components/ds/Menu";
import { Paginacao } from "@/components/ds/Paginacao";
import { SeloProveniencia } from "@/components/ds/Selos";
import { type ColunaTabela, TabelaDados } from "@/components/ds/TabelaDados";
import { useToast } from "@/components/ds/Toast";
import { TIPO_ROTULO } from "@/data/rotulos";
import type { ConteudoEditorial } from "@/data/types";
import { formatarData } from "@/lib/texto";
import { duplicarArtigoAcao } from "@/server/admin/acoes";
import { type FiltrosArtigos, paraQuery } from "../listas";
import { CampoBuscaLista, PainelFiltros, useFiltrosNaUrl } from "./BarraFiltros";
import { OPCOES_NIVEL, OPCOES_PROVENIENCIA, OPCOES_STATUS, OPCOES_TEMA, OPCOES_TIPO } from "./opcoes";
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
  /** A Sala da página: os artigos vivem dentro dela. */
  sala: { slug: string; nome: string };
}

/**
 * Artigos e fontes primárias de uma Sala (RF-13, curadoria a partir da Sala):
 * busca, filtros, ordenação, paginação e ações em linha. A exportação CSV fica
 * na lista de Salas.
 */
export function ListaArtigos({ itens, total, pagina, totalPaginas, filtros, sala }: ListaArtigosProps) {
  const router = useRouter();
  const toast = useToast();
  const base = `/admin/salas/${sala.slug}`;
  const { aplicar, pendente } = useFiltrosNaUrl(base, filtros, paraQuery);
  const { pedir: pedirStatus, modal } = useAcaoStatus("artigo");
  const pedir = (a: LinhaArtigo, acao: Parameters<typeof pedirStatus>[1]) =>
    pedirStatus({ ...a, salaNome: sala.nome }, acao);
  const editar = (id: string) => `${base}/artigos/${id}` as Route;

  const duplicar = async (a: LinhaArtigo) => {
    const r = await duplicarArtigoAcao(a.id);
    if (r.ok) {
      toast(r.mensagem, { icon: "copiar" });
      router.push(editar(r.valor.id));
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
            <Link href={editar(a.id)}>{a.titulo || "Sem título"}</Link>
          </span>
          <span className="sdb-table__sub">
            {TIPO_ROTULO[a.tipo]}
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
          <ButtonLink href={editar(a.id)} variant="secondary" size="sm" aria-label={`Editar ${a.titulo}`}>
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
                  window.open(`${base}/artigos/${a.id}/previa`, "_blank", "noopener");
                },
              },
              ...(a.status === "rascunho"
                ? [
                    {
                      label: a.pendencias ? "Publicar (resolva o checklist)" : "Publicar",
                      icon: "check" as const,
                      onSelect: () =>
                        a.pendencias
                          ? router.push(`${base}/artigos/${a.id}#checklist-titulo` as Route)
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

  return (
    <div className="flex flex-col gap-5">
      <PainelFiltros>
        <CampoBuscaLista rotulo="Buscar por título" valor={filtros.q} onBuscar={(q) => aplicar({ q })} />
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

      <p className="sdb-footnote" aria-live="polite">
        {pendente
          ? "Atualizando a lista…"
          : `${total} ${total === 1 ? "artigo" : "artigos"} com estes filtros.`}
      </p>

      <div
        aria-busy={pendente || undefined}
        className={pendente ? "opacity-60 transition-opacity" : "transition-opacity"}
      >
        <TabelaDados
          legenda={`Artigos da Sala ${sala.nome} · página ${pagina} de ${totalPaginas}`}
          colunas={colunas}
          itens={itens}
          chave={(a) => a.id}
          rotuloItem={(a) => a.titulo || "artigo sem título"}
          ordem={ordem}
          onOrdenar={ordenar}
          vazio={
            <>
              Nenhum artigo com estes filtros.{" "}
              <Link className="sdb-link" href={base as Route}>
                Limpar filtros
              </Link>{" "}
              ou{" "}
              <Link className="sdb-link" href={`${base}/artigos/novo` as Route}>
                criar um artigo nesta Sala
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
          href={(p) => `${base}${paraQuery({ ...filtros, pagina: p })}`}
        />
      </div>
      {modal}
    </div>
  );
}
