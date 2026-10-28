import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ds/Breadcrumbs";
import { ListaSalasRevisao } from "@/features/admin/ui/anfitrioes/ListaSalasRevisao";
import { painelDoAnfitriao, salasDoAnfitriaoParaRevisao } from "@/server/anfitriao/consultas";
import { contaNoDiretorio as contaPorId } from "@/server/store";

export const metadata: Metadata = { title: "Salas do anfitrião" };

/** Revisão de anfitriões, nível 2: as Salas de um anfitrião. */
export default async function SalasDoAnfitriao(props: PageProps<"/admin/anfitrioes/[contaId]">) {
  const { contaId } = await props.params;
  const conta = contaPorId(contaId);
  if (!conta) notFound();
  const perfil = painelDoAnfitriao(contaId).perfil;
  const nome = perfil?.nome ?? conta.pseudonimo;
  const salas = salasDoAnfitriaoParaRevisao(contaId).map(({ sala, artigos }) => ({
    id: sala.id,
    nome: sala.nome,
    status: sala.status,
    publicados: artigos.publicados,
    emRevisao: artigos.emRevisao,
    reprovados: artigos.reprovados,
    naComparacao: sala.naComparacao,
    congelada: Boolean(sala.revisao?.congelado),
    atualizadaEm: sala.atualizadoEm,
  }));
  return (
    <>
      <Breadcrumbs
        itens={[
          { href: "/admin" as Route, rotulo: "Curadoria" },
          { href: "/admin/anfitrioes" as Route, rotulo: "Anfitriões" },
        ]}
        atual={nome}
      />
      <header className="flex flex-col gap-2">
        <h1 className="sdb-title-1">{nome}</h1>
        <p className="sdb-body-sm sdb-secondary">
          {conta.email}
          {perfil?.credencial && ` · ${perfil.credencial}`}
          {conta.papel !== "anfitriao" && " · não é mais anfitrião"}
        </p>
        {perfil && (
          <p className="sdb-footnote">
            Página pública:{" "}
            <Link className="sdb-link" href={`/anfitrioes/${perfil.slug}` as Route}>
              /anfitrioes/{perfil.slug}
            </Link>
          </p>
        )}
      </header>
      <ListaSalasRevisao contaId={contaId} salas={salas} />
    </>
  );
}
