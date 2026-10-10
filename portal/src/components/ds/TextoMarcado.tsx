import type { ReactNode } from "react";
import type { TextoMarcado as Marcado } from "@/data/types";

const TOKENS = /(\*[^*]+\*|_[^_]+_|\[\d+\])/g;

/**
 * Renderiza o texto do acervo: *termo* vira <dfn> (termo próprio da tradição),
 * _obra_ vira <cite> e [n] vira a referência numerada da fonte (.sdb-ref).
 */
export function TextoMarcado({
  texto,
  hrefRef,
}: {
  texto: Marcado;
  hrefRef?: (n: number) => string;
}): ReactNode {
  const partes = texto.split(TOKENS);
  let posicao = 0;
  return partes.map((parte) => {
    const key = `${posicao}`;
    posicao += parte.length;
    if (!parte) return null;
    if (parte.startsWith("*") && parte.endsWith("*")) return <dfn key={key}>{parte.slice(1, -1)}</dfn>;
    if (parte.startsWith("_") && parte.endsWith("_")) return <cite key={key}>{parte.slice(1, -1)}</cite>;
    const ref = /^\[(\d+)\]$/.exec(parte);
    if (ref) {
      const n = Number(ref[1]);
      return hrefRef ? (
        <a key={key} className="sdb-ref" href={hrefRef(n)} aria-label={`Fonte ${n}`}>
          {n}
        </a>
      ) : null;
    }
    return parte;
  });
}
