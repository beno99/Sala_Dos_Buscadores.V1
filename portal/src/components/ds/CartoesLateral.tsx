"use client";

import type { Route } from "next";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { Placa } from "@/data/types";
import { Arc } from "./Arc";
import { Icon, type IconName } from "./Icon";

/** Mini card "Continuar de onde parou" da Navegação lateral. */
export function ContinuarLateral({
  titulo,
  detalhe,
  pct,
  href,
  placa,
  recolhida,
  onDispensar,
}: {
  titulo: string;
  /** "Poimandres · 38%". */
  detalhe: string;
  pct: number;
  href: Route;
  placa: Placa;
  recolhida: boolean;
  onDispensar: () => void;
}) {
  return (
    <div
      className="sdb-sidenav__resume"
      {...(recolhida ? { "data-tip": `Continuar: ${titulo}`, "data-tip-side": "right" } : {})}
    >
      <span className={`sdb-sidenav__thumb sdb-plate--${placa}`} aria-hidden="true">
        <Arc on={placa} />
      </span>
      <span className="sdb-sidenav__resume-text">
        <b>
          <Link
            className="sdb-card__link"
            href={href}
            aria-label={`Continuar de onde parou: ${titulo}, ${pct}% lido`}
          >
            Continuar de onde parou
          </Link>
        </b>
        <span>{detalhe}</span>
      </span>
      <button
        type="button"
        className="sdb-sidenav__dismiss"
        aria-label="Dispensar sugestão de continuar"
        onClick={onDispensar}
      >
        <Icon name="fechar" size="sm" />
      </button>
      <span className="sdb-progress__track" aria-hidden="true">
        <i style={{ "--p": pct / 100 } as CSSProperties} />
      </span>
    </div>
  );
}

/** Cartão do rodapé da lateral: cabeçalho com ícone, rótulo e número, texto e ação. */
export function CartaoLateral({
  icone,
  rotulo,
  numero,
  href,
  nivel,
  children,
}: {
  /** Cartão de nível: fica no material creme. */
  nivel?: boolean;
  icone?: IconName;
  rotulo?: string;
  numero?: number;
  /** Com href, o cartão inteiro é um link. */
  href?: Route;
  children: ReactNode;
}) {
  const cabecalho = rotulo && (
    <span className="sdb-sidenav__card-head">
      {icone && <Icon name={icone} />}
      <span>{rotulo}</span>
      {numero !== undefined && <span>{numero}</span>}
    </span>
  );
  return href ? (
    <Link className="sdb-sidenav__card" href={href}>
      {cabecalho}
      {children}
    </Link>
  ) : (
    <div className={nivel ? "sdb-sidenav__card sdb-sidenav__card--nivel" : "sdb-sidenav__card"}>
      {cabecalho}
      {children}
    </div>
  );
}
