"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { BarraSuperior } from "@/components/ds/BarraSuperior";
import { ButtonLink } from "@/components/ds/Button";
import { Menu } from "@/components/ds/Menu";
import { iniciaisDe } from "@/components/layout/navegacao";
import { MenuAparencia } from "@/features/aparencia/MenuAparencia";
import type { Aparencia } from "@/features/aparencia/tema";
import { useSessao } from "@/features/auth/SessaoProvider";

/** Topo do anfitrião: a mesma Barra superior da curadoria, sem busca e com o caminho de volta ao Portal. */
export function TopoAnfitriao({
  aparencia,
  lateralTranslucida,
}: {
  aparencia: Aparencia;
  lateralTranslucida?: boolean;
}) {
  const { membro, sair } = useSessao();
  const router = useRouter();
  return (
    <BarraSuperior
      titulo="Anfitrião"
      acoes={
        <>
          <ButtonLink href="/" variant="secondary" size="sm" icon="inicio">
            Ir para o Portal
          </ButtonLink>
          <MenuAparencia inicial={aparencia} lateralInicial={lateralTranslucida} />
          {membro && (
            <Menu
              right
              triggerClassName="sdb-topbar__account"
              triggerLabel={`Conta de ${membro.pseudonimo}`}
              titulo={`Conectado como ${membro.pseudonimo}`}
              items={[
                { label: "Ver meu perfil", icon: "pessoa", onSelect: () => router.push("/perfil" as Route) },
                { label: "Sair", icon: "sair", onSelect: () => sair() },
              ]}
              trigger={
                <span className="sdb-avatar" aria-hidden="true">
                  {iniciaisDe(membro.pseudonimo)}
                </span>
              }
            />
          )}
        </>
      }
    />
  );
}
