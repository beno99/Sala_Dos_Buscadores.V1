"use client";

import type { Route } from "next";
import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import { cx } from "@/lib/cx";
import { Icon } from "./Icon";

/** Trilha das páginas de detalhe: itens anteriores com link e o item atual. */
export interface TrilhaBarra {
  itens: { href: Route; rotulo: string }[];
  atual: string;
}

/** A segunda linha é a saudação (Portal) ou a trilha (páginas de detalhe), nunca as duas. */
type SegundaLinha = { saudacao?: string; trilha?: never } | { trilha?: TrilhaBarra; saudacao?: never };

/**
 * Barra superior (BarraSuperior): título da página e saudação ou trilha à
 * esquerda; busca, aparência e conta à direita. Ao rolar, entra na camada
 * flutuante. A trilha substitui a cápsula de Breadcrumbs nas páginas de detalhe.
 */
export function BarraSuperior({
  titulo,
  saudacao,
  trilha,
  onBuscar,
  acoes,
}: {
  titulo: string;
  /** Sem ele, a barra não mostra a busca (ex.: curadoria). */
  onBuscar?: () => void;
  /** Aparência e conta (e, no futuro, notificações). */
  acoes: ReactNode;
} & SegundaLinha) {
  const [tecla, setTecla] = useState("Ctrl+K");
  useEffect(() => {
    setTecla(/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘K" : "Ctrl+K");
  }, []);
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
        {trilha && (
          <nav className="sdb-topbar__trail" aria-label="Trilha">
            <ol>
              {trilha.itens.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.rotulo}</Link>
                </li>
              ))}
              <li title={trilha.atual}>
                <span aria-current="page">{trilha.atual}</span>
              </li>
            </ol>
          </nav>
        )}
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
              {tecla}
            </span>
          </button>
        )}
        {/* TODO(notificacoes): sininho entra aqui quando houver notificações. */}
        {acoes}
      </div>
    </header>
  );
}
