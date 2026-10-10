import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Icon } from "./Icon";

type Variante = "info" | "warning" | "error";

const ICONE = { info: "info", warning: "aviso", error: "erro" } as const;

/** Mensagem persistente na página (Alerta). Título de erro começa por "Erro:". */
export function Alerta({
  variant = "info",
  title,
  children,
  actions,
  className,
}: {
  variant?: Variante;
  title: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx("sdb-alert", variant !== "info" && `sdb-alert--${variant}`, className)}
      role={variant === "error" ? "alert" : "status"}
    >
      <span className="sdb-alert__icon">
        <Icon name={ICONE[variant]} />
      </span>
      <div className="sdb-alert__content">
        <p className="sdb-alert__title">{title}</p>
        {children && <div className="sdb-alert__body">{children}</div>}
        {actions && <div className="sdb-alert__actions">{actions}</div>}
      </div>
    </div>
  );
}
