import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import type { SalaResumo } from "@/data/repositorio";
import { cx } from "@/lib/cx";
import { formatarData, plural } from "@/lib/texto";
import { Arc } from "./Arc";
import { ImagemAcervo } from "./ImagemAcervo";
import { SeloNivel, SeloProveniencia } from "./Selos";

/**
 * Porta de entrada de uma Sala (CardSala 1.1, RF-09): imagem ocupando o fundo
 * (ou a placa da marca com o arco), contagem e salvar no topo e painel de
 * vidro escuro com nome, tradição, nível predominante, data e "Entrar na
 * Sala". No Portal, o progresso de estudo ocupa o lugar do nível e da data, e
 * a etiqueta "Para ampliar o olhar" marca a Sala sugerida fora do perfil.
 */
export function CardSala({
  sala,
  progresso,
  ampliar,
  imagem,
  horizontal,
  acoes,
}: {
  sala: SalaResumo;
  /** Estudo da Sala: conteúdos concluídos / total (0 a 1, valor exato) e a legenda da contagem. */
  progresso?: { pct: number; legenda: string };
  /** Sala fora do perfil declarado, sugerida para evitar bolha de conteúdo. */
  ampliar?: boolean;
  imagem?: string;
  /** Formato horizontal da biblioteca; vira vertical em telas pequenas. */
  horizontal?: boolean;
  /** Controles sobre a mídia (ex.: botão de salvar integrado à Estante). */
  acoes?: ReactNode;
}) {
  const id = `sala-${sala.slug}`;
  const pct = progresso ? Math.round(progresso.pct * 100) : 0;

  return (
    <article className={cx("sala", horizontal && "sala--horizontal")} aria-labelledby={id}>
      <div className="sala__media">
        {imagem ? (
          <ImagemAcervo className="sala__image" src={imagem} placa={sala.placa} />
        ) : (
          <div className={`sala__placa sdb-plate--${sala.placa}`} aria-hidden="true">
            <Arc on={sala.placa} />
          </div>
        )}
        <div className="sala__tools">
          <div className="sala__chips">
            <span className="sala__count">{plural(sala.totalConteudos, "conteúdo", "conteúdos")}</span>
            {ampliar && <span className="sala__count">Para ampliar o olhar</span>}
          </div>
          {acoes}
        </div>
        <div className="sala__body" data-theme="solido-escuro">
          <h3 className="sala__title" id={id}>
            {sala.nome}
          </h3>
          <p className="sala__description">{sala.tradicao}</p>
          {sala.origem === "anfitriao" && <SeloProveniencia tipo="anfitriao" compacto />}
          {progresso ? (
            <div className="sala__progress">
              <div className="sala__progress-heading">
                <label htmlFor={`${id}-progresso`}>Estudo da sala</label>
                <strong aria-hidden="true">{pct}%</strong>
              </div>
              <progress
                className="sala__progress-bar"
                id={`${id}-progresso`}
                value={progresso.pct}
                max={1}
                aria-label={`Progresso de estudo de ${sala.nome}`}
                aria-valuetext={`${pct}% estudado · ${progresso.legenda}`}
              >
                {pct}%
              </progress>
              <span className="sala__progress-caption">{progresso.legenda}</span>
            </div>
          ) : (
            <div className="sala__meta">
              <SeloNivel nivel={sala.nivelPredominante} />
              <span className="sala__date">
                Atualizada em <time dateTime={sala.atualizadaEm}>{formatarData(sala.atualizadaEm)}</time>
              </span>
            </div>
          )}
          <Link className="sdb-btn sdb-btn--primary sala__action" href={`/salas/${sala.slug}` as Route}>
            Entrar na Sala<span className="sdb-sr"> {sala.nome}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 12h15m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}

/** Esqueleto de carregamento do Card de Sala, na mesma geometria do card. */
export function CardSalaEsqueleto() {
  return (
    <div className="sala" role="status" aria-busy="true" aria-label="Carregando Sala">
      <div className="sala__media sdb-skel" />
    </div>
  );
}
