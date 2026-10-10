"use client";

import { Fragment, type KeyboardEvent, type ReactNode, useEffect, useId, useRef, useState } from "react";
import { cx } from "@/lib/cx";
import { classesDoBotao } from "./Button";
import { Icon, type IconName } from "./Icon";

export interface ItemMenu {
  label: string;
  onSelect: () => void | Promise<void>;
  icon?: IconName;
  /** Marca à esquerda (menuitemcheckbox). */
  checked?: boolean;
  danger?: boolean;
  separarAntes?: boolean;
  disabled?: boolean;
  /** Atalho exibido ao lado do rótulo; o consumidor implementa a tecla. */
  atalho?: string;
}

interface MenuProps {
  /** Conteúdo do botão gatilho. */
  trigger: ReactNode;
  triggerLabel?: string;
  triggerClassName?: string;
  items: ItemMenu[];
  up?: boolean;
  right?: boolean;
  titulo?: string;
  /** Classe extra na raiz (ex.: ocupar a largura da lateral). */
  className?: string;
}

/** Lista de ações ligada a um botão (Menu). Setas navegam, Esc fecha e devolve o foco. */
export function Menu({
  trigger,
  triggerLabel,
  triggerClassName,
  items,
  up,
  right,
  titulo,
  className,
}: MenuProps) {
  const [aberto, setAberto] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const gatilho = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener("pointerdown", fora);
    const primeiro = wrap.current?.querySelector<HTMLButtonElement>(".sdb-menu__item:not(:disabled)");
    const t = setTimeout(() => primeiro?.focus(), 10);
    return () => {
      document.removeEventListener("pointerdown", fora);
      clearTimeout(t);
    };
  }, [aberto]);

  const teclado = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape" && aberto) {
      e.stopPropagation();
      setAberto(false);
      gatilho.current?.focus();
      return;
    }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const lista = [
      ...(wrap.current?.querySelectorAll<HTMLButtonElement>(".sdb-menu__item:not(:disabled)") ?? []),
    ];
    const atual = lista.indexOf(document.activeElement as HTMLButtonElement);
    if (atual === -1) return;
    e.preventDefault();
    const passo = e.key === "ArrowDown" ? 1 : -1;
    lista[(atual + passo + lista.length) % lista.length]?.focus();
  };

  const escolher = (item: ItemMenu) => {
    void item.onSelect();
    setAberto(false);
    gatilho.current?.focus();
  };

  return (
    <div className={cx("sdb-menu-wrap", className)} ref={wrap}>
      <button
        ref={gatilho}
        type="button"
        className={triggerClassName ?? classesDoBotao({ variant: "secondary", size: "sm" })}
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-controls={`${id}-menu`}
        aria-label={triggerLabel}
        onClick={() => setAberto(!aberto)}
        onKeyDown={teclado}
      >
        {trigger}
      </button>
      <div
        id={`${id}-menu`}
        className={cx("sdb-menu", aberto && "is-open", up && "sdb-menu--up", right && "sdb-menu--right")}
        role="menu"
        aria-label={titulo ?? triggerLabel}
        inert={!aberto}
        onKeyDown={teclado}
      >
        {titulo && (
          <div className="sdb-menu__label" aria-hidden="true">
            {titulo}
          </div>
        )}
        {items.map((item) => {
          const classe = cx("sdb-menu__item", item.danger && "sdb-menu__item--danger");
          const conteudo = (
            <>
              <span>{item.label}</span>
              {item.atalho && <span className="sdb-kbd">{item.atalho}</span>}
              {item.icon && <Icon name={item.icon} />}
            </>
          );
          return (
            <Fragment key={item.label}>
              {item.separarAntes && <div className="sdb-menu__sep" role="separator" />}
              {item.checked !== undefined ? (
                <button
                  type="button"
                  className={classe}
                  role="menuitemcheckbox"
                  aria-checked={Boolean(item.checked)}
                  disabled={item.disabled}
                  onClick={() => escolher(item)}
                >
                  {conteudo}
                </button>
              ) : (
                <button
                  type="button"
                  className={classe}
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => escolher(item)}
                >
                  {conteudo}
                </button>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
