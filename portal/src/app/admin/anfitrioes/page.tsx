import type { Metadata } from "next";
import { ListaAnfitrioesAdmin } from "@/features/admin/ui/anfitrioes/ListaAnfitrioesAdmin";
import { listarAnfitrioes, totalPendenteRevisao } from "@/server/anfitriao/consultas";

export const metadata: Metadata = { title: "Anfitriões" };

/** Revisão de anfitriões, nível 1 (§6). A curadoria julga; não edita o conteúdo. */
export default async function Anfitrioes(props: PageProps<"/admin/anfitrioes">) {
  const { pendencias } = await props.searchParams;
  const soComPendencias = pendencias === "1";
  const linhas = listarAnfitrioes({ soComPendencias }).map((l) => ({
    id: l.conta.id,
    nome: l.perfil?.nome ?? l.conta.pseudonimo,
    email: l.conta.email,
    papel: l.conta.papel,
    salas: l.salas,
    publicados: l.publicados,
    pendentes: l.pendentes,
    maisAntigo: l.maisAntigo,
  }));
  const total = totalPendenteRevisao();
  return (
    <>
      <header className="flex flex-col gap-3">
        <p className="sdb-meta sdb-secondary">Curadoria</p>
        <h1 className="sdb-title-1">Revisão de anfitriões</h1>
        <p className="sdb-body-sm sdb-secondary max-w-read">
          {total
            ? `${total} ${total === 1 ? "item espera" : "itens esperam"} decisão.`
            : "Nenhum item espera decisão agora."}{" "}
          A curadoria aprova ou reprova com motivo, sem editar o que o anfitrião escreveu.
        </p>
      </header>
      <ListaAnfitrioesAdmin linhas={linhas} soComPendencias={soComPendencias} />
    </>
  );
}
