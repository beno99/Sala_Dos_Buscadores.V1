import type { Route } from "next";
import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { cx } from "@/lib/cx";
import { Icon, type IconName } from "./Icon";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "glass"
  | "tinted"
  | "plain"
  | "destructive"
  | "clear"
  /** Dourado e areia escura das camadas douradas (onboarding). */
  | "gold"
  | "warm";

interface Aparencia {
  variant?: ButtonVariant;
  size?: "sm" | "lg";
  block?: boolean;
  /** Botão circular só com ícone: exige `aria-label` (e, na biblioteca, `tip`). */
  iconOnly?: boolean;
  icon?: IconName;
  iconEnd?: IconName;
  /** Tooltip da biblioteca (data-tip). */
  tip?: string;
  tipSide?: "bottom" | "right";
}

export function classesDoBotao({
  variant,
  size,
  block,
  iconOnly,
  loading,
  className,
}: Aparencia & { loading?: boolean; className?: string }) {
  return cx(
    "sdb-btn",
    variant === "clear" ? "sdb-glass--clear" : variant && `sdb-btn--${variant}`,
    iconOnly && "sdb-btn--icon",
    size && `sdb-btn--${size}`,
    block && "sdb-btn--block",
    loading && "is-loading",
    className,
  );
}

function Conteudo({
  icon,
  iconEnd,
  size,
  children,
  comSpinner,
}: Aparencia & { children?: ReactNode; comSpinner?: boolean }) {
  const tamanho = size === "sm" ? "sm" : undefined;
  return (
    <>
      {icon && <Icon name={icon} size={tamanho} />}
      {comSpinner ? <span>{children}</span> : children}
      {iconEnd && <Icon name={iconEnd} size={tamanho} />}
      {comSpinner && <span className="sdb-spinner" aria-hidden="true" />}
    </>
  );
}

type ButtonProps = Aparencia &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    /** Estado de carregamento: o rótulo desfoca e o indicador aparece no mesmo lugar. */
    loading?: boolean;
    ref?: Ref<HTMLButtonElement>;
  };

/** Botão em cápsula (Botao). O rótulo diz exatamente o que acontece. */
export function Button({
  variant,
  size,
  block,
  iconOnly,
  icon,
  iconEnd,
  tip,
  tipSide,
  loading,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classesDoBotao({ variant, size, block, iconOnly, loading, className })}
      aria-busy={loading || undefined}
      data-tip={tip ?? (iconOnly ? rest["aria-label"] : undefined)}
      data-tip-side={tipSide}
      {...rest}
    >
      <Conteudo icon={icon} iconEnd={iconEnd} size={size} comSpinner={loading !== undefined}>
        {children}
      </Conteudo>
    </button>
  );
}

type ButtonLinkProps = Aparencia &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: Route;
  };

/** Link de navegação com a aparência de botão. */
export function ButtonLink({
  variant,
  size,
  block,
  iconOnly,
  icon,
  iconEnd,
  tip,
  tipSide,
  className,
  children,
  href,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={classesDoBotao({ variant, size, block, iconOnly, className })}
      data-tip={tip ?? (iconOnly ? rest["aria-label"] : undefined)}
      data-tip-side={tipSide}
      {...rest}
    >
      <Conteudo icon={icon} iconEnd={iconEnd} size={size}>
        {children}
      </Conteudo>
    </Link>
  );
}
