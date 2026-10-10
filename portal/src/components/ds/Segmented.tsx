"use client";

import { type KeyboardEvent, type ReactNode, useCallback, useLayoutEffect, useRef, useState } from "react";
import { cx } from "@/lib/cx";

export interface OpcaoSegmentada<T extends string> {
  value: T;
  label: ReactNode;
  count?: number;
  disabled?: boolean;
}

interface SegmentedProps<T extends string> {
  options: OpcaoSegmentada<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  block?: boolean;
  large?: boolean;
  className?: string;
  /**
   * Modo abas (Tabs › segmentado com painéis): role="tablist", aria-selected e
   * setas ← →. Os painéis usam o id `${abas}-painel-${valor}`.
   */
  abas?: string;
}

/**
 * Controle segmentado em modo de alternância (Tabs › `data-toggle-group`).
 * O polegar é medido e posicionado como no runtime da biblioteca (syncSeg):
 * na primeira medida entra sem animação; depois desliza com mola.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  block,
  large,
  className,
  abas,
}: SegmentedProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const primeira = useRef(true);
  const [polegar, setPolegar] = useState<{ largura: number; x: number } | null>(null);
  const [instantaneo, setInstantaneo] = useState(true);

  const medir = useCallback((semAnimar: boolean) => {
    const grupo = ref.current;
    const ativo = grupo?.querySelector<HTMLButtonElement>(
      ':scope > button[aria-pressed="true"], :scope > button[aria-selected="true"]',
    );
    if (!grupo || !ativo) {
      setPolegar(null);
      return;
    }
    if (semAnimar) setInstantaneo(true);
    setPolegar({ largura: ativo.offsetWidth, x: ativo.offsetLeft });
    if (semAnimar) requestAnimationFrame(() => setInstantaneo(false));
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `value` é o gatilho para medir de novo o polegar.
  useLayoutEffect(() => {
    medir(primeira.current);
    primeira.current = false;
  }, [value, medir]);

  useLayoutEffect(() => {
    const aoRedimensionar = () => medir(true);
    window.addEventListener("resize", aoRedimensionar);
    document.fonts?.ready.then(aoRedimensionar).catch(() => {});
    return () => window.removeEventListener("resize", aoRedimensionar);
  }, [medir]);

  const habilitadas = options.filter((o) => !o.disabled);
  const teclas = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!abas || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
    e.preventDefault();
    const i = habilitadas.findIndex((o) => o.value === value);
    const proxima =
      habilitadas[(i + (e.key === "ArrowRight" ? 1 : -1) + habilitadas.length) % habilitadas.length];
    if (!proxima) return;
    onChange(proxima.value);
    requestAnimationFrame(() => document.getElementById(`${abas}-aba-${proxima.value}`)?.focus());
  };

  const classe = cx(
    "sdb-segmented",
    block && "sdb-segmented--block",
    large && "sdb-segmented--lg",
    instantaneo && "is-instant",
    className,
  );
  const conteudo = (
    <>
      <span
        className="sdb-segmented__thumb"
        aria-hidden="true"
        style={
          polegar
            ? { opacity: 1, width: polegar.largura, transform: `translateX(${polegar.x}px)` }
            : { opacity: 0 }
        }
      />
      {options.map((o) =>
        abas ? (
          <button
            key={o.value}
            type="button"
            role="tab"
            id={`${abas}-aba-${o.value}`}
            aria-selected={o.value === value}
            aria-controls={`${abas}-painel-${o.value}`}
            tabIndex={o.value === value ? 0 : -1}
            disabled={o.disabled}
            onClick={() => onChange(o.value)}
            onKeyDown={teclas}
          >
            {o.label}
            {o.count !== undefined && <span className="sdb-count">{o.count}</span>}
          </button>
        ) : (
          <button
            key={o.value}
            type="button"
            aria-pressed={o.value === value}
            disabled={o.disabled}
            onClick={() => onChange(o.value)}
          >
            {o.label}
            {o.count !== undefined && <span className="sdb-count">{o.count}</span>}
          </button>
        ),
      )}
    </>
  );
  return abas ? (
    <div ref={ref} role="tablist" aria-label={label} className={classe}>
      {conteudo}
    </div>
  ) : (
    <div ref={ref} role="group" aria-label={label} className={classe}>
      {conteudo}
    </div>
  );
}
