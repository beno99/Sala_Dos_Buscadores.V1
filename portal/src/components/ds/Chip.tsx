import type { Route } from "next";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Arc } from "./Arc";
import { Icon } from "./Icon";

interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  pressed?: boolean;
  count?: number;
  small?: boolean;
  /** Mostra o arco antes do rótulo (chips de Sala). */
  arc?: boolean;
}

/** Chip de tema transversal ou de Sala, clicável (ChipTema). */
export function Chip({ pressed, count, small, arc, className, children, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      className={cx("sdb-chip", small && "sdb-chip--sm", className)}
      aria-pressed={pressed}
      {...rest}
    >
      {arc && <Arc />}
      {children}
      {count !== undefined && <span className="sdb-count">{count}</span>}
    </button>
  );
}

/** Chip que navega (tema → comparação, Sala relacionada → página da Sala). */
export function ChipLink({
  href,
  small,
  arc,
  count,
  children,
}: {
  href: Route;
  small?: boolean;
  arc?: boolean;
  count?: number;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={cx("sdb-chip", small && "sdb-chip--sm")}>
      {arc && <Arc />}
      {children}
      {count !== undefined && <span className="sdb-count">{count}</span>}
    </Link>
  );
}

/** Chip estático de filtro ativo, com botão de remover. */
export function ChipRemovivel({ rotulo, onRemove }: { rotulo: string; onRemove?: () => void }) {
  return (
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: a biblioteca pinta o chip ativo por [aria-pressed="true"]; o botão interno é o controle.
    <span className="sdb-chip sdb-chip--sm sdb-chip--static" aria-pressed="true">
      {rotulo}
      {onRemove && (
        <button
          type="button"
          className="sdb-chip__x"
          aria-label={`Remover filtro ${rotulo}`}
          onClick={onRemove}
        >
          <Icon name="fechar" size="sm" />
        </button>
      )}
    </span>
  );
}

/** Chip estático (sem ação), como os temas ligados à pergunta da grade. */
export function ChipEstatico({ children, pressed }: { children: ReactNode; pressed?: boolean }) {
  return (
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: a biblioteca pinta o chip ativo por [aria-pressed="true"]; o chip é só um rótulo.
    <span className="sdb-chip sdb-chip--sm sdb-chip--static" aria-pressed={pressed ? "true" : undefined}>
      {children}
    </span>
  );
}
