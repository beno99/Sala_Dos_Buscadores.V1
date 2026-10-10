"use client";

import type { Route } from "next";
import Link from "next/link";
import { Icon, type IconName } from "./Icon";

export interface AbaApp {
  href: Route;
  rotulo: string;
  icone: IconName;
  ativa: boolean;
}

/** Barra de abas do app (Tabs › `--app`): até 4 destinos e "Mais", na camada flutuante. */
export function BarraAbasApp({
  abas,
  onMais,
  maisAtivo,
}: {
  abas: AbaApp[];
  onMais: () => void;
  maisAtivo?: boolean;
}) {
  return (
    <nav className="sdb-tabbar sdb-tabbar--app" aria-label="Navegação principal">
      {abas.map((a) => (
        <Link key={a.href} href={a.href} aria-current={a.ativa ? "page" : undefined}>
          <Icon name={a.icone} />
          {a.rotulo}
        </Link>
      ))}
      <button
        type="button"
        aria-haspopup="dialog"
        aria-current={maisAtivo ? "page" : undefined}
        onClick={onMais}
      >
        <Icon name="reticencias" />
        Mais
      </button>
    </nav>
  );
}
