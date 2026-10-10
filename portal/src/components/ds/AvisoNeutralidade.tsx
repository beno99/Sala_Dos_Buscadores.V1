import type { Route } from "next";
import Link from "next/link";
import { cx } from "@/lib/cx";
import { Arc } from "./Arc";

/** Texto fixo, revisado pela curadoria. Não reescreva por tela. */
export const TEXTO_NEUTRALIDADE =
  "A IA organiza o que o acervo diz; não determina qual crença é verdadeira. Toda resposta aponta suas fontes.";
export const TEXTO_NEUTRALIDADE_DISCRETO =
  "A IA organiza o que o acervo diz; não determina qual crença é verdadeira. Confira sempre as fontes citadas.";

/**
 * Aviso de neutralidade (AvisoNeutralidade). `vidro` fica preso ao rodapé da
 * área do assistente; `solido` para temas sólidos; `discreto` abaixo de cada resposta.
 */
export function AvisoNeutralidade({
  variante = "vidro",
  hrefComoFunciona,
}: {
  variante?: "vidro" | "solido" | "discreto";
  hrefComoFunciona?: Route;
}) {
  const discreto = variante === "discreto";
  return (
    <aside
      className={cx(
        "sdb-neutral",
        variante === "solido" && "sdb-neutral--solid",
        discreto && "sdb-neutral--quiet",
      )}
      aria-label="Aviso de neutralidade"
    >
      <span className="sdb-neutral__icon">
        <Arc on={discreto ? undefined : "bordo"} />
      </span>
      <p>{discreto ? TEXTO_NEUTRALIDADE_DISCRETO : TEXTO_NEUTRALIDADE}</p>
      {hrefComoFunciona && !discreto && (
        <Link href={hrefComoFunciona} className="sdb-link">
          Como funciona
        </Link>
      )}
    </aside>
  );
}
