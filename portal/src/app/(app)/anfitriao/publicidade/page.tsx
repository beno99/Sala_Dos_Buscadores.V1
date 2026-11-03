import type { Metadata, Route } from "next";
import { Alerta } from "@/components/ds/Alerta";
import { ButtonLink } from "@/components/ds/Button";
import { listarDoDono } from "@/modules/publicidade/publicidade.repositorio";
import { anfitriaoDaPagina } from "@/server/anfitriao/pagina";

export const metadata: Metadata = { title: "Minha publicidade" };
export default async function MinhaPublicidade() {
  const membro = await anfitriaoDaPagina();
  const itens = await listarDoDono(membro.id).catch(() => null);
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <p className="sdb-meta sdb-secondary">Área do anfitrião</p>
        <h1 className="sdb-title-1">Minha publicidade</h1>
        <p className="sdb-body-sm sdb-secondary">
          Apresente seus produtos no Portal. Rascunhos ficam visíveis apenas para você.
        </p>
        <div>
          <ButtonLink href={"/anfitriao/publicidade/nova" as Route} variant="primary">
            Criar publicidade
          </ButtonLink>
        </div>
      </header>
      {itens === null ? (
        <Alerta title="Publicidade indisponível">
          Não foi possível carregar seus anúncios. Tente novamente mais tarde.
        </Alerta>
      ) : itens.length === 0 ? (
        <p className="sdb-body">Você ainda não criou anúncios. Comece com um rascunho.</p>
      ) : (
        <ul className="flex flex-col gap-4" aria-label="Meus anúncios">
          {itens.map((a) => (
            <li key={a.id} className="sdb-material sdb-panel">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="sdb-meta sdb-secondary">
                    {a.status === "publicado" ? "Publicado no Portal" : "Rascunho · só você"}
                  </p>
                  <h2 className="sdb-title-3">{a.titulo || "Anúncio sem título"}</h2>
                </div>
                <ButtonLink
                  href={`/anfitriao/publicidade/${a.id}` as Route}
                  variant="secondary"
                  aria-label={`Editar ${a.titulo || "anúncio sem título"}`}
                >
                  Editar anúncio
                </ButtonLink>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
