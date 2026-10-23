import { createElement, type ReactNode } from "react";
import type { SvgNode } from "@/design-system/icons.generated";
import { INTERFACE_ICONS, type InterfaceIconName } from "@/design-system/interface-icons.generated";
import { cx } from "@/lib/cx";

function desenhar(nos: readonly SvgNode[], chave = ""): ReactNode[] {
  return nos.map((no, i) => {
    const key = `${chave}${i}`;
    return createElement(no.t, { key, ...no.a }, no.c ? desenhar(no.c, `${key}-`) : undefined);
  });
}

interface IconProps {
  name: InterfaceIconName;
  /** sm = 16 px (em texto), padrão = 20 px, lg = 24 px (isolado). */
  size?: "sm" | "lg";
  className?: string;
}

/** Ícone Phosphor da biblioteca (Iconografia). Sempre decorativo: nomeie o controle, não o ícone. */
export function InterfaceIcon({ name, size, className }: IconProps) {
  return (
    <svg
      className={cx("sdb-ui-interface-icon", size && `sdb-icon--${size}`, className)}
      viewBox="0 0 256 256"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {desenhar(INTERFACE_ICONS[name])}
    </svg>
  );
}
