"use client";

import {
  Children,
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cx } from "@/lib/cx";
import { Button } from "./Button";

/**
 * Carrossel (Carrossel): cabeçalho com título, legenda e setas; trilho com
 * scroll-snap. A rolagem fica só no trilho; a página nunca rola de lado.
 */
export function Carrossel({
  id,
  titulo,
  legenda,
  rotuloItens,
  filtros,
  rodape,
  larguraItem = 280,
  tituloGrande,
  acoes,
  className,
  children,
}: {
  id: string;
  titulo: string;
  /** Título em title-1 (ex.: "Continuar a busca", na página do conteúdo). */
  tituloGrande?: boolean;
  /** Antes das setas: um botão plain pequeno para a lista completa ("Ver todos"). */
  acoes?: ReactNode;
  className?: string;
  legenda?: string;
  /** Nome do que passa no trilho, para as setas e o leitor de tela ("Salas"). */
  rotuloItens: string;
  filtros?: ReactNode;
  rodape?: ReactNode;
  larguraItem?: number;
  /** Sem itens, o trilho e as setas somem; ficam o cabeçalho, os filtros e o rodapé. */
  children?: ReactNode;
}) {
  const temItens = Children.count(children) > 0;
  const trilho = useRef<HTMLDivElement>(null);
  const [inicio, setInicio] = useState(true);
  const [fim, setFim] = useState(true);

  const medir = useCallback(() => {
    const t = trilho.current;
    if (!t) return;
    setInicio(t.scrollLeft <= 2);
    setFim(t.scrollLeft + t.clientWidth >= t.scrollWidth - 2);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: mede de novo quando os itens mudam (filtro).
  useEffect(() => {
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [medir, children]);

  const mover = (direcao: 1 | -1) => {
    const t = trilho.current;
    if (!t) return;
    const reduzido = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    t.scrollBy({
      left: direcao * Math.max(t.clientWidth * 0.85, 200),
      behavior: reduzido ? "auto" : "smooth",
    });
  };

  return (
    <section className={cx("sdb-carousel", className)} aria-labelledby={`${id}-titulo`}>
      <div className="sdb-carousel__head">
        <div className="sdb-carousel__titles">
          <h2 id={`${id}-titulo`} className={tituloGrande ? "sdb-title-1" : "sdb-title-2"}>
            {titulo}
          </h2>
          {legenda && <p className="sdb-carousel__caption">{legenda}</p>}
        </div>
        {(acoes || temItens) && (
          <div className="sdb-carousel__nav">
            {acoes}
            {temItens && (
              <>
                <Button
                  variant="secondary"
                  iconOnly
                  icon="chevronEsquerda"
                  aria-label={`Ver ${rotuloItens} anteriores`}
                  aria-controls={`${id}-trilho`}
                  disabled={inicio}
                  onClick={() => mover(-1)}
                />
                <Button
                  variant="secondary"
                  iconOnly
                  icon="chevronDireita"
                  aria-label={`Ver mais ${rotuloItens}`}
                  data-tip-align="end"
                  aria-controls={`${id}-trilho`}
                  disabled={fim}
                  onClick={() => mover(1)}
                />
              </>
            )}
          </div>
        )}
      </div>
      {filtros}
      {temItens && (
        <div
          ref={trilho}
          id={`${id}-trilho`}
          className="sdb-carousel__track"
          // biome-ignore lint/a11y/noNoninteractiveTabindex: região rolável precisa do foco para rolar pelo teclado (WCAG 2.1.1).
          tabIndex={0}
          role="region"
          aria-label={rotuloItens}
          style={{ "--sdb-item": `${larguraItem}px` } as CSSProperties}
          onScroll={medir}
        >
          {children}
        </div>
      )}
      {rodape}
    </section>
  );
}
