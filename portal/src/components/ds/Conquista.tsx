import { cx } from "@/lib/cx";
import { formatarData } from "@/lib/texto";
import { Icon, type IconName } from "./Icon";

export interface ConquistaVisual {
  id: string;
  nome: string;
  criterio: string;
  feito: string;
  icone: IconName;
  obtida: boolean;
  em?: string;
  parcial?: { atual: number; alvo: number };
}

/** Conquista em linha de lista: emblema de ouro (obtida) ou cadeado com o critério (bloqueada). */
export function ConquistaLinha({ c }: { c: ConquistaVisual }) {
  return (
    <div className={cx("sdb-achv sdb-achv--row", !c.obtida && "is-locked")}>
      <span className="sdb-achv__emblem" aria-hidden="true">
        <Icon name={c.obtida ? c.icone : "cadeado"} />
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
            <Icon name={c.icone} />
          </span>
        </span>
      ))}
    </div>
  );
}
