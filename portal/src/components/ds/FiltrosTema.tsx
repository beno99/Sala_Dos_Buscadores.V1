"use client";

import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { cx } from "@/lib/cx";
import { Button } from "./Button";

/** ChipTema › filtros horizontais. A seleção continua sob controle da tela. */
export function FiltrosTema({
  children,
  rotulo,
  className,
}: {
  children: ReactNode;
  rotulo: string;
  className?: string;
}) {
  const id = useId();
  const trilho = useRef<HTMLDivElement>(null);
  const gesto = useRef<{ x: number; y: number; scroll: number; arrastou: boolean } | null>(null);
  const [limites, setLimites] = useState({ overflow: false, inicio: true, fim: true });

  useEffect(() => {
    const el = trilho.current;
    if (!el) return;
    const medir = () => {
      const max = el.scrollWidth - el.clientWidth;
      const proximo = { overflow: max > 1, inicio: el.scrollLeft <= 1, fim: el.scrollLeft >= max - 1 };
      setLimites((atual) =>
        atual.overflow === proximo.overflow && atual.inicio === proximo.inicio && atual.fim === proximo.fim
          ? atual
          : proximo,
      );
    };
    const resize = new ResizeObserver(medir);
    const observar = () => {
      resize.disconnect();
      resize.observe(el);
      for (const filho of el.children) resize.observe(filho);
      medir();
    };
    const mudancas = new MutationObserver(observar);
    mudancas.observe(el, { childList: true, subtree: true, characterData: true });
    el.addEventListener("scroll", medir, { passive: true });
    observar();
    return () => {
      resize.disconnect();
      mudancas.disconnect();
      el.removeEventListener("scroll", medir);
    };
  }, []);

  function revelar(alvo: EventTarget) {
    const el = trilho.current;
    const chip = alvo instanceof Element ? alvo.closest<HTMLElement>(".sdb-chip") : null;
    if (!el || !chip || !el.contains(chip)) return;
    const area = el.getBoundingClientRect();
    const item = chip.getBoundingClientRect();
    const margem = Number.parseFloat(getComputedStyle(el).paddingInlineStart);
    const esquerda = item.left - area.left - margem;
    const direita = item.right - area.right + margem;
    // Um rótulo maior que o trilho continua livre para rolar em ambos os sentidos.
    if (esquerda < 0 && direita > 0) return;
    const delta = esquerda < 0 ? esquerda : direita > 0 ? direita : 0;
    if (delta) el.scrollBy({ left: delta, behavior: "instant" });
  }

  function avancar(direcao: number) {
    const el = trilho.current;
    if (!el) return;
    el.scrollBy({
      left: direcao * el.clientWidth * 0.8,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }

  return (
    <div className={cx("sdb-chipfilters", className)} data-overflow={limites.overflow}>
      <Button
        className="sdb-chipfilters__nav"
        variant="secondary"
        iconOnly
        icon="chevronEsquerda"
        aria-label="Temas anteriores"
        title="Temas anteriores"
        aria-controls={id}
        disabled={limites.inicio}
        onClick={() => avancar(-1)}
      />
      <div
        ref={trilho}
        id={id}
        className="sdb-chiprow sdb-chiprow--filters"
        role="group"
        aria-label={rotulo}
        onPointerDown={(event) => {
          gesto.current = {
            x: event.clientX,
            y: event.clientY,
            scroll: event.currentTarget.scrollLeft,
            arrastou: false,
          };
        }}
        onPointerMove={(event) => {
          const atual = gesto.current;
          if (atual && Math.hypot(event.clientX - atual.x, event.clientY - atual.y) > 8) {
            atual.arrastou = true;
          }
        }}
        onPointerCancel={() => {
          if (gesto.current) gesto.current.arrastou = true;
        }}
        onKeyDownCapture={() => {
          gesto.current = null;
        }}
        onFocusCapture={(event) => {
          if (!gesto.current || event.target.matches(":focus-visible")) revelar(event.target);
        }}
        onClickCapture={(event) => {
          const atual = gesto.current;
          gesto.current = null;
          if (
            event.detail > 0 &&
            atual &&
            (atual.arrastou || Math.abs(event.currentTarget.scrollLeft - atual.scroll) > 8)
          ) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          revelar(event.target);
        }}
      >
        {children}
      </div>
      <Button
        className="sdb-chipfilters__nav"
        variant="secondary"
        iconOnly
        icon="chevronDireita"
        aria-label="Próximos temas"
        title="Próximos temas"
        aria-controls={id}
        disabled={limites.fim}
        onClick={() => avancar(1)}
      />
    </div>
  );
}
