"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState, useTransition } from "react";
import { Icon } from "@/components/ds/Icon";

/**
 * Filtros de uma lista da curadoria, sincronizados com a URL (a exportação
 * CSV lê os mesmos parâmetros). A busca por título espera o fim da digitação.
 */
export function useFiltrosNaUrl<F extends object>(
  base: string,
  filtros: F,
  paraQuery: (f: object) => string,
) {
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  const aplicar = (mudanca: Partial<F>) => {
    const novo = {
      ...filtros,
      ...mudanca,
      pagina: "pagina" in mudanca ? (mudanca as { pagina: number }).pagina : 1,
    };
    iniciar(() => router.replace(`${base}${paraQuery(novo)}` as Route, { scroll: false }));
  };
  return { aplicar, pendente };
}

export function CampoBuscaLista({
  valor,
  onBuscar,
  rotulo,
}: {
  valor: string;
  onBuscar: (q: string) => void;
  rotulo: string;
}) {
  const [texto, setTexto] = useState(valor);
  const primeira = useRef(true);
  // biome-ignore lint/correctness/useExhaustiveDependencies: dispara só quando o texto muda.
  useEffect(() => {
    if (primeira.current) {
      primeira.current = false;
      return;
    }
    const t = setTimeout(() => onBuscar(texto), 350);
    return () => clearTimeout(t);
  }, [texto]);
  return (
    <div className="sdb-field">
      <label className="sdb-label" htmlFor="busca-lista">
        {rotulo}
      </label>
      <div className="sdb-control sdb-control--search">
        <Icon name="busca" />
        <input id="busca-lista" type="search" value={texto} onChange={(e) => setTexto(e.target.value)} />
      </div>
    </div>
  );
}

/** Área dos filtros: material com grade responsiva. */
export function PainelFiltros({ children }: { children: ReactNode }) {
  return (
    <section className="sdb-material sdb-panel" aria-label="Filtros da lista">
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,11rem),1fr))]">
        {children}
      </div>
    </section>
  );
}
