"use client";

import type { Route } from "next";
import Link from "next/link";
import { SeloStatus } from "@/components/ds/Curadoria";
import { TabelaDados } from "@/components/ds/TabelaDados";
import type { StatusEditorial } from "@/data/types";
import { formatarData, plural } from "@/lib/texto";

export interface LinhaSalaAnfitriao {
  id: string;
  nome: string;
  status: StatusEditorial;
  atualizadaEm: string;
  artigos: { total: number; publicados: number; emRevisao: number; reprovados: number };
  /** Decisões da curadoria ainda não vistas nesta Sala ou nos artigos dela. */
  novidades: number;
}

/** As Salas do anfitrião: cada linha abre a Sala (TabelaDados em navegação). */
export function ListaSalasAnfitriao({ salas }: { salas: LinhaSalaAnfitriao[] }) {
  return (
    <TabelaDados<LinhaSalaAnfitriao>
      legenda={`Suas Salas · ${salas.length}`}
      navegacao
      itens={salas}
      chave={(s) => s.id}
      rotuloItem={(s) => s.nome}
      vazio="Você ainda não tem Salas. Use “Nova Sala” para começar."
      colunas={[
        {
          id: "nome",
          cabecalho: "Sala",
          celula: (s) => (
            <>
              <span className="sdb-table__title">
                <Link href={`/anfitriao/salas/${s.id}` as Route}>{s.nome}</Link>
              </span>
              <span className="sdb-table__sub">
                {plural(s.artigos.total, "artigo", "artigos")}
                {s.novidades > 0 && ` · ${plural(s.novidades, "novidade", "novidades")}`}
              </span>
            </>
          ),
        },
        { id: "status", cabecalho: "Status", celula: (s) => <SeloStatus status={s.status} /> },
        {
          id: "publicados",
          cabecalho: "Publicados",
          className: "sdb-table__num",
          celula: (s) => s.artigos.publicados,
        },
        {
          id: "revisao",
          cabecalho: "Em revisão",
          className: "sdb-table__num",
          celula: (s) => s.artigos.emRevisao,
        },
        {
          id: "reprovados",
          cabecalho: "Reprovados",
          className: "sdb-table__num",
          celula: (s) => s.artigos.reprovados,
        },
        {
          id: "atualizada",
          cabecalho: "Atualizada",
          className: "sdb-tabular",
          celula: (s) => formatarData(s.atualizadaEm),
        },
      ]}
    />
  );
}
