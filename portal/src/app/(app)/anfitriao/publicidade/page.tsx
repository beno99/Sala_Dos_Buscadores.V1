import type { Metadata, Route } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ds/Button";
import { formatarData } from "@/lib/texto";
import { anfitriaoDaPagina } from "@/server/anfitriao/pagina";
import { anunciosDoDono } from "@/server/anuncios";

export const metadata: Metadata = { title: "Publicidade" };

export default async function PaginaPublicidade() {
  const membro = await anfitriaoDaPagina();
  const anuncios = anunciosDoDono(membro.id);
  return (
    <>
      <header className="flex flex-col gap-4">
        <h1 className="sdb-title-1">Publicidade</h1>
        <p className="sdb-body-sm sdb-secondary max-w-read">
          Anúncios publicados aparecem no Portal. Rascunhos ficam visíveis só para você.
        </p>
        <div className="sdb-row">
          <ButtonLink href={"/anfitriao/publicidade/nova" as Route} variant="primary" icon="mais">
            Criar publicidade
          </ButtonLink>
        </div>
      </header>
      {anuncios.length === 0 ? (
        <p className="sdb-body-sm sdb-secondary">Você ainda não criou nenhum anúncio.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {anuncios.map((a) => (
            <li key={a.id} className="sdb-material sdb-panel flex flex-col gap-1">
              <Link className="sdb-link" href={`/anfitriao/publicidade/${a.id}` as Route}>
                {a.titulo || "Anúncio sem título"}
              </Link>
              <span className="sdb-footnote">
                {a.status === "publicado" ? "Publicado no Portal" : "Rascunho"} · atualizado em{" "}
                <time dateTime={a.atualizadoEm}>{formatarData(a.atualizadoEm)}</time>
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
