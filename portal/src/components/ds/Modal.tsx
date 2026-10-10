"use client";

import { type ReactNode, useEffect, useId, useRef } from "react";
import { cx } from "@/lib/cx";
import { Button } from "./Button";
import { Icon, type IconName } from "./Icon";
import { useFocoPreso } from "./useFocoPreso";

interface ModalConfirmacaoProps {
  open: boolean;
  titulo: string;
  children: ReactNode;
  icone?: IconName;
  destrutivo?: boolean;
  rotuloConfirmar: string;
  rotuloCancelar?: string;
  carregando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

/**
 * Modal de alerta (Modal): decisão com dois botões, o seguro à esquerda.
 * O foco entra no botão seguro e volta ao gatilho; Esc e o véu cancelam.
 */
export function ModalConfirmacao({
  open,
  titulo,
  children,
  icone = "info",
  destrutivo,
  rotuloConfirmar,
  rotuloCancelar = "Cancelar",
  carregando,
  onConfirmar,
  onCancelar,
}: ModalConfirmacaoProps) {
  const id = useId();
  const seguro = useRef<HTMLButtonElement>(null);
  const painel = useRef<HTMLDivElement>(null);
  useFocoPreso(painel, open);
  const anterior = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    anterior.current = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => seguro.current?.focus(), 30);
    return () => {
      clearTimeout(t);
      anterior.current?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancelar();
    };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open, onCancelar]);

  return (
    <div
      className={cx("sdb-overlay", open && "is-open")}
      aria-hidden={!open}
      inert={!open}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onCancelar();
      }}
    >
      <div
        ref={painel}
        className="sdb-modal sdb-modal--alert"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`${id}-titulo`}
        aria-describedby={`${id}-texto`}
      >
        <span className={cx("sdb-modal__icon", destrutivo && "sdb-modal__icon--danger")}>
          <Icon name={icone} />
        </span>
        <h2 id={`${id}-titulo`} className="sdb-modal__title">
          {titulo}
        </h2>
        <div id={`${id}-texto`} className="sdb-modal__text">
          {children}
        </div>
        <div className="sdb-modal__actions">
          <Button ref={seguro} variant="secondary" onClick={onCancelar}>
            {rotuloCancelar}
          </Button>
          <Button variant={destrutivo ? "destructive" : "primary"} loading={carregando} onClick={onConfirmar}>
            {rotuloConfirmar}
          </Button>
        </div>
      </div>
    </div>
  );
}
