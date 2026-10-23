import type { Route } from "next";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { salaPorSlug, temaPorSlug } from "@/data/catalogo";
import { TIPO_ROTULO } from "@/data/rotulos";
import type { Conteudo, TipoConteudo } from "@/data/types";
import { cx } from "@/lib/cx";
import { formatarData } from "@/lib/texto";
import { Arc } from "./Arc";
import { Icon, type IconName } from "./Icon";
import { SeloNivel, SeloProveniencia } from "./Selos";

const ICONE_TIPO: Record<TipoConteudo, IconName> = {
  artigo: "artigo",
  "fonte-primaria": "fontePrimaria",
  verbete: "glossario",
  video: "video",
};

/** Resumo de um conteúdo com tipo, Sala, título, tema, nível, autoria e procedência (CardConteudo). */
export function CardConteudo({
  conteudo,
  titleAs: Titulo = "h3",
  empilhado,
  acoes,
}: {
  conteudo: Conteudo;
  titleAs?: "h2" | "h3";
  empilhado?: boolean;
  /** Botão de Estante com .sdb-over, acima do link do card. */
  acoes?: ReactNode;
}) {
  const sala = salaPorSlug(conteudo.sala);
  const card = (
    <article className="sdb-card sdb-card--interactive">
      <div className="sdb-card__body">
        <div className="sdb-content__top">
          <span className="sdb-content__type">
            <Icon name={ICONE_TIPO[conteudo.tipo]} />
          </span>
          <div className="sdb-content__where">
            <b>
              {TIPO_ROTULO[conteudo.tipo]} · {conteudo.duracaoMin} min
            </b>
            <span>{sala?.nome}</span>
          </div>
          {acoes}
        </div>
        <Titulo className="sdb-content__title">
          <Link className="sdb-card__link" href={`/salas/${conteudo.sala}/${conteudo.slug}` as Route}>
            {conteudo.titulo}
          </Link>
        </Titulo>
        <p className="sdb-content__excerpt sdb-clamp-3">{conteudo.resumo}</p>
        <div className="sdb-row" style={{ gap: 8 }}>
          {conteudo.temas.slice(0, 2).map((t) => (
            <span key={t} className="sdb-badge sdb-badge--neutral">
              {temaPorSlug(t)?.nome}
            </span>
          ))}
          <SeloNivel nivel={conteudo.nivel} />
        </div>
      </div>
      <div className="sdb-card__foot">
        <p className="sdb-author">
          <b>{conteudo.autoria.nome}</b> · {conteudo.autoria.credencial}
        </p>
        <SeloProveniencia tipo={conteudo.proveniencia} />
      </div>
    </article>
  );
  return empilhado ? <div className="sdb-stack">{card}</div> : card;
}

/** Card de conteúdo em linha: miniatura, progresso ou nível e procedência. */
export function CardConteudoLinha({
  conteudo,
  imagem,
  progresso,
  acao = "Retomar leitura",
  titleAs: Titulo = "h3",
}: {
  conteudo: Conteudo;
  imagem?: string;
  /** Percentual de leitura de 0 a 100. */
  progresso?: number;
  acao?: string;
  titleAs?: "h2" | "h3" | "h4";
}) {
  const sala = salaPorSlug(conteudo.sala);
  const placa = sala?.placa ?? "bordo";
  const percentual = progresso === undefined ? undefined : Math.max(0, Math.min(100, progresso));
  return (
    <article className="sdb-card sdb-card--row sdb-card--interactive">
      <div className={cx("sdb-plate overflow-hidden", `sdb-plate--${placa}`)} aria-hidden="true">
        {imagem ? (
          // biome-ignore lint/performance/noImgElement: miniatura decorativa servida de public/imagens.
          <img className="h-full w-full object-cover" src={imagem} alt="" loading="lazy" decoding="async" />
        ) : (
          <Arc on={placa} />
        )}
      </div>
      <div className="sdb-card__body">
        <div className="sdb-content__where">
          <b>
            {TIPO_ROTULO[conteudo.tipo]} · {sala?.nome}
          </b>
          <span>
            {percentual === undefined ? (
              <>
                Publicado em <time dateTime={conteudo.publicadoEm}>{formatarData(conteudo.publicadoEm)}</time>
              </>
            ) : (
              `Lido até ${percentual}%`
            )}
          </span>
        </div>
        <Titulo className="sdb-content__title">
          <Link className="sdb-card__link" href={`/salas/${conteudo.sala}/${conteudo.slug}` as Route}>
            {conteudo.titulo}
          </Link>
        </Titulo>
        {percentual !== undefined && (
          <span className="sdb-progress__track" aria-hidden="true">
            <i style={{ "--p": percentual / 100 } as CSSProperties} />
          </span>
        )}
        <div className="sdb-card__actions">
          {percentual !== undefined ? (
            <span className="sdb-resume-cta">
              {acao}
              <Icon name="seta" />
            </span>
          ) : (
            <SeloNivel nivel={conteudo.nivel} plain />
          )}
          <SeloProveniencia tipo={conteudo.proveniencia} />
        </div>
      </div>
    </article>
  );
}
