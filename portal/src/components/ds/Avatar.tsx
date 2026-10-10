import { cx } from "@/lib/cx";
import { Arc } from "./Arc";

/** Avatar: iniciais em círculo, nunca foto. `ai` usa vidro com o arco. */
export function Avatar({
  iniciais,
  ai,
  size,
  tone,
  className,
}: {
  iniciais?: string;
  ai?: boolean;
  size?: "sm" | "lg" | "xl";
  tone?: "ink" | "soft";
  className?: string;
}) {
  return (
    <span
      className={cx(
        "sdb-avatar",
        size && `sdb-avatar--${size}`,
        ai ? "sdb-avatar--ai" : tone && `sdb-avatar--${tone}`,
        className,
      )}
      aria-hidden="true"
    >
      {ai ? <Arc /> : iniciais}
    </span>
  );
}
