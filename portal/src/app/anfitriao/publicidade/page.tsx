import type { Metadata, Route } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ds/Button";
import { SeloStatus } from "@/components/ds/Curadoria";
import { revisaoDoAnuncio } from "@/features/anuncios/regras";
import { formatarData } from "@/lib/texto";
import { anunciosDoAnfitriao } from "@/server/anfitriao/consultas";
import { anfitriaoDaPagina } from "@/server/anfitriao/pagina";

export const metadata: Metadata = { title: "Publicidade" };

/** Anúncios do anfitrião. Os aprovados aparecem no Portal, na coluna ao lado de “Seu caminho”. */
export default async function PublicidadeDoAnfitriao() {
  const membro = await anfitriaoDaPagina();
  const anuncios = anunciosDoAnfitriao(membro.id);
  return (
    <>
      <header className="flex flex-col gap-4">
        <h1 className="sdb-title-1">Publicidade</h1>
        <p className="sdb-body-sm sdb-secondary max-w-read">
          Anúncios identificados como publicidade, com o nome do anunciante. A curadoria aprova cada um antes
          de ele aparecer no Portal: sem promessa de cura, manipulação religiosa ou urgência.
        </p>
        <div className="sdb-row">
          <ButtonLink href={"/anfitriao/publicidade/nova" as Route} variant="primary" icon="editar">
            Criar publicidade
          </ButtonLink>
        </div>
      </header>
      {anuncios.length === 0 ? (
        <p className="sdb-body-sm sdb-secondary">
          Você ainda não tem anúncios. Use “Criar publicidade” para começar.
        </p>
      ) : (
        <section className="sdb-material sdb-list" aria-label={`Seus anúncios · ${anuncios.length}`}>
          {anuncios.map((a) => (
            <div key={a.id} className="sdb-list-row">
              <div className="flex flex-col gap-1">
                <span className="sdb-callout">
                  <Link href={`/anfitriao/publicidade/${a.id}` as Route}>
                    {a.titulo || "Anúncio sem título"}
                  </Link>
                </span>
                <span className="sdb-footnote">
                  {a.anunciante || "Sem anunciante"} · atualizado em{" "}
                  {formatarData(a.atualizadoEm.slice(0, 10))}
                </span>
                {a.status === "reprovado" && revisaoDoAnuncio(a).ultimoMotivo && (
                  <span className="sdb-footnote">Motivo: {revisaoDoAnuncio(a).ultimoMotivo}</span>
                )}
                {a.status === "arquivado" && a.revisao?.oculto && (
                  <span className="sdb-footnote">
                    Arquivado pela curadoria (fora do Portal). Motivo: {a.revisao.oculto.motivo}
                  </span>
                )}
              </div>
              <SeloStatus status={a.status} />
            </div>
          ))}
        </section>
      )}
    </>
  );
}
