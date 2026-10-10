import type { Route } from "next";
import Link from "next/link";
import { Icon } from "./Icon";

/** Páginas visíveis: primeira, última, atual e vizinhas; o resto vira "…". */
export function paginasVisiveis(atual: number, total: number): (number | "…")[] {
  const set = new Set([1, total, atual - 1, atual, atual + 1].filter((p) => p >= 1 && p <= total));
  const ordenadas = [...set].sort((a, b) => a - b);
  const saida: (number | "…")[] = [];
  for (const [i, p] of ordenadas.entries()) {
    const anterior = ordenadas[i - 1];
    if (anterior !== undefined && p - anterior > 1) saida.push("…");
    saida.push(p);
  }
  return saida;
}

/** Paginação numerada (Paginacao) com links; abaixo de 520 px vira "Página n de m". */
export function Paginacao({
  pagina,
  total,
  href,
  rotulo = "Paginação",
}: {
  pagina: number;
  total: number;
  href: (p: number) => string;
  rotulo?: string;
}) {
  if (total <= 1) return null;
  return (
    <nav className="sdb-pages" aria-label={rotulo}>
      {pagina > 1 ? (
        <Link
          className="sdb-page sdb-page--nav no-underline"
          href={href(pagina - 1) as Route}
          aria-label="Página anterior"
        >
          <Icon name="chevronEsquerda" size="sm" />
          <span>Anterior</span>
        </Link>
      ) : (
        <button type="button" className="sdb-page sdb-page--nav" disabled>
          <Icon name="chevronEsquerda" size="sm" />
          <span>Anterior</span>
        </button>
      )}
      {paginasVisiveis(pagina, total).map((p, i) =>
        p === "…" ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: o marcador de intervalo não tem identidade própria.
          <span key={`gap-${i}`} className="sdb-pages__gap">
            …
          </span>
        ) : (
          <Link
            key={p}
            className="sdb-page no-underline"
            href={href(p) as Route}
            aria-current={p === pagina ? "page" : undefined}
            aria-label={`Página ${p}`}
          >
            {p}
          </Link>
        ),
      )}
      <span className="sdb-pages__compact">
        Página {pagina} de {total}
      </span>
      {pagina < total ? (
        <Link
          className="sdb-page sdb-page--nav no-underline"
          href={href(pagina + 1) as Route}
          aria-label="Próxima página"
        >
          <span>Próxima</span>
          <Icon name="chevronDireita" size="sm" />
        </Link>
      ) : (
        <button type="button" className="sdb-page sdb-page--nav" disabled>
          <span>Próxima</span>
          <Icon name="chevronDireita" size="sm" />
        </button>
      )}
    </nav>
  );
}
