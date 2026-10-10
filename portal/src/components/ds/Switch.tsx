"use client";

import { type InputHTMLAttributes, type ReactNode, useId } from "react";
import { cx } from "@/lib/cx";

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "role"> {
  label: ReactNode;
  help?: ReactNode;
}

/** Preferência de efeito imediato (Switch); a linha inteira é clicável. */
export function Switch({
  label,
  help,
  id,
  className,
  "aria-describedby": describedBy,
  ...rest
}: SwitchProps) {
  const gerado = useId();
  const campo = id ?? gerado;
  const descricao = [describedBy, help && `${campo}-ajuda`].filter(Boolean).join(" ") || undefined;
  return (
    <label className={cx("sdb-option", className)} htmlFor={campo}>
      <span>
        {label}
        {help && (
          <small id={`${campo}-ajuda`} className="sdb-footnote block">
            {help}
          </small>
        )}
      </span>
      <span className="sdb-switch">
        {/* biome-ignore lint/a11y/useAriaPropsForRole: input checkbox comunica o estado nativo também com role switch. */}
        <input {...rest} id={campo} type="checkbox" role="switch" aria-describedby={descricao} />
      </span>
    </label>
  );
}
