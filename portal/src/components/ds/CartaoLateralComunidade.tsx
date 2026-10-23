import type { ReactNode } from "react";

export function CartaoLateralComunidade({
  id,
  titulo,
  children,
}: {
  id: string;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section className="sdb-community-side" aria-labelledby={id}>
      <header className="sdb-community-side__head">
        <h2 id={id} className="sdb-title-2">
          {titulo}
        </h2>
      </header>
      {children}
    </section>
  );
}
