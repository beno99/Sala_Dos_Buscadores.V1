"use client";

import type { Route } from "next";
import Link from "next/link";
import { SeloStatus } from "@/components/ds/Curadoria";
import { TabelaDados } from "@/components/ds/TabelaDados";
import type { StatusEditorial } from "@/data/types";
import { formatarData } from "@/lib/texto";

export interface LinhaSalaRevisao {
  id: string;
  nome: string;
  status: StatusEditorial;
  publicados: number;
  emRevisao: number;
  reprovados: number;
  naComparacao: boolean;
  congelada: boolean;
  atualizadaEm: string;
}

/** Nível 2 da revisão: as Salas de um anfitrião. */
export function ListaSalasRevisao({ contaId, salas }: { contaId: string; salas: LinhaSalaRevisao[] }) {
  return (
    <TabelaDados<LinhaSalaRevisao>
      legenda={`Salas · ${salas.length}`}
      navegacao
      itens={salas}
      chave={(s) => s.id}
      rotuloItem={(s) => s.nome}
      vazio="Este anfitrião ainda não criou Salas."
      colunas={[
        {
          id: "nome",
          cabecalho: "Sala",
          celula: (s) => (
            <>
              <span className="sdb-table__title">
                <Link href={`/admin/anfitrioes/${contaId}/salas/${s.id}` as Route}>{s.nome}</Link>
              </span>
              {s.congelada && <span className="sdb-table__sub">Congelada</span>}
            </>
          ),
        },
        { id: "status", cabecalho: "Status", celula: (s) => <SeloStatus status={s.status} /> },
        {
          id: "publicados",
          cabecalho: "Publicados",
          className: "sdb-table__num",
          celula: (s) => s.publicados,
        },
        { id: "revisao", cabecalho: "Em revisão", className: "sdb-table__num", celula: (s) => s.emRevisao },
        {
          id: "reprovados",
          cabecalho: "Reprovados",
          className: "sdb-table__num",
          celula: (s) => s.reprovados,
        },
        { id: "comparacao", cabecalho: "Na comparação", celula: (s) => (s.naComparacao ? "Sim" : "Não") },
        {
          id: "atualizada",
          cabecalho: "Atualizada",
          className: "sdb-tabular",
          celula: (s) => formatarData(s.atualizadaEm.slice(0, 10)),
        },
      ]}
    />
  );
}
