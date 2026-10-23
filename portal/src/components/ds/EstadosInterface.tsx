"use client";

import type { Route } from "next";
import Link from "next/link";
import { type ReactNode, useId } from "react";
import { InterfaceIcon } from "./InterfaceIcon";

export type SimboloVolume = "pasta" | "historico" | "busca" | "livro" | "alerta" | "sucesso" | "escudo";
/** Camadas vetoriais e CSS: leve, escalável e independente de imagens raster. */
export function IconeVolume({ simbolo, pequeno = false }: { simbolo: SimboloVolume; pequeno?: boolean }) {
  return (
    <span
      className={`sdb-ui-volume ${pequeno ? "sdb-ui-volume-small" : ""}`}
      data-symbol={simbolo}
      aria-hidden="true"
    >
      <span className="sdb-ui-volume-back" />
      <span className="sdb-ui-volume-sheet">
        <i />
        <i />
      </span>
      <span className="sdb-ui-volume-front">
        <InterfaceIcon name={simbolo} />
      </span>
      <span className="sdb-ui-volume-seal">
        <span />
      </span>
    </span>
  );
}

export function EstadoSecao({
  simbolo,
  titulo,
  descricao,
  acao,
  compacto = false,
}: {
  simbolo: SimboloVolume;
  titulo: string;
  descricao: ReactNode;
  acao?: { rotulo: string; executar: () => void } | { rotulo: string; href: Route };
  compacto?: boolean;
}) {
  const id = useId();
  return (
    <section className={`sdb-ui-empty ${compacto ? "sdb-ui-empty-compact" : ""}`} aria-labelledby={id}>
      <IconeVolume simbolo={simbolo} />
      <h3 id={id}>{titulo}</h3>
      <p>{descricao}</p>
      {acao &&
        ("href" in acao ? (
          <Link className="sdb-ui-primary" href={acao.href}>
            {acao.rotulo}
            <InterfaceIcon name="seta" />
          </Link>
        ) : (
          <button className="sdb-ui-primary" type="button" onClick={acao.executar}>
            {acao.rotulo}
            <InterfaceIcon name="seta" />
          </button>
        ))}
    </section>
  );
}

/** Determinado somente por dados: nenhum timer fabrica porcentagens. */
export function ProgressoReal({
  concluidos,
  total,
  rotulo,
  unidade = "etapas concluídas",
}: {
  concluidos: number;
  total: number;
  rotulo: string;
  unidade?: string;
}) {
  const disponivel = Number.isFinite(total) && total > 0 && Number.isFinite(concluidos);
  const valor = disponivel ? Math.max(0, Math.min(concluidos, total)) : 0;
  const percentual = disponivel ? Math.round((valor / total) * 100) : 0;
  return (
    <div className="sdb-ui-progress">
      <div>
        <span>{rotulo}</span>
        <strong>{disponivel ? `${percentual}%` : "—"}</strong>
      </div>
      {disponivel ? (
        <progress value={valor} max={total} aria-label={rotulo}>
          {percentual}%
        </progress>
      ) : (
        <p>O progresso aparecerá quando houver etapas definidas.</p>
      )}
      {disponivel && (
        <small>
          {valor} de {total} {unidade}
        </small>
      )}
    </div>
  );
}

export function CarregamentoSala() {
  return (
    <div
      className="sdb-ui-loading sdb-ui-loading-panel"
      role="status"
      aria-label="Carregando conteúdo da sala"
      aria-busy="true"
    >
      <div aria-hidden="true">
        <div className="sdb-ui-skeleton-hero" />
        <div className="sdb-ui-skeleton-title" />
        <div className="sdb-ui-skeleton-line" />
        <div className="sdb-ui-skeleton-grid">
          {[1, 2, 3].map((n) => (
            <div key={n}>
              <span />
              <i />
              <i />
            </div>
          ))}
        </div>
      </div>
      <p>Preparando o conteúdo da sala…</p>
    </div>
  );
}

export function AvisoContextual({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="sdb-ui-notice">
      <IconeVolume simbolo="escudo" pequeno />
      <div>
        <strong>{titulo}</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}
