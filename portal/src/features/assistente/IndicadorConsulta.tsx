"use client";

import { type CSSProperties, useEffect, useState } from "react";
import { Button } from "@/components/ds/Button";
import { Icon } from "@/components/ds/Icon";
import { cx } from "@/lib/cx";
import { formatarSegundos } from "@/lib/texto";
import type { EstadoTurno } from "./ConversaProvider";
import { ETAPAS, rotuloEtapa } from "./motor";

const STATUS: Record<EstadoTurno, string> = {
  consultando: "Consultando o acervo",
  concluida: "Consulta concluída",
  interrompida: "Consulta interrompida",
  erro: "Erro: a consulta não terminou",
};

interface IndicadorConsultaProps {
  pergunta: string;
  estado: EstadoTurno;
  etapa: number;
  inicio: number;
  fim?: number;
  salas: number;
  trechos: number;
  onInterromper: () => void;
}

/** Mostra que o assistente está consultando o acervo, há quanto tempo e em que etapa (IndicadorConsulta). */
export function IndicadorConsulta({
  pergunta,
  estado,
  etapa,
  inicio,
  fim,
  salas,
  trechos,
  onInterromper,
}: IndicadorConsultaProps) {
  const rodando = estado === "consultando";
  const [agora, setAgora] = useState(inicio);

  useEffect(() => {
    if (!rodando) return;
    let quadro = requestAnimationFrame(function tick() {
      setAgora(Date.now());
      quadro = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(quadro);
  }, [rodando]);

  const decorrido = (fim ?? (rodando ? agora : inicio)) - inicio;
  const feitas = Math.min(etapa, ETAPAS.length);

  return (
    <section
      className={cx("sdb-consult", rodando && "is-running", estado === "erro" && "is-error")}
      aria-label="Consulta ao acervo"
    >
      <div className="sdb-consult__head">
        <span className="sdb-consult__stairs" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
        <b className="sdb-headline">Assistente de IA</b>
        <span className="sdb-consult__status" role="status">
          <span>{STATUS[estado]}</span>
          <i className="sdb-consult__dot" />
        </span>
      </div>
      <div className="sdb-consult__rail" aria-hidden="true">
        <i style={{ "--p": feitas / ETAPAS.length } as CSSProperties} />
      </div>
      <div className="sdb-consult__box">
        <div className="sdb-consult__q">
          {pergunta}
          <span>
            {feitas} / {ETAPAS.length}
          </span>
        </div>
        <ol className="sdb-consult__steps">
          {ETAPAS.map((e, i) => {
            const feita = i < etapa;
            const atual = rodando && i === etapa;
            return (
              <li key={e} className={cx(feita && "is-done", atual && "is-active")}>
                <span className="sdb-mark">
                  {feita ? (
                    <Icon name="check" />
                  ) : atual ? (
                    <span className="sdb-spinner" style={{ width: 16, height: 16 }} />
                  ) : null}
                </span>
                {rotuloEtapa(e, salas, trechos)}
                {feita && <span className="sdb-sr"> (concluída)</span>}
              </li>
            );
          })}
        </ol>
      </div>
      <div className="sdb-consult__foot">
        <span className="sdb-consult__time">{formatarSegundos(decorrido)}</span>
        <span className="sdb-footnote">
          · {trechos} trechos · {salas} {salas === 1 ? "Sala" : "Salas"}
        </span>
        {rodando && (
          <Button variant="secondary" size="sm" iconEnd="fechar" onClick={onInterromper}>
            Interromper
          </Button>
        )}
      </div>
    </section>
  );
}
