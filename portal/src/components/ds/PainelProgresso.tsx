import type { ReactNode } from "react";

/**
 * Painel de progresso (PainelProgresso › `.sdb-panel--progresso`): um contêiner só, na
 * grade de quatro colunas dos indicadores. Leitura nas colunas 1–2 e anúncio
 * nas 3–4; sem anúncio, a leitura ocupa as quatro.
 */
export function PainelProgresso({
  tituloId,
  indicadores,
  anuncio,
  children,
}: {
  /** Id do `h2` "Seu progresso", que nomeia o painel. */
  tituloId: string;
  indicadores: ReactNode;
  anuncio?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="sdb-panel sdb-panel--progresso sdb-material" aria-labelledby={tituloId}>
      {indicadores}
      <div className="sdb-panel__main">{children}</div>
      {anuncio && <div className="sdb-panel__ad">{anuncio}</div>}
    </section>
  );
}

/** Bloco da coluna de leitura: `h3`, subtítulo e a lista. */
export function BlocoPainel({
  id,
  titulo,
  sub,
  children,
}: {
  id: string;
  titulo: string;
  sub?: string;
  children: ReactNode;
}) {
  return (
    <section className="sdb-panel__block" aria-labelledby={id}>
      <div className="sdb-panel__head">
        <h3 id={id} className="sdb-panel__title">
          {titulo}
        </h3>
        {sub && <p className="sdb-panel__sub">{sub}</p>}
      </div>
      {children}
    </section>
  );
}
