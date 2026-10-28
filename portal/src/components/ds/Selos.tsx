import type { ReactNode } from "react";
import { NIVEL_ROTULO, PROVENIENCIA_ROTULO } from "@/data/rotulos";
import type { Nivel, Proveniencia } from "@/data/types";
import { cx } from "@/lib/cx";
import { Icon, type IconName } from "./Icon";

export const ICONE_PROVENIENCIA: Record<Proveniencia, IconName> = {
  primaria: "fontePrimaria",
  curado: "curado",
  especialista: "especialista",
  comunidade: "comunidade",
  ia: "ia",
  anfitriao: "anfitriao",
};

/** Selo de proveniência (RF-12): obrigatório em cards, citações, grade e respostas da IA. */
export function SeloProveniencia({
  tipo,
  rotulo,
  compacto,
}: {
  tipo: Proveniencia;
  rotulo?: string;
  /** Tamanho compacto (`--sm`), para linhas de lista. */
  compacto?: boolean;
}) {
  return (
    <span
      className={cx("sdb-seal", compacto && "sdb-seal--sm", `sdb-seal--${tipo}`)}
      title={tipo === "anfitriao" && compacto ? "Anfitrião · revisado pela curadoria" : undefined}
    >
      <span className="sdb-seal__icon">
        <Icon name={ICONE_PROVENIENCIA[tipo]} />
      </span>
      {rotulo ?? PROVENIENCIA_ROTULO[tipo]}
      {tipo === "anfitriao" && !compacto && <span className="sdb-seal__note">Revisado pela curadoria</span>}
    </span>
  );
}

/** Selo de nível: escada de três degraus, sempre com a palavra. */
export function SeloNivel({ nivel, plain }: { nivel: Nivel; plain?: boolean }) {
  return (
    <span className={cx("sdb-level", plain && "sdb-level--plain")} data-level={nivel}>
      <span className="sdb-level__steps" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      {NIVEL_ROTULO[nivel]}
    </span>
  );
}

type BadgeVariant =
  | "neutral"
  | "solid"
  | "ink"
  | "critical"
  | "glass"
  // 1.1: tags semânticas (cor + ícone + palavra) e status editoriais.
  | "topic"
  | "source"
  | "period"
  | "language"
  | "new"
  | "published"
  | "review"
  | "draft"
  | "archived";

/** Rótulo curto com ícone e cor semântica, não clicável. O rótulo sempre diz o significado. */
export function Badge({
  variant,
  icon,
  className,
  children,
}: {
  variant?: BadgeVariant;
  icon?: IconName;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={cx("sdb-badge", variant && `sdb-badge--${variant}`, className)}>
      {icon && <Icon name={icon} size="sm" />}
      {children}
    </span>
  );
}
