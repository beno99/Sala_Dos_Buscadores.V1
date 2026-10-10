import type { Route } from "next";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { salaPorSlug } from "@/data/catalogo";
import { TIPO_ROTULO } from "@/data/rotulos";
import type { Conteudo } from "@/data/types";
import { Arc } from "./Arc";
import { Icon } from "./Icon";
import { SeloProveniencia } from "./Selos";

const hrefDo = (c: Conteudo) => `/salas/${c.sala}/${c.slug}` as Route;

/** Lista em linhas (ListaConteudos › `.sdb-rows`): sem card, um link por linha. */
export function ListaLinhas({ children }: { children: ReactNode }) {
  return <ul className="sdb-rows">{children}</ul>;
}

/** Linha de conteúdo: título, meta, Selo de proveniência compacto (obrigatório) e chevron. */
export function LinhaConteudo({ conteudo, meta }: { conteudo: Conteudo; meta: string }) {
  return (
    <li>
      <Link className="sdb-rows__link" href={hrefDo(conteudo)}>
        <span className="sdb-rows__text">
          <span className="sdb-rows__title">{conteudo.titulo}</span>
          <span className="sdb-rows__meta">{meta}</span>
        </span>
        <SeloProveniencia tipo={conteudo.proveniencia} compacto />
        <Icon name="chevronDireita" className="sdb-rows__go" />
      </Link>
    </li>
  );
}

/** Linha final da lista ("Ver tudo na Biblioteca"). */
export function LinhaMais({ href, children }: { href: Route; children: ReactNode }) {
  return (
    <li>
      <Link className="sdb-rows__link sdb-rows__link--more" href={href}>
        <span className="sdb-rows__text">{children}</span>
        <Icon name="chevronDireita" className="sdb-rows__go" />
      </Link>
    </li>
  );
}

/**
 * Item compacto (ListaConteudos › `.sdb-entry`): miniatura concêntrica, tipo e
 * Sala, título (o link cobre o item), progresso opcional e a ação.
 */
export function ItemCompacto({
  conteudo,
  imagem,
  progresso,
  acao,
}: {
  conteudo: Conteudo;
  imagem?: string;
  /** 0 a 100: mostra a barra e "Lido até N%". */
  progresso?: number;
  acao: string;
}) {
  const sala = salaPorSlug(conteudo.sala);
  const placa = sala?.placa ?? "bordo";
  return (
    <div className="sdb-entry">
      <div className="sdb-entry__thumb">
        {imagem ? (
          // biome-ignore lint/performance/noImgElement: miniatura decorativa servida de public/.
          <img src={imagem} alt="" />
        ) : (
          <div className={`sdb-plate sdb-plate--${placa}`}>
            <Arc on={placa} />
          </div>
        )}
      </div>
      <div className="sdb-entry__body">
        <span className="sdb-entry__where">
          {TIPO_ROTULO[conteudo.tipo]} · {sala?.nome}
        </span>
        <h4 className="sdb-entry__title">
          <Link className="sdb-entry__link" href={hrefDo(conteudo)}>
            {conteudo.titulo}
          </Link>
        </h4>
        {progresso !== undefined && (
          <div className="sdb-entry__progress">
            <span className="sdb-progress__track" aria-hidden="true">
              <i style={{ "--p": progresso / 100 } as CSSProperties} />
            </span>
            Lido até {progresso}%
          </div>
        )}
        <span className="sdb-resume-cta">
          {acao}
          <Icon name="seta" />
        </span>
      </div>
    </div>
  );
}
