"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Placa } from "@/data/types";
import { paginar } from "@/features/destaques/ranking";
import { cx } from "@/lib/cx";
import { Arc } from "./Arc";
import { Button } from "./Button";

export interface ItemListaDestaques {
  href: Route;
  titulo: string;
  /** "Biblioteca de Nag Hammadi · 212 buscas" */
  meta: string;
  imagem?: string;
  placa: Placa;
}

const COM_HOVER = "(hover: hover) and (pointer: fine)";

/**
 * Lista de destaques (ListaDestaques): ranking curto em que o item apontado ou
 * com foco cresce, abre a miniatura e ganha accent; os outros esmaecem. Sem
 * hover (celular, tablet), só texto e nada expande. Sete itens por página.
 */
export function ListaDestaques({
  id,
  titulo,
  legenda,
  itens,
  porPagina = 7,
}: {
  id: string;
  titulo: string;
  legenda: string;
  itens: ItemListaDestaques[];
  porPagina?: number;
}) {
  const [pagina, setPagina] = useState(1);
  const [ativo, setAtivo] = useState<number | null>(null);
  const [comHover, setComHover] = useState(false);
  const pag = paginar(itens, pagina, porPagina);

  useEffect(() => {
    const mq = window.matchMedia?.(COM_HOVER);
    setComHover(Boolean(mq?.matches));
    const mudou = () => setComHover(Boolean(mq?.matches));
    mq?.addEventListener?.("change", mudou);
    return () => mq?.removeEventListener?.("change", mudou);
  }, []);

  const ativar = (i: number | null) => setAtivo(comHover ? i : null);
  const irPara = (p: number) => {
    setAtivo(null);
    setPagina(p);
  };
  const ativoValido = comHover && ativo !== null && ativo < pag.itens.length ? ativo : null;

  return (
    <aside className="sdb-toplist" aria-labelledby={`${id}-titulo`}>
      <div className="sdb-toplist__head">
        <h2 className="sdb-toplist__label" id={`${id}-titulo`}>
          {titulo}
        </h2>
        <p className="sdb-toplist__caption">{legenda}</p>
      </div>
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: só acompanha ponteiro e foco para o estado visual; a ação é o link. */}
      <ol
        className={cx("sdb-toplist__list", ativoValido !== null && "has-active")}
        start={(pag.pagina - 1) * porPagina + 1}
        onPointerLeave={() => {
          const focado = document.activeElement?.closest?.("[data-indice]");
          ativar(focado ? Number(focado.getAttribute("data-indice")) : null);
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) ativar(null);
        }}
      >
        {pag.itens.map((item, i) => (
          // biome-ignore lint/a11y/noNoninteractiveElementInteractions: só acompanha ponteiro e foco para o estado visual; a ação é o link.
          <li
            key={item.href}
            data-indice={i}
            className={cx("sdb-toplist__item", ativoValido === i && "is-active")}
            onPointerEnter={(e) => {
              if (!e.pointerType || e.pointerType === "mouse") ativar(i);
            }}
            onFocus={() => ativar(i)}
          >
            <Link className="sdb-toplist__link" href={item.href}>
              <span className="sdb-toplist__thumb" aria-hidden="true">
                {item.imagem ? (
                  // biome-ignore lint/performance/noImgElement: miniatura decorativa servida de public/imagens.
                  <img src={item.imagem} alt="" loading="lazy" decoding="async" />
                ) : (
                  <span className={`sdb-plate sdb-plate--${item.placa}`}>
                    <Arc on={item.placa} />
                  </span>
                )}
              </span>
              <span>
                <span className="sdb-toplist__title">{item.titulo}</span>
                <span className="sdb-toplist__meta">{item.meta}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      {pag.total > 1 && (
        <nav className="sdb-toplist__pag" aria-label={`Páginas de ${titulo.toLowerCase()}`}>
          <Button
            variant="secondary"
            size="sm"
            iconOnly
            icon="chevronEsquerda"
            aria-label="Página anterior"
            disabled={pag.pagina === 1}
            onClick={() => irPara(pag.pagina - 1)}
          />
          <span className="sdb-footnote" aria-live="polite">
            Página {pag.pagina} de {pag.total}
          </span>
          <Button
            variant="secondary"
            size="sm"
            iconOnly
            icon="chevronDireita"
            aria-label="Próxima página"
            disabled={pag.pagina === pag.total}
            onClick={() => irPara(pag.pagina + 1)}
          />
        </nav>
      )}
    </aside>
  );
}
