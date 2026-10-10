"use client";

import { type ReactNode, useEffect, useState } from "react";
import { cx } from "@/lib/cx";
import { Icon } from "./Icon";

/**
 * Barra superior (BarraSuperior): título da página e saudação à esquerda;
 * busca, aparência e conta à direita. Ao rolar, entra na camada flutuante.
 */
export function BarraSuperior({
  titulo,
  saudacao,
  onBuscar,
  acoes,
}: {
  titulo: string;
  saudacao?: string;
  /** Sem ele, a barra não mostra a busca (ex.: curadoria). */
  onBuscar?: () => void;
  /** Aparência e conta (e, no futuro, notificações). */
  acoes: ReactNode;
}) {
  const [rolou, setRolou] = useState(false);
  useEffect(() => {
    const medir = () => setRolou(window.scrollY > 4);
    medir();
    window.addEventListener("scroll", medir, { passive: true });
    return () => window.removeEventListener("scroll", medir);
  }, []);

  return (
    <header className={cx("sdb-topbar", rolou && "is-scrolled")}>
      <div className="sdb-topbar__titles">
        <p className="sdb-topbar__title">{titulo}</p>
        {saudacao && <p className="sdb-topbar__greeting">{saudacao}</p>}
      </div>
      <div className="sdb-topbar__actions">
        {onBuscar && (
          <button
            type="button"
            className="sdb-topbar__search"
            aria-label="Buscar no acervo"
            aria-keyshortcuts="Meta+K Control+K"
            aria-haspopup="dialog"
            onClick={onBuscar}
          >
            <Icon name="busca" />
            <span>Buscar no acervo</span>
            <span className="sdb-kbd" aria-hidden="true">
              ⌘K
            </span>
          </button>
        )}
        {/* TODO(notificacoes): sininho entra aqui quando houver notificações. */}
        {acoes}
      </div>
    </header>
  );
}
