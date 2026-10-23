import type { Metadata, Route } from "next";
import { Alerta } from "@/components/ds/Alerta";
import { ButtonLink } from "@/components/ds/Button";
import { Candidatura } from "@/features/anfitriao/ui/Candidatura";
import { ultimaCandidaturaDe } from "@/server/anfitriao/usuarios";
import { membroAtual } from "@/server/sessao";

export const metadata: Metadata = { title: "Ajustes" };

/* TODO(redesign): versão funcional desta seção na Fase D; o redesenho visual aguarda referências. */
export default async function Pagina() {
  const membro = await membroAtual();
  return (
    <section className="flex max-w-read flex-col gap-6" aria-labelledby="titulo-secao">
      <div className="flex flex-col gap-4">
        <h1 id="titulo-secao" className="sdb-title-1">
          Ajustes
        </h1>
        <p className="sdb-body-sm sdb-secondary">Aparência, níveis e conquistas, preferências e conta.</p>
        <Alerta title="Seção em preparação">Esta seção entra na próxima etapa do redesenho do portal.</Alerta>
      </div>

      {membro?.papel === "membro" && (
        <section className="sdb-material sdb-panel" aria-labelledby="titulo-anfitriao">
          <h2 id="titulo-anfitriao" className="sdb-headline">
            Ser anfitrião
          </h2>
          <Candidatura ultima={ultimaCandidaturaDe(membro.id)} pseudonimo={membro.pseudonimo} />
        </section>
      )}
      {membro?.papel === "anfitriao" && (
        <section className="sdb-material sdb-panel" aria-labelledby="titulo-anfitriao">
          <h2 id="titulo-anfitriao" className="sdb-headline">
            Você é anfitrião
          </h2>
          <p className="sdb-body-sm">Suas Salas, artigos e perfil público ficam em Minhas Salas.</p>
          <div className="sdb-row">
            <ButtonLink href={"/anfitriao" as Route} variant="tinted" icon="anfitriao">
              Ir para Minhas Salas
            </ButtonLink>
            <ButtonLink href={"/anfitriao/perfil" as Route} variant="plain">
              Editar perfil público
            </ButtonLink>
          </div>
        </section>
      )}
    </section>
  );
}
