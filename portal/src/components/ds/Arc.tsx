import { cx } from "@/lib/cx";

export type ArcOn = "bordo" | "grafite" | "bege" | "ouro";

interface ArcProps {
  /** Fundo sobre o qual o arco aparece; define a inversão de cor permitida. */
  on?: ArcOn;
  /** Versão em traço fino, usada sobre miniaturas de vídeo. */
  line?: boolean;
  className?: string;
}

/** O arco com escada de degraus: único símbolo da marca (porta de SalaBuscadores.arc). */
export function Arc({ on, line, className }: ArcProps) {
  const classe = cx("sdb-arc", on && `sdb-arc--on-${on}`, className);
  const degraus = [0, 1, 2, 3, 4];
  if (line) {
    return (
      <svg
        className={classe}
        viewBox="0 0 36 48"
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        aria-hidden="true"
        focusable="false"
      >
        <path d="M2 47.5V18a16 16 0 0132 0v29.5z" />
        <path d="M4.5 47.5V18.5a13.5 13.5 0 0127 0v29" />
        {degraus.map((i) => (
          <rect key={i} x={5.5} y={31 + i * 3.2} width={8 + i * 4.4} height={3.2} />
        ))}
      </svg>
    );
  }
  return (
    <svg className={classe} viewBox="0 0 36 48" aria-hidden="true" focusable="false">
      <path d="M2 48V18a16 16 0 0132 0v30z" fill="currentColor" />
      <g fill="none" style={{ stroke: "var(--sdb-arc-cut)" }} strokeWidth={1.1}>
        {degraus.map((i) => (
          <rect key={i} x={5} y={31 + i * 3.2} width={8 + i * 4.6} height={3.2} />
        ))}
      </g>
    </svg>
  );
}
