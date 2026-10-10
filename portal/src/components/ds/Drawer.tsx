"use client";

import { type ReactNode, useEffect, useId, useRef } from "react";
import { cx } from "@/lib/cx";
import { Button } from "./Button";
import { useFocoPreso } from "./useFocoPreso";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Versão larga (até 560 px), para o assistente. */
  wide?: boolean;
  /** Ações extras no cabeçalho, antes do fechar (ex.: "Abrir em tela cheia"). */
  acoes?: ReactNode;
}

/**
 * Painel lateral flutuante; abaixo de 600 px vira sheet inferior (Drawer).
 * O foco entra no painel ao abrir e volta ao gatilho ao fechar.
 */
export function Drawer({ open, onClose, title, children, footer, wide, acoes }: DrawerProps) {
  const painel = useRef<HTMLElement>(null);
  const anterior = useRef<HTMLElement | null>(null);
  const id = useId();
  useFocoPreso(painel, open);

  useEffect(() => {
    if (!open) return;
    anterior.current = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => {
      const primeiro = painel.current?.querySelector<HTMLElement>(
        'input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), button:not(:disabled):not([data-close])',
      );
      (
        primeiro ??
        painel.current?.querySelector<HTMLElement>("button:not(:disabled)") ??
        painel.current
      )?.focus();
    }, 30);
    return () => {
      clearTimeout(t);
      anterior.current?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const esc = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open, onClose]);

  return (
    <div
      className={cx("sdb-overlay sdb-overlay--drawer", open && "is-open")}
      aria-hidden={!open}
      inert={!open}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside
        ref={painel}
        tabIndex={-1}
        className={cx("sdb-drawer", wide && "sdb-drawer--wide")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-titulo`}
      >
        <span className="sdb-grabber" aria-hidden="true" />
        <div className="sdb-drawer__head">
          <h2 id={`${id}-titulo`}>{title}</h2>
          {acoes && (
            <div className="sdb-row ml-auto" style={{ gap: 6 }}>
              {acoes}
            </div>
          )}
          <Button
            variant="secondary"
            size="sm"
            iconOnly
            icon="fechar"
            aria-label="Fechar"
            data-close
            onClick={onClose}
          />
        </div>
        <div className="sdb-drawer__body">{children}</div>
        {footer && <div className="sdb-drawer__foot">{footer}</div>}
      </aside>
    </div>
  );
}
