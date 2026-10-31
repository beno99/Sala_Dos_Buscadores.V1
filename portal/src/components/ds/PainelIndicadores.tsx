import type { CSSProperties } from "react";
import { cx } from "@/lib/cx";

export interface Indicador {
  rotulo: string;
  valor: number;
  /** Complemento do valor ("de 5"). */
  complemento?: string;
  /** 0 a 1; a barra é decorativa: o número e o texto carregam a informação. */
  progresso?: number;
  dica?: string;
}

/**
 * Painel agrupado (IndicadorNumerico › `.sdb-stats`) dentro do Painel de
 * progresso: progresso pessoal e privado, nunca ranking.
 */
export function PainelIndicadores({ rotulo, itens }: { rotulo: string; itens: Indicador[] }) {
  return (
    <div
      className={cx("sdb-stats", itens.length === 3 && "sdb-stats--3", itens.length === 2 && "sdb-stats--2")}
      role="group"
      aria-label={rotulo}
    >
      {itens.map((i) => (
        <div key={i.rotulo} className="sdb-stat">
          <span className="sdb-stat__label">{i.rotulo}</span>
          <span className="sdb-stat__value">
            {i.valor}
            {i.complemento && <small>{i.complemento}</small>}
          </span>
          {i.progresso !== undefined && (
            <span className="sdb-progress__track" aria-hidden="true">
              <i style={{ "--p": i.progresso } as CSSProperties} />
            </span>
          )}
          {i.dica && <p className="sdb-stat__hint">{i.dica}</p>}
        </div>
      ))}
    </div>
  );
}

export function PainelIndicadoresEsqueleto() {
  return (
    <div className="sdb-stats">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="sdb-stat">
          <span className="sdb-skel h-3 w-1/2" />
          <span className="sdb-skel h-8 w-1/4" />
          <span className="sdb-skel h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}
