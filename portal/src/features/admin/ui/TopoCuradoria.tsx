"use client";

import { BarraSuperior } from "@/components/ds/BarraSuperior";
import { ButtonLink } from "@/components/ds/Button";
import { Menu } from "@/components/ds/Menu";
import { iniciaisDe } from "@/components/layout/navegacao";
import { MenuAparencia } from "@/features/aparencia/MenuAparencia";
import type { Aparencia } from "@/features/aparencia/tema";
import { useSessao } from "@/features/auth/SessaoProvider";

/** Topo da curadoria: a mesma Barra superior do app, sem busca e com o caminho de volta ao Portal. */
export function TopoCuradoria({ aparencia }: { aparencia: Aparencia }) {
  const { membro, sair } = useSessao();
  return (
    <BarraSuperior
      titulo="Curadoria"
      acoes={
        <>
          <ButtonLink href="/" variant="secondary" size="sm" icon="inicio">
            Ir para o Portal
          </ButtonLink>
          <MenuAparencia inicial={aparencia} />
          {membro && (
            <Menu
              right
              triggerClassName="sdb-topbar__account"
              triggerLabel={`Conta de ${membro.pseudonimo}`}
              titulo={`Conectado como ${membro.pseudonimo}`}
              items={[{ label: "Sair", icon: "sair", onSelect: () => sair() }]}
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
