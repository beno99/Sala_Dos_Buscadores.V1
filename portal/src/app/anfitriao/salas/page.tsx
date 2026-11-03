import type { Metadata, Route } from "next";
import { ButtonLink } from "@/components/ds/Button";
import { ListaSalasAnfitriao } from "@/features/anfitriao/ui/ListaSalasAnfitriao";
import { painelDoAnfitriao } from "@/server/anfitriao/consultas";
import { anfitriaoDaPagina } from "@/server/anfitriao/pagina";

export const metadata: Metadata = { title: "Minhas Salas" };

/** As Salas do anfitrião, cada uma com os artigos dela. */
export default async function MinhasSalas() {
  const membro = await anfitriaoDaPagina();
  const p = painelDoAnfitriao(membro.id);
  return (
    <>
      <header className="flex flex-col gap-4">
        <h1 className="sdb-title-1">Minhas Salas</h1>
        <p className="sdb-body-sm sdb-secondary max-w-read">
          Abra uma Sala para editar, escrever artigos nela e enviar para a revisão da curadoria.
        </p>
        <div className="sdb-row">
          <ButtonLink href={"/anfitriao/salas/nova" as Route} variant="primary" icon="mais">
            Criar Sala
          </ButtonLink>
        </div>
      </header>
      <ListaSalasAnfitriao
        salas={p.salas.map(({ sala, artigos }) => ({
          id: sala.id,
          nome: sala.nome,
          status: sala.status,
          atualizadaEm: sala.atualizadaEm,
          artigos,
          novidades: p.novidades.filter((n) => n.salaId === sala.id).length,
        }))}
      />
    </>
  );
}
