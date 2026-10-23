import { cx } from "@/lib/cx";
import { Arc } from "./Arc";

/**
 * Avatar: iniciais em círculo. `ai` usa vidro com o arco. `foto` é a exceção
 * da página pública do anfitrião (a imagem que ele enviou); fora dela, nunca foto.
 */
export function Avatar({
  iniciais,
  foto,
  ai,
  size,
  tone,
  className,
}: {
  iniciais?: string;
  foto?: string;
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
        ai ? "sdb-avatar--ai" : foto ? "sdb-avatar--foto" : tone && `sdb-avatar--${tone}`,
        className,
      )}
      aria-hidden="true"
    >
      {ai ? (
        <Arc />
      ) : foto ? (
        // biome-ignore lint/performance/noImgElement: imagem enviada pelo anfitrião, servida por /midia.
        <img src={foto} alt="" />
      ) : (
        iniciais
      )}
    </span>
  );
}
