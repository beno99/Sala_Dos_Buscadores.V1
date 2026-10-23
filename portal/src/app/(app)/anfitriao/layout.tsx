import type { Metadata, Route } from "next";
import type { ReactNode } from "react";
import { Alerta } from "@/components/ds/Alerta";
import { ButtonLink } from "@/components/ds/Button";
import { acessoAtual } from "@/server/sessao";

export const metadata: Metadata = {
  title: { default: "Minhas Salas", template: "%s · Minhas Salas · A Sala dos Buscadores" },
  robots: { index: false, follow: false },
};

/**
 * Área do anfitrião. A sessão já foi conferida no layout de (app); aqui vale
 * o papel: só anfitrião entra. Membro e administrador veem uma mensagem, sem
 * listar rotas internas. Cada página e cada ação conferem de novo a posse.
 */
export default async function LayoutAnfitriao({ children }: { children: ReactNode }) {
  const acesso = await acessoAtual();
  if (acesso.tipo === "anfitriao") return <div className="flex flex-col gap-8">{children}</div>;
  return (
    <div className="flex max-w-read flex-col gap-4">
      <h1 className="sdb-title-1">Acesso restrito</h1>
      {acesso.tipo === "admin" ? (
        <Alerta
          title="Esta área é dos anfitriões"
          actions={
            <ButtonLink href={"/admin" as Route} variant="secondary" size="sm">
              Ir para a Curadoria
            </ButtonLink>
          }
        >
          A curadoria revisa o que os anfitriões enviam, mas não escreve por eles: a revisão fica na
          Curadoria.
        </Alerta>
      ) : (
        <Alerta
          title="Esta área é dos anfitriões"
          actions={
            <ButtonLink href={"/ajustes" as Route} variant="secondary" size="sm">
              Quero ser anfitrião
            </ButtonLink>
          }
        >
          Anfitriões mantêm Salas próprias, revisadas pela curadoria. Para se candidatar, use os Ajustes.
        </Alerta>
      )}
    </div>
  );
}
