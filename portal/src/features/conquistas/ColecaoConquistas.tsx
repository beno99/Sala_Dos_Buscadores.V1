"use client";

import { useState } from "react";
import { Button } from "@/components/ds/Button";
import { CardConquista, type ConquistaVisual } from "@/components/ds/Conquista";
import "./conquistas.css";

type Filtro = "Todas" | "Obtidas" | "Bloqueadas";

/** Coleção de conquistas: grade de cards de Conquista (`.sdb-badge-grid`), com filtro por estado. */
export function ColecaoConquistas({
  conquistas,
  compacta = false,
}: {
  conquistas: ConquistaVisual[];
  compacta?: boolean;
}) {
  const [filtro, setFiltro] = useState<Filtro>("Todas");
  const obtidas = conquistas.filter((c) => c.obtida).length;
  const lista = conquistas.filter((c) => filtro === "Todas" || c.obtida === (filtro === "Obtidas"));
  return (
    <div className="sdb-collection">
      <div className="sdb-collection__toolbar">
        {compacta ? (
          <p className="sdb-footnote m-0">Pequenas marcas da sua jornada no acervo.</p>
        ) : (
          <div className="sdb-collection__filters" role="group" aria-label="Filtrar conquistas">
            {(["Todas", "Obtidas", "Bloqueadas"] as const).map((f) => (
              <button key={f} type="button" aria-pressed={filtro === f} onClick={() => setFiltro(f)}>
                {f}
                <span>
                  {f === "Todas"
                    ? conquistas.length
                    : f === "Obtidas"
                      ? obtidas
                      : conquistas.length - obtidas}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="sdb-sr" role="status">
        {lista.length} {lista.length === 1 ? "conquista exibida" : "conquistas exibidas"}
      </p>
      <ul className="sdb-badge-grid" aria-label="Coleção de conquistas">
        {lista.map((c) => (
          <li key={c.id}>
            <CardConquista c={c} numero={conquistas.indexOf(c) + 1} />
          </li>
        ))}
      </ul>
      {lista.length === 0 && (
        <div className="sdb-collection__empty">
          <h3 className="sdb-title-2">
            {filtro === "Obtidas" ? "Sua primeira descoberta está por vir" : "A coleção está completa"}
          </h3>
          <p>
            {filtro === "Obtidas"
              ? "Continue sua leitura. Cada conquista encontra seu tempo."
              : "Todas as conquistas desta coleção já fazem parte da sua coleção."}
          </p>
          <Button variant="secondary" onClick={() => setFiltro("Todas")}>
            Ver todas
          </Button>
        </div>
      )}
    </div>
  );
}
