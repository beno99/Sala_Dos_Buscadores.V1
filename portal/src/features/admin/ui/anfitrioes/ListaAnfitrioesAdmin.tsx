"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TabelaDados } from "@/components/ds/TabelaDados";
import { formatarData } from "@/lib/texto";

export interface LinhaAnfitriaoVisual {
  id: string;
  nome: string;
  email: string;
  papel: "membro" | "anfitriao" | "administrador";
  salas: number;
  publicados: number;
  pendentes: number;
  maisAntigo: string | null;
}

/** Nível 1 da revisão: anfitriões, quem espera há mais tempo primeiro. */
export function ListaAnfitrioesAdmin({
  linhas,
  soComPendencias,
}: {
  linhas: LinhaAnfitriaoVisual[];
  soComPendencias: boolean;
}) {
  const router = useRouter();
  return (
    <TabelaDados<LinhaAnfitriaoVisual>
      legenda={`Anfitriões · ${linhas.length}`}
      navegacao
      itens={linhas}
      chave={(l) => l.id}
      rotuloItem={(l) => l.nome}
      vazio={soComPendencias ? "Nenhum anfitrião com envio pendente." : "Nenhum anfitrião ainda."}
      barra={
        <>
          <span className="sdb-footnote">Ordem: quem espera há mais tempo primeiro.</span>
          <label className="sdb-switch">
            <input
              type="checkbox"
              role="switch"
              checked={soComPendencias}
              aria-checked={soComPendencias}
              onChange={(e) =>
                router.push(
                  (e.target.checked ? "/admin/anfitrioes?pendencias=1" : "/admin/anfitrioes") as Route,
                )
              }
            />
            Só com pendências
          </label>
        </>
      }
      colunas={[
        {
          id: "nome",
          cabecalho: "Anfitrião",
          celula: (l) => (
            <>
              <span className="sdb-table__title">
                <Link href={`/admin/anfitrioes/${l.id}` as Route}>{l.nome}</Link>
              </span>
              <span className="sdb-table__sub">
                {l.email}
                {l.papel !== "anfitriao" && " · ex-anfitrião"}
              </span>
            </>
          ),
        },
        { id: "salas", cabecalho: "Salas", className: "sdb-table__num", celula: (l) => l.salas },
        {
          id: "publicados",
          cabecalho: "Publicados",
          className: "sdb-table__num",
          celula: (l) => l.publicados,
        },
        {
          id: "pendentes",
          cabecalho: "Pendentes",
          celula: (l) =>
            l.pendentes > 0 ? (
              <span className="sdb-badge">
                <i className="sdb-badge__dot sdb-badge__dot--half" />
                {l.pendentes} em revisão
              </span>
            ) : (
              <span className="sdb-footnote">Nenhum</span>
            ),
        },
        {
          id: "espera",
          cabecalho: "Envio mais antigo",
          className: "sdb-tabular",
          celula: (l) => (l.maisAntigo ? formatarData(l.maisAntigo.slice(0, 10)) : "—"),
        },
      ]}
    />
  );
}
