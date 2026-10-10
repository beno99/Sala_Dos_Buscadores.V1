"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { type ReactNode, useState, useTransition } from "react";
import { Button } from "@/components/ds/Button";
import { Drawer } from "@/components/ds/Drawer";
import {
  type AcervoBusca,
  buscar,
  contarFiltrosAtivos,
  FILTROS_VAZIOS,
  type FiltrosBusca,
  paraQueryString,
} from "./busca";
import { FiltrosBuscaPainel, FiltrosPainel } from "./FiltrosBusca";

/**
 * Resultados com filtros (RF-20). No desktop, o painel fica ao lado; em telas
 * estreitas, vai para um Drawer aberto por "Filtros (n)". Os filtros só valem
 * depois de "Ver n resultados", que mostra a contagem ao vivo.
 */
export function AreaResultados({
  filtros,
  acervo,
  children,
}: {
  filtros: FiltrosBusca;
  /** Acervo publicado, vindo do servidor, para a contagem ao vivo dos filtros. */
  acervo: AcervoBusca;
  children: ReactNode;
}) {
  const router = useRouter();
  const [rascunho, setRascunho] = useState(filtros);
  const [gavetaAberta, setGavetaAberta] = useState(false);
  const [aplicando, iniciar] = useTransition();
  const ativos = contarFiltrosAtivos(filtros);
  const total = buscar(rascunho, acervo).itens.length;

  const aplicar = () => {
    setGavetaAberta(false);
    iniciar(() => router.push(`/comparar${paraQueryString(rascunho)}` as Route, { scroll: false }));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <div className="flex min-w-0 flex-col gap-4" aria-busy={aplicando || undefined}>
        <div className="lg:hidden">
          <Button variant="glass" icon="filtro" onClick={() => setGavetaAberta(true)}>
            {ativos ? `Filtros (${ativos})` : "Filtros"}
          </Button>
        </div>
        {children}
      </div>

      <aside className="hidden lg:sticky lg:top-6 lg:block" aria-label="Filtros de busca">
        <FiltrosBuscaPainel rascunho={rascunho} acervo={acervo} onChange={setRascunho} onAplicar={aplicar} />
      </aside>

      <Drawer
        open={gavetaAberta}
        onClose={() => setGavetaAberta(false)}
        title="Filtros"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setRascunho({ ...FILTROS_VAZIOS, q: rascunho.q, modo: rascunho.modo })}
            >
              Limpar
            </Button>
            <Button variant="primary" onClick={aplicar}>
              {total === 1 ? "Ver 1 resultado" : `Ver ${total} resultados`}
            </Button>
          </>
        }
      >
        <FiltrosPainel rascunho={rascunho} acervo={acervo} onChange={setRascunho} />
      </Drawer>
    </div>
  );
}
