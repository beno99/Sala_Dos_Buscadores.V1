import type { CSSProperties } from "react";
import type { Nivel } from "@/data/types";
import { SeloNivel } from "./Selos";

/** Selo de nível com progresso (SeloNivel › `.sdb-levelup`): nível num assunto, contado em leituras. */
export function SeloNivelProgresso({
  nivel,
  assunto,
  degraus,
  quantoFalta,
}: {
  nivel: Nivel;
  assunto: string;
  degraus: [number, number, number];
  quantoFalta: string;
}) {
  return (
    <div className="sdb-levelup">
      <div className="sdb-levelup__head">
        <SeloNivel nivel={nivel} />
        <span>em {assunto}</span>
      </div>
      <div className="sdb-levelup__steps" aria-hidden="true">
        {degraus.map((p, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: três degraus fixos.
          <i key={i} style={{ "--p": p } as CSSProperties} />
        ))}
      </div>
      <p className="sdb-levelup__hint">{quantoFalta}</p>
    </div>
  );
}
