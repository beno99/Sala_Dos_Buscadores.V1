"use client";

import type { Route } from "next";
import Link from "next/link";
import { cx } from "@/lib/cx";
import { Button } from "./Button";
import { Icon, type IconName } from "./Icon";

export interface ItemNavegacao {
  href: Route;
  rotulo: string;
  icone: IconName;
  ativo: boolean;
  contagem?: number;
  separarAntes?: boolean;
}

/** Navegação lateral (NavegacaoLateral): vidro, recolhível para só ícones; no celular vai para um Drawer. */
export function NavegacaoLateral({
  titulo,
  itens,
  recolhida = false,
  onAlternar,
  sheet,
  onNavegar,
}: {
  titulo: string;
  itens: ItemNavegacao[];
  recolhida?: boolean;
  onAlternar?: () => void;
  /** Dentro de um Drawer: sem vidro próprio e sem botão de recolher. */
  sheet?: boolean;
  onNavegar?: () => void;
}) {
  return (
    <nav
      className={cx("sdb-sidenav", recolhida && !sheet && "is-collapsed", sheet && "sdb-sidenav--sheet")}
      aria-label={titulo}
    >
      {!sheet && (
        <div className="sdb-sidenav__head">
          <span className="sdb-sidenav__title">{titulo}</span>
          {onAlternar && (
            <Button
              iconOnly
              size="sm"
              icon={recolhida ? "chevronDireita" : "chevronEsquerda"}
              aria-label={recolhida ? "Expandir navegação" : "Recolher navegação"}
              aria-expanded={!recolhida}
              tip={recolhida ? "Expandir" : "Recolher"}
              tipSide="bottom"
              onClick={onAlternar}
            />
          )}
        </div>
      )}
      {itens.map((i) => (
        <div key={i.href} className="contents">
          {i.separarAntes && <div className="sdb-sidenav__sep" role="separator" />}
          <Link
            href={i.href}
            className="sdb-sidenav__item"
            aria-current={i.ativo ? "page" : undefined}
            data-tip={recolhida && !sheet ? i.rotulo : undefined}
            data-tip-side={recolhida && !sheet ? "bottom" : undefined}
            onClick={onNavegar}
          >
            <Icon name={i.icone} />
            <span className="sdb-sidenav__label">{i.rotulo}</span>
            {i.contagem !== undefined && <span className="sdb-sidenav__count">{i.contagem}</span>}
          </Link>
        </div>
      ))}
    </nav>
  );
}
