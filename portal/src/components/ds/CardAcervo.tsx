import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Nivel, Placa, Proveniencia } from "@/data/types";
import { Arc } from "./Arc";
import { SeloNivel, SeloProveniencia } from "./Selos";

/**
 * Card de conteúdo com imagem (CardConteudo › `.sala--conteudo.sala--normal.sala--acervo`):
 * imagem 16:10 com o chip do tipo e o slot de salvar; no corpo, a Sala, o
 * título (o link cobre o card), nível, duração e o Selo de proveniência.
 * `externo` abre em nova aba (vídeo no YouTube). Sem `href`, o card não vira
 * link e mostra a `nota` (ex.: link do episódio ainda não cadastrado).
 */
export function CardAcervo({
  id,
  tipo,
  onde,
  titulo,
  href,
  externo,
  nota,
  nivel,
  duracao,
  duracaoExtenso,
  proveniencia,
  imagem,
  placa,
  acoes,
}: {
  id: string;
  tipo: string;
  onde: string;
  titulo: string;
  href?: string;
  externo?: boolean;
  nota?: string;
  nivel: Nivel;
  /** "11 min" ou "24:10". */
  duracao: string;
  /** Rótulo lido pelo leitor de tela no lugar de `duracao`, quando ela é mm:ss. */
  duracaoExtenso?: string;
  proveniencia: Proveniencia;
  imagem?: string;
  placa: Placa;
  /** Controles sobre a imagem, como o botão .sala__save da Estante. */
  acoes?: ReactNode;
}) {
  const notaId = `${id}-nota`;
  return (
    <article className="sala sala--conteudo sala--normal sala--acervo" aria-labelledby={id}>
      <div className="sala__media">
        {imagem ? (
          // biome-ignore lint/performance/noImgElement: imagem decorativa servida de public/imagens.
          <img className="sala__image" src={imagem} alt="" decoding="async" />
        ) : (
          <div className={`sala__placa sdb-plate--${placa}`} aria-hidden="true">
            <Arc on={placa} />
          </div>
        )}
        <div className="sala__tools">
          <div className="sala__chips">
            <span className="sala__count">{tipo}</span>
          </div>
          {acoes}
        </div>
      </div>
      <div className="sala__body">
        <p className="sala__onde">{onde}</p>
        <h3 className="sala__title" id={id}>
          {!href ? (
            <span aria-describedby={nota ? notaId : undefined}>{titulo}</span>
          ) : externo ? (
            <a className="sala__link" href={href} target="_blank" rel="noopener noreferrer">
              {titulo}
              <span className="sdb-sr"> (abre em nova aba)</span>
            </a>
          ) : (
            <Link className="sala__link" href={href as Route}>
              {titulo}
            </Link>
          )}
        </h3>
        <div className="sala__info">
          <SeloNivel nivel={nivel} plain />
          <span className="sala__dur">
            <svg viewBox="0 0 256 256" aria-hidden="true">
              <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z" />
            </svg>
            {duracaoExtenso ? (
              <>
                <span aria-hidden="true">{duracao}</span>
                <span className="sdb-sr">Duração: {duracaoExtenso}</span>
              </>
            ) : (
              duracao
            )}
          </span>
        </div>
        <SeloProveniencia tipo={proveniencia} />
        {!href && nota && (
          <p id={notaId} className="sdb-footnote m-0">
            {nota}
          </p>
        )}
      </div>
    </article>
  );
}
