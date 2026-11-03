import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ds/Breadcrumbs";
import { RevisaoMidiasAnfitriao } from "@/features/admin/ui/anfitrioes/RevisaoMidiasAnfitriao";
import { anunciosParaCuradoria, contagemAnunciosPorStatus } from "@/server/anuncios";
import { acessoAtual } from "@/server/sessao";

export const metadata: Metadata = { title: "Publicidade" };

const FILTROS = [
  { status: "", rotulo: "Todos" },
  { status: "em_revisao", rotulo: "Em revisão" },
  { status: "publicado", rotulo: "No Portal" },
  { status: "arquivado", rotulo: "Arquivados" },
  { status: "reprovado", rotulo: "Reprovados" },
  { status: "rascunho", rotulo: "Rascunhos" },
] as const;

/** Publicidade de todos os anfitriões: aprovar, reprovar, arquivar, desarquivar e apagar. */
export default async function PublicidadeDaCuradoria(props: PageProps<"/admin/publicidade">) {
  if ((await acessoAtual()).tipo !== "admin") notFound();
  const { status } = await props.searchParams;
  const atual = FILTROS.find((f) => f.status === status)?.status ?? "";
  const contagem = contagemAnunciosPorStatus();
  const total = Object.values(contagem).reduce((a, b) => a + b, 0);
  return (
    <>
      <Breadcrumbs itens={[{ href: "/admin" as Route, rotulo: "Curadoria" }]} atual="Publicidade" />
      <header className="flex flex-col gap-2">
        <h1 className="sdb-title-1">Publicidade</h1>
        <p className="sdb-body-sm sdb-secondary max-w-read">
          Anúncios de todos os anfitriões. Aprove ou reprove os enviados, arquive o que deve sair do Portal
          (dá para desarquivar) e apague o que não deve ficar guardado. Cada decisão avisa o anfitrião e fica
          no Histórico.
        </p>
      </header>
      <nav className="flex flex-wrap gap-2" aria-label="Filtrar anúncios por situação">
        {FILTROS.map((f) => (
          <Link
            key={f.status}
            className="sdb-chip no-underline"
            aria-current={f.status === atual ? "page" : undefined}
            href={(f.status ? `/admin/publicidade?status=${f.status}` : "/admin/publicidade") as Route}
          >
            {f.rotulo} · {f.status ? (contagem[f.status] ?? 0) : total}
          </Link>
        ))}
      </nav>
      <RevisaoMidiasAnfitriao
        anuncios={anunciosParaCuradoria(atual || undefined)}
        vazioAnuncios="Nenhum anúncio nesta situação."
      />
    </>
  );
}
