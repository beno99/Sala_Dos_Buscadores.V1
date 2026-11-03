import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
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

function ItemPagina({
  destino,
  href,
  onPagina,
  children,
  ...props
}: {
  destino: number;
  href?: string;
  onPagina?: (p: number) => void;
  children: ReactNode;
  className: string;
  "aria-label": string;
  "aria-current"?: "page";
}) {
  if (onPagina)
    return (
      <button type="button" {...props} onClick={() => onPagina(destino)}>
        {children}
      </button>
    );
  return (
    <Link href={(href ?? "") as Route} {...props}>
      {children}
    </Link>
  );
}

/**
 * Paginação numerada (Paginacao) com links; abaixo de 520 px vira "Página n de m".
 * Com `onPagina` (listas filtradas no navegador), os itens viram botões.
 */
export function Paginacao({
  pagina,
  total,
  href,
  onPagina,
  rotulo = "Paginação",
}: {
  pagina: number;
  total: number;
  href?: (p: number) => string;
  onPagina?: (p: number) => void;
  rotulo?: string;
}) {
  if (total <= 1) return null;
  const alvo = (p: number) => ({ destino: p, href: href?.(p), onPagina });
  return (
    <nav className="sdb-pages" aria-label={rotulo}>
      {pagina > 1 ? (
        <ItemPagina
          className="sdb-page sdb-page--nav no-underline"
          {...alvo(pagina - 1)}
          aria-label="Página anterior"
        >
          <Icon name="chevronEsquerda" size="sm" />
          <span>Anterior</span>
        </ItemPagina>
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
          <ItemPagina
            key={p}
            className="sdb-page no-underline"
            {...alvo(p)}
            aria-current={p === pagina ? "page" : undefined}
            aria-label={`Página ${p}`}
          >
            {p}
          </ItemPagina>
        ),
      )}
      <span className="sdb-pages__compact">
        Página {pagina} de {total}
      </span>
      {pagina < total ? (
        <ItemPagina
          className="sdb-page sdb-page--nav no-underline"
          {...alvo(pagina + 1)}
          aria-label="Próxima página"
        >
          <span>Próxima</span>
          <Icon name="chevronDireita" size="sm" />
        </ItemPagina>
      ) : (
        <button type="button" className="sdb-page sdb-page--nav" disabled>
          <span>Próxima</span>
          <Icon name="chevronDireita" size="sm" />
        </button>
      )}
    </nav>
  );
}
