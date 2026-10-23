import { createElement, type ReactNode } from "react";
import { renderizarTexto } from "@/design-system/marcacao.mjs";

/** A mesma gramática da biblioteca. React escapa texto; não há HTML do autor. */
export function TextoMarcado({
  texto,
  hrefRef,
}: {
  texto: string;
  hrefRef?: (n: number) => string;
}): ReactNode {
  return renderizarTexto(texto).map((p) => {
    const key = p.inicio;
    if (p.tipo === "texto") return p.texto;
    if (p.tipo === "ref") {
      const n = p.n ?? 0;
      const destino = hrefRef?.(n);
      return destino ? (
        <a key={key} className="sdb-ref" href={destino} aria-label={`Fonte ${n}`}>
          {n}
        </a>
      ) : (
        <span key={key} className="sdb-ref">
          <span className="sdb-sr">Fonte </span>
          {n}
        </span>
      );
    }
    if (p.tipo === "a")
      return (
        <a
          key={key}
          className="sdb-link"
          href={p.href}
          target={p.href?.startsWith("/") ? undefined : "_blank"}
          rel={p.href?.startsWith("/") ? undefined : "noopener noreferrer"}
        >
          {p.texto}
        </a>
      );
    return createElement(p.tipo, { key }, p.texto);
  });
}
