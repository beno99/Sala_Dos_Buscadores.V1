import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/ds/Button";
import { Candidatura } from "@/features/anfitriao/ui/Candidatura";
import { ultimaCandidaturaDe } from "@/server/anfitriao/usuarios";
import { membroAtual } from "@/server/sessao";

export const metadata: Metadata = { title: "Seja anfitrião" };

export default async function SejaAnfitriao() {
  const membro = await membroAtual();
  if (membro?.papel === "anfitriao") redirect("/anfitriao" as Route);
  if (membro?.papel !== "membro") redirect("/" as Route);
  return (
    <section className="flex max-w-read flex-col gap-6" aria-labelledby="titulo-seja-anfitriao">
      <header className="flex flex-col gap-3">
        <p className="sdb-meta sdb-secondary">Portal</p>
        <h1 id="titulo-seja-anfitriao" className="sdb-title-1">
          Seja anfitrião
        </h1>
        <p className="sdb-body-sm sdb-secondary">
          Mantenha uma Sala própria com seus estudos e fontes. A curadoria revisa cada Sala antes de ir ao ar.
        </p>
      </header>
      <section className="sdb-material sdb-panel" aria-label="Candidatura">
        <Candidatura ultima={ultimaCandidaturaDe(membro.id)} pseudonimo={membro.pseudonimo} />
      </section>
      <ButtonLink href={"/" as Route} variant="plain" size="sm">
        Voltar para o portal
      </ButtonLink>
    </section>
  );
}
