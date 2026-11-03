import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";
import { Alerta } from "@/components/ds/Alerta";
import { ButtonLink } from "@/components/ds/Button";
import { SeloStatus } from "@/components/ds/Curadoria";
import { salasParaCriar } from "@/server/anfitriao/consultas";
import { anfitriaoDaPagina } from "@/server/anfitriao/pagina";

export const metadata: Metadata = { title: "Criar artigo" };

/**
 * O artigo nasce dentro de uma Sala. Com uma Sala só, vai direto para o
 * editor; com várias, o anfitrião escolhe; sem nenhuma, cria a Sala antes.
 */
export default async function CriarArtigo() {
  const membro = await anfitriaoDaPagina();
  const salas = salasParaCriar(membro.id);
  if (salas.length === 1) redirect(`/anfitriao/salas/${salas[0]?.id}/artigos/novo` as Route);
  return (
    <>
      <header className="flex flex-col gap-3">
        <h1 className="sdb-title-1">Criar artigo</h1>
        <p className="sdb-body-sm sdb-secondary max-w-read">Escolha a Sala em que o artigo vai morar.</p>
      </header>
      {salas.length === 0 ? (
        <Alerta
          title="Crie uma Sala primeiro"
          actions={
            <ButtonLink href={"/anfitriao/salas/nova" as Route} variant="primary" size="sm" icon="mais">
              Criar Sala
            </ButtonLink>
          }
        >
          Todo artigo pertence a uma das suas Salas.
        </Alerta>
      ) : (
        <div className="sdb-material sdb-list">
          {salas.map((s) => (
            <div key={s.id} className="sdb-list-row">
              <div className="flex flex-col gap-1">
                <span className="sdb-callout">{s.nome}</span>
                <SeloStatus status={s.status} />
              </div>
              <ButtonLink
                href={`/anfitriao/salas/${s.id}/artigos/novo` as Route}
                variant="secondary"
                size="sm"
                icon="artigo"
              >
                Escrever nesta Sala
              </ButtonLink>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
