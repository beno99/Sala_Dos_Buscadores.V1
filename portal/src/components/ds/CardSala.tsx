import type { Route } from "next";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { SalaResumo } from "@/data/repositorio";
import { NIVEL_ROTULO } from "@/data/rotulos";
import { cx } from "@/lib/cx";
import { formatarData, plural } from "@/lib/texto";
import { Arc } from "./Arc";
import { SeloProveniencia } from "./Selos";

/**
 * Porta de entrada de uma Sala (CardSala 1.0, RF-09): mídia com a foto (ou a
 * placa da marca com o arco), contagem sobre a imagem, nome, tradição, nível
 * predominante, data e a ação "Entrar na sala". No Portal, o progresso do
 * membro ocupa o lugar do nível e da data, e a etiqueta "Para ampliar o olhar"
 * marca a Sala sugerida fora do perfil declarado.
 */
export function CardSala({
  sala,
  progresso,
  ampliar,
  imagem,
  destaque,
  horizontal,
  acaoAreia,
  acoes,
}: {
  /** "Entrar na Sala" como botão marrom (cards do Portal, layout do Figma). */
  acaoAreia?: boolean;
  sala: SalaResumo;
  /** Progresso do membro: barra (0 a 1, decorativa) e legenda que carrega a informação. */
  progresso?: { pct: number; legenda: string };
  /** Sala fora do perfil declarado, sugerida para evitar bolha de conteúdo. */
  ampliar?: boolean;
  imagem?: string;
  /** Destaque: moldura e painel sólido sobre a imagem. */
  destaque?: boolean;
  /** Variante horizontal da biblioteca; vira vertical em telas pequenas. */
  horizontal?: boolean;
  /** Controles sobre a mídia (ex.: botão de salvar integrado à Estante). */
  acoes?: ReactNode;
}) {
  const id = `sala-${sala.slug}`;
  const ferramentas = (
    <div className="sala__tools">
      <div className="sala__chips">
        <span className="sala__count">{plural(sala.totalConteudos, "conteúdo", "conteúdos")}</span>
        {ampliar && <span className="sala__count">Para ampliar o olhar</span>}
      </div>
      {acoes}
    </div>
  );
  const corpo = (
    <div className="sala__body">
      <h3 className="sala__title" id={id}>
        {sala.nome}
      </h3>
      <p className="sala__description">{sala.tradicao}</p>
      {sala.origem === "anfitriao" && <SeloProveniencia tipo="anfitriao" compacto />}
      {progresso ? (
        <div className="sdb-progress">
          <span className="sdb-progress__track" aria-hidden="true">
            <i style={{ "--p": progresso.pct } as CSSProperties} />
          </span>
          <span className="sdb-progress__label">{progresso.legenda}</span>
        </div>
      ) : (
        <div className="sala__meta">
          <span className="sala__level" data-level={sala.nivelPredominante}>
            <span className="sala__steps" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            {NIVEL_ROTULO[sala.nivelPredominante]}
          </span>
          <span className="sala__date">
            Atualizada em <time dateTime={sala.atualizadaEm}>{formatarData(sala.atualizadaEm)}</time>
          </span>
        </div>
      )}
      <Link className="sala__action" href={`/salas/${sala.slug}` as Route}>
        Entrar na sala<span className="sdb-sr"> {sala.nome}</span>
        <svg viewBox="0 0 256 256" aria-hidden="true">
          <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
        </svg>
      </Link>
    </div>
  );

  return (
    <article
      className={cx(
        "sala",
        destaque ? "sala--destaque" : "sala--normal",
        horizontal && "sala--horizontal",
        acaoAreia && "sala--acao-areia",
      )}
      aria-labelledby={id}
    >
      <div className="sala__media">
        {imagem ? (
          // biome-ignore lint/performance/noImgElement: capa decorativa servida de public/imagens.
          <img className="sala__image" src={imagem} alt="" width={736} height={414} decoding="async" />
        ) : (
          <div className={`sala__placa sdb-plate--${sala.placa}`} aria-hidden="true">
            <Arc on={sala.placa} />
          </div>
        )}
        {ferramentas}
        {destaque && corpo}
      </div>
      {!destaque && corpo}
    </article>
  );
}

/** Esqueleto de carregamento do Card de Sala, na mesma geometria do card normal. */
export function CardSalaEsqueleto() {
  return (
    <div className="sala sala--normal" role="status" aria-busy="true" aria-label="Carregando Sala">
      <div className="sala__media sdb-skel" />
      <div className="sala__body">
        <div className="sdb-skel h-8 w-4/5" />
        <div className="sdb-skel h-4 w-3/5" />
      </div>
    </div>
  );
}
