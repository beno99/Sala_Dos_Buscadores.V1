"use client";
import type { Route } from "next";
import { Breadcrumbs } from "@/components/ds/Breadcrumbs";
import { ButtonLink } from "@/components/ds/Button";
import { SeloStatus } from "@/components/ds/Curadoria";
import { TabelaDados } from "@/components/ds/TabelaDados";
import { AcaoLixeiraSala } from "@/features/salas/AcaoLixeiraSala";
import { formatarData } from "@/lib/texto";
import type { listarLixeiraSalas } from "@/server/salas/lixeira";

export function LixeiraSalas({ salas }: { salas: ReturnType<typeof listarLixeiraSalas> }) {
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs itens={[{ href: "/admin/salas" as Route, rotulo: "Salas" }]} atual="Lixeira" />
      <header className="flex flex-col gap-3">
        <h1 className="sdb-title-1">Lixeira de Salas</h1>
        <p className="sdb-body-sm">
          As Salas excluídas ficam fora do portal. Artigos, vídeos, conversas e vínculos permanecem guardados.
          Só a curadoria pode restaurar ou excluir definitivamente; a exclusão definitiva apaga a Sala, seus
          artigos, vídeos e citações para sempre.
        </p>
        <ButtonLink href={"/admin/salas" as Route} variant="secondary">
          Voltar às Salas
        </ButtonLink>
      </header>
      <TabelaDados
        legenda={`Salas na lixeira · ${salas.length}`}
        itens={salas}
        chave={(s) => s.id}
        rotuloItem={(s) => s.nome}
        vazio="A lixeira está vazia. Nenhuma Sala foi excluída."
        colunas={[
          {
            id: "nome",
            cabecalho: "Sala",
            celula: (s) => (
              <>
                <span className="sdb-table__title">{s.nome}</span>
                <span className="sdb-table__sub">
                  {s.origem === "oficial" ? "Curadoria" : "Anfitrião"} · /salas/{s.slug}
                </span>
              </>
            ),
          },
          { id: "status", cabecalho: "Estado preservado", celula: (s) => <SeloStatus status={s.status} /> },
          {
            id: "conteudos",
            cabecalho: "Conteúdos preservados",
            celula: (s) => `${s.artigos} artigos · ${s.videos} vídeos · ${s.conversas} conversas`,
          },
          { id: "data", cabecalho: "Excluída em", celula: (s) => formatarData(s.excluidaEm.slice(0, 10)) },
          {
            id: "acoes",
            cabecalho: "Ações",
            className: "sdb-table__actions",
            celula: (s) => (
              <div className="flex gap-2">
                <AcaoLixeiraSala id={s.id} nome={s.nome} restaurar />
                <AcaoLixeiraSala id={s.id} nome={s.nome} permanente />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
