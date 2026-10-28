import type { CSSProperties } from "react";
import { arteDaConquista, coresDaConquista } from "@/features/conquistas/paletas";
import "@/features/conquistas/conquistas.css";
import { cx } from "@/lib/cx";
import { formatarData } from "@/lib/texto";
import { EsferaConquista } from "./EsferaConquista";
import { Icon, type IconName } from "./Icon";

export interface ConquistaVisual {
  id: string;
  nome: string;
  criterio: string;
  feito: string;
  icone: IconName;
  obtida: boolean;
  disponibilidade?: "em-breve";
  indisponibilidade?: string;
  em?: string;
  parcial?: { atual: number; alvo: number };
}

/**
 * Card de Conquista (Conquista 1.1): sempre escuro, em qualquer tema, com a
 * esfera de vidro da gema. O degradê do topo acompanha a gema e termina antes
 * do título; bloqueada, fica cinza. O estado vem em texto e ícone.
 */
export function CardConquista({ c, numero }: { c: ConquistaVisual; numero: number }) {
  const arte = arteDaConquista(c.id);
  const estado = c.obtida ? "Obtida" : c.disponibilidade === "em-breve" ? "Em breve" : "Bloqueada";
  const rodape = c.obtida
    ? c.em
      ? `Obtida em ${formatarData(c.em.slice(0, 10))}`
      : "Conquista obtida"
    : c.disponibilidade === "em-breve"
      ? "Atividade em breve"
      : `${c.criterio}${c.parcial ? ` · ${c.parcial.atual} de ${c.parcial.alvo}` : ""}`;
  return (
    <article
      data-theme="solido-escuro"
      className={cx("sdb-badge-card", c.obtida ? "is-earned" : "is-locked")}
      style={
        {
          "--badge-deep": arte.colors[2],
          "--badge-color": arte.colors[0],
          ...(arte.bicolor ? { "--badge-color-end": arte.colors[1] } : {}),
        } as CSSProperties
      }
    >
      <div className="sdb-badge-card__visual">
        <div className="sdb-badge-card__top">
          <span>{String(numero).padStart(2, "0")}</span>
          <span className="sdb-badge-card__state">
            <Icon name={c.obtida ? "check" : "cadeado"} />
            {estado}
          </span>
        </div>
        <EsferaConquista id={c.id} nome={c.nome} obtida={c.obtida} />
      </div>
      <div className="sdb-badge-card__body">
        <h3 className="sdb-badge-card__name">{c.nome}</h3>
        <p className="sdb-badge-card__gem">{arte.gema}</p>
        <p className="sdb-badge-card__foot">{rodape}</p>
      </div>
    </article>
  );
}

/** Conquista em linha de lista: emblema de ouro (obtida) ou cadeado com o critério (bloqueada). */
export function ConquistaLinha({ c }: { c: ConquistaVisual }) {
  return (
    <div className={cx("sdb-achv sdb-achv--row", !c.obtida && "is-locked")}>
      <span className="sdb-achv__emblem" aria-hidden="true">
        <span className="sdb-cosmos-mini" style={coresDaConquista(c.id)} />
      </span>
      <span className="sdb-achv__name">
        {c.nome}
        <span className="sdb-sr">{c.obtida ? ", obtida" : ", bloqueada"}</span>
      </span>
      <p className="sdb-achv__crit">
        {c.obtida ? c.feito : c.criterio}
        {c.parcial && ` · ${c.parcial.atual} de ${c.parcial.alvo}`}
      </p>
      {c.obtida && c.em && <span className="sdb-achv__when">{formatarData(c.em.slice(0, 10))}</span>}
    </div>
  );
}

/** Emblemas pequenos das conquistas obtidas, com o nome no tooltip. */
export function ConquistasMini({ lista }: { lista: ConquistaVisual[] }) {
  const obtidas = lista.filter((c) => c.obtida);
  if (obtidas.length === 0) return null;
  return (
    <div
      className="sdb-achvs"
      role="img"
      aria-label={`Conquistas obtidas: ${obtidas.map((c) => c.nome).join(", ")}`}
    >
      {obtidas.map((c) => (
        <span key={c.id} className="sdb-achv sdb-achv--mini" data-tip={c.nome}>
          <span className="sdb-achv__emblem">
            <span className="sdb-cosmos-mini" style={coresDaConquista(c.id)} />
          </span>
        </span>
      ))}
    </div>
  );
}
