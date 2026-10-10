"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { cx } from "@/lib/cx";
import { useFocoPreso } from "./useFocoPreso";

/**
 * Modal em sheet (Modal › sheet) com foco preso. `onFechar` vale para Esc e
 * para o véu; sem ele, o diálogo só fecha pelas próprias ações.
 */
export function Sheet({
  aberto,
  onFechar,
  rotuloId,
  className,
  children,
}: {
  aberto: boolean;
  onFechar?: () => void;
  /** id do título que nomeia o diálogo. */
  rotuloId: string;
  className?: string;
  children: ReactNode;
}) {
  const painel = useRef<HTMLDivElement>(null);
  useFocoPreso(painel, aberto);

  useEffect(() => {
    if (!aberto) return;
    const anterior = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => {
      const primeiro = painel.current?.querySelector<HTMLElement>(
        'input:not(:disabled):not([type="hidden"]), textarea:not(:disabled), select:not(:disabled), button:not(:disabled), a[href]',
      );
      (primeiro ?? painel.current)?.focus();
    }, 30);
    return () => {
      clearTimeout(t);
      anterior?.focus();
    };
  }, [aberto]);

  useEffect(() => {
    if (!aberto || !onFechar) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
    };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [aberto, onFechar]);

  return (
    <div
      className={cx("sdb-overlay", aberto && "is-open")}
      aria-hidden={!aberto}
      inert={!aberto}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onFechar?.();
      }}
    >
      <div
        ref={painel}
        tabIndex={-1}
        className={cx("sdb-modal sdb-sheet", className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={rotuloId}
      >
        {children}
      </div>
    </div>
  );
}
