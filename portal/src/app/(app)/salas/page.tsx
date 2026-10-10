import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { CardSala } from "@/components/ds/CardSala";
import { listarSalas } from "@/data/repositorio";
import { imagem } from "@/server/imagens";

export const metadata: Metadata = { title: "Salas" };

/** Todas as Salas abertas (RF-09). TODO(redesign): aguarda referências. */
export default async function SalasPage() {
  const salas = await listarSalas();
  return (
    <section className="flex flex-col gap-4" aria-labelledby="titulo-salas">
      <div className="flex flex-col gap-1">
        <h1 id="titulo-salas" className="sdb-title-1">
          Salas
        </h1>
        <p className="sdb-footnote">
          {salas.length} Salas abertas, em ordem alfabética. A ordem não indica importância; novas Salas
          entram nos próximos ciclos.
        </p>
      </div>
      <div className="sdb-grid" style={{ "--sdb-col": "300px" } as CSSProperties}>
        {salas.map((s) => (
          <CardSala key={s.slug} sala={s} imagem={imagem("salas", s.slug)} />
        ))}
      </div>
    </section>
  );
}
