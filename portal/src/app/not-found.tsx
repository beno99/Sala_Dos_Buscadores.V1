import type { Route } from "next";
import { Alerta } from "@/components/ds/Alerta";
import { ButtonLink } from "@/components/ds/Button";

export default function NaoEncontrado() {
  return (
    <div className="flex max-w-read flex-col gap-4">
      <h1 className="sdb-title-1">Página não encontrada</h1>
      <Alerta
        title="Este endereço não leva a nenhuma Sala ou conteúdo do acervo"
        actions={
          <>
            <ButtonLink href={"/" as Route} variant="primary" size="sm">
              Ver as Salas
            </ButtonLink>
            <ButtonLink href={"/comparar" as Route} variant="secondary" size="sm">
              Buscar por tema
            </ButtonLink>
          </>
        }
      >
        O link pode estar incompleto ou o conteúdo pode ter mudado de lugar.
      </Alerta>
    </div>
  );
}
